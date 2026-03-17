import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Express } from 'express';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    categoryId?: string;
    search?: string;
    isFeatured?: boolean;
    allowCredit?: boolean;
    showInactive?: boolean;
  }) {
    const { skip = 0, take = 20, categoryId, search, isFeatured, allowCredit, showInactive } = params;
    
    const where: any = {};
    if (!showInactive) {
      where.isActive = true;
    }
    
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured) where.isFeatured = true;
    if (allowCredit !== undefined) where.allowCredit = allowCredit;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take,
          include: {
            category: true,
            brand: true,
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            inventory: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.product.count({ where }),
      ]);
      return { data: products, meta: { total, skip, take } };
    } catch (e) {
      console.error('Failed to load products due to DB corruption:', e.message);
      // Fallback: load products without including corrupted Brand data
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take,
          include: {
            category: true,
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            inventory: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.product.count({ where }),
      ]);
      return { data: products, meta: { total, skip, take } };
    }
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        inventory: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
        productRelations: {
          include: { related: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        inventory: true,
        productRelations: {
          include: { related: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getFeaturedProducts(take = 10) {
    return this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFlashSaleProducts() {
    const now = new Date();
    return this.prisma.product.findMany({
      where: {
        isFlashSale: true,
        isActive: true,
        flashSaleEnd: { gt: now },
      },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        inventory: true,
      },
    });
  }

  async getGroupedProducts(isFeatured?: boolean, allowCredit?: boolean) {
    const products = await this.prisma.product.findMany({
      where: { 
        isActive: true,
        ...(isFeatured !== undefined ? { isFeatured } : {}),
        ...(allowCredit !== undefined ? { allowCredit } : {})
      },
      include: { 
        images: true, 
        category: true, 
        brand: true 
      },
      orderBy: [
        { category: { name: 'asc' } },
        { brand: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const grouped: any[] = [];

    products.forEach(product => {
      const category = product.category;
      const brand = (product as any).brand || { id: 0, name: 'Other', slug: 'other' };

      let categoryGroup = grouped.find(g => g.id === category.id);
      if (!categoryGroup) {
        categoryGroup = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          brands: []
        };
        grouped.push(categoryGroup);
      }

      let brandGroup = categoryGroup.brands.find((b: any) => b.id === brand.id);
      if (!brandGroup) {
        brandGroup = {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          products: []
        };
        categoryGroup.brands.push(brandGroup);
      }

      brandGroup.products.push(product);
    });

    return grouped;
  }

  private toSlug(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(data: CreateProductDto) {
    const name = data.name.trim();
    const baseSlug = this.toSlug(name);
    let slug = baseSlug;
    let i = 2;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const categorySlug = data.categorySlug?.trim().toLowerCase() || 'general';
    const brandSlug = data.brandSlug?.trim().toLowerCase();

    const category = await this.prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: categorySlug, isActive: true },
    });

    let brandId: number | undefined = data.brandId;
    if (!brandId && brandSlug) {
      const brand = await this.prisma.brand.upsert({
        where: { slug: brandSlug },
        update: {},
        create: { name: brandSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: brandSlug },
      });
      brandId = brand.id;
    }

    const product = await this.prisma.product.create({
      data: {
        name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription ?? data.description,
        price: data.price,
        sku: data.sku,
        categoryId: category.id,
        brandId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        allowCredit: data.allowCredit ?? false,
        creditMinimum: data.creditMinimum ?? null,
        creditMessage: data.creditMessage ?? null,
        deliveryInfo: data.deliveryInfo ?? null,
        warrantyInfo: data.warrantyInfo ?? null,
        isNew: data.isNew ?? true,
        discountPercentage: data.discountPercentage ?? null,
        stockTotal: data.stockTotal ?? 0,
        stockCurrent: data.stockCurrent ?? 0,
        hasFiveYearGuarantee: data.hasFiveYearGuarantee ?? false,
        hasFreeReturns: data.hasFreeReturns ?? false,
        hasInstallmentOptions: data.hasInstallmentOptions ?? false,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        wholesalePrice: data.wholesalePrice ?? null,
        specifications: data.specifications ? JSON.stringify(data.specifications) : null,
      },
    });

    if (data.upsellProductId) {
      await this.prisma.productRelation.create({
        data: {
          productId: product.id,
          relatedId: String(data.upsellProductId),
          relationType: 'upsell',
        },
      });
    }

    const imgs = Array.isArray(data.imageDataUrls) ? data.imageDataUrls : [];
    for (let idx = 0; idx < imgs.length; idx++) {
      const url = imgs[idx];
      if (typeof url !== 'string' || !url.startsWith('data:image')) continue;
      await this.prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          alt: product.name,
          isPrimary: idx === 0,
          sortOrder: idx,
        },
      });
    }

    await this.prisma.inventory.create({
      data: {
        productId: product.id,
        stock: 0,
        reservedStock: 0,
      },
    });

    return this.findById(product.id);
  }

  async createWithFiles(data: CreateProductDto, files: Express.Multer.File[]) {
    const name = data.name.trim();
    const baseSlug = this.toSlug(name);
    let slug = baseSlug;
    let i = 2;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const categorySlug = data.categorySlug?.trim().toLowerCase() || 'general';
    const brandSlug = data.brandSlug?.trim().toLowerCase();

    const category = await this.prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: categorySlug, isActive: true },
    });

    let brandId: number | undefined = data.brandId;
    if (!brandId && brandSlug) {
      const brand = await this.prisma.brand.upsert({
        where: { slug: brandSlug },
        update: {},
        create: { name: brandSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: brandSlug },
      });
      brandId = brand.id;
    }

    const product = await this.prisma.product.create({
      data: {
        name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription ?? data.description,
        price: data.price,
        sku: data.sku,
        categoryId: category.id,
        brandId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        allowCredit: data.allowCredit ?? false,
        creditMinimum: data.creditMinimum ?? null,
        creditMessage: data.creditMessage ?? null,
        deliveryInfo: data.deliveryInfo ?? null,
        warrantyInfo: data.warrantyInfo ?? null,
        isNew: data.isNew ?? true,
        discountPercentage: data.discountPercentage ?? null,
        stockTotal: data.stockTotal ?? 0,
        stockCurrent: data.stockCurrent ?? 0,
        hasFiveYearGuarantee: data.hasFiveYearGuarantee ?? false,
        hasFreeReturns: data.hasFreeReturns ?? false,
        hasInstallmentOptions: data.hasInstallmentOptions ?? false,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        wholesalePrice: data.wholesalePrice ?? null,
        specifications: data.specifications ? JSON.stringify(data.specifications) : null,
      },
    });

    if (data.upsellProductId) {
      await this.prisma.productRelation.create({
        data: {
          productId: product.id,
          relatedId: String(data.upsellProductId),
          relationType: 'upsell',
        },
      });
    }

    for (let idx = 0; idx < files.length; idx++) {
      const f = files[idx];
      if (!f || !f.buffer || !f.mimetype) continue;
      const dataUrl = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
      await this.prisma.productImage.create({
        data: {
          productId: product.id,
          url: dataUrl,
          alt: product.name,
          isPrimary: idx === 0,
          sortOrder: idx,
        },
      });
    }

    await this.prisma.inventory.create({
      data: {
        productId: product.id,
        stock: 0,
        reservedStock: 0,
      },
    });

    return this.findById(product.id);
  }

  async update(id: string, data: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    let slug: string | undefined = undefined;
    if (typeof data.slug === 'string' && data.slug.trim()) {
      const desired = this.toSlug(data.slug);
      if (desired !== existing.slug) {
        let s = desired;
        let i = 2;
        while (await this.prisma.product.findUnique({ where: { slug: s } })) {
          s = `${desired}-${i++}`;
        }
        slug = s;
      }
    } else if (typeof data.name === 'string' && data.name.trim()) {
      const desired = this.toSlug(data.name);
      if (desired !== existing.slug) {
        let s = desired;
        let i = 2;
        while (await this.prisma.product.findUnique({ where: { slug: s } })) {
          s = `${desired}-${i++}`;
        }
        slug = s;
      }
    }

    let categoryId: string | undefined;
    if (typeof data.categorySlug === 'string' && data.categorySlug.trim()) {
      const cslug = data.categorySlug.trim().toLowerCase();
      const cat = await this.prisma.category.upsert({
        where: { slug: cslug },
        update: {},
        create: { name: cslug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: cslug, isActive: true },
      });
      categoryId = cat.id;
    }
    let brandId: number | null | undefined = data.brandId;
    if (brandId === undefined && data.brandSlug !== undefined) {
      const bslug = (data.brandSlug || '').trim().toLowerCase();
      if (bslug) {
        const brand = await this.prisma.brand.upsert({
          where: { slug: bslug },
          update: {},
          create: { name: bslug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: bslug },
        });
        brandId = brand.id;
      } else {
        brandId = null;
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name?.trim() || undefined,
        slug: slug ?? undefined,
        description: data.description ?? undefined,
        shortDescription: data.shortDescription ?? undefined,
        price: data.price ?? undefined,
        isActive: typeof data.isActive === 'boolean' ? data.isActive : undefined,
        isFeatured: typeof data.isFeatured === 'boolean' ? data.isFeatured : undefined,
        allowCredit: typeof data.allowCredit === 'boolean' ? data.allowCredit : undefined,
        creditMinimum: typeof data.creditMinimum === 'number' ? data.creditMinimum : undefined,
        creditMessage: data.creditMessage !== undefined ? data.creditMessage : undefined,
        deliveryInfo: data.deliveryInfo !== undefined ? data.deliveryInfo : undefined,
        warrantyInfo: data.warrantyInfo !== undefined ? data.warrantyInfo : undefined,
        isNew: typeof data.isNew === 'boolean' ? data.isNew : undefined,
        discountPercentage: typeof data.discountPercentage === 'number' ? data.discountPercentage : undefined,
        stockTotal: typeof data.stockTotal === 'number' ? data.stockTotal : undefined,
        stockCurrent: typeof data.stockCurrent === 'number' ? data.stockCurrent : undefined,
        hasFiveYearGuarantee: typeof data.hasFiveYearGuarantee === 'boolean' ? data.hasFiveYearGuarantee : undefined,
        hasFreeReturns: typeof data.hasFreeReturns === 'boolean' ? data.hasFreeReturns : undefined,
        hasInstallmentOptions: typeof data.hasInstallmentOptions === 'boolean' ? data.hasInstallmentOptions : undefined,
        rating: typeof data.rating === 'number' ? data.rating : undefined,
        reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : undefined,
        wholesalePrice: typeof data.wholesalePrice === 'number' ? data.wholesalePrice : undefined,
        categoryId: categoryId ?? undefined,
        brandId: brandId,
        specifications: data.specifications ? JSON.stringify(data.specifications) : undefined,
      },
    });

    if (data.upsellProductId) {
      // Clear existing upsells and add new one (simple implementation for now)
      await this.prisma.productRelation.deleteMany({
        where: { productId: id, relationType: 'upsell' },
      });
      await this.prisma.productRelation.create({
        data: {
          productId: id,
          relatedId: String(data.upsellProductId),
          relationType: 'upsell',
        },
      });
    }

    if (Array.isArray(data.imageDataUrls)) {
      if (data.replaceImages !== false) {
        await this.prisma.productImage.deleteMany({ where: { productId: id } });
      }
      for (let idx = 0; idx < data.imageDataUrls.length; idx++) {
        const url = data.imageDataUrls[idx];
        if (typeof url !== 'string' || !url.startsWith('data:image')) continue;
        await this.prisma.productImage.create({
          data: {
            productId: id,
            url,
            alt: updated.name,
            isPrimary: idx === 0,
            sortOrder: idx,
          },
        });
      }
    }

    return this.findById(id);
  }

  async updateWithFiles(id: string, data: UpdateProductDto, files: Express.Multer.File[]) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    const res = await this.update(id, data);

    if (Array.isArray(files) && files.length > 0) {
      if (data.replaceImages !== false) {
        await this.prisma.productImage.deleteMany({ where: { productId: id } });
      }
      for (let idx = 0; idx < files.length; idx++) {
        const f = files[idx];
        if (!f || !f.buffer || !f.mimetype) continue;
        const dataUrl = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
        await this.prisma.productImage.create({
          data: {
            productId: id,
            url: dataUrl,
            alt: res.name,
            isPrimary: idx === 0,
            sortOrder: idx,
          },
        });
      }
    }

    return this.findById(id);
  }

  async remove(id: string) {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { success: true, id };
    } catch (e: any) {
      // Fallback to soft delete if constrained by foreign keys
      await this.prisma.product.update({ where: { id }, data: { isActive: false } });
      return { success: true, id, softDeleted: true };
    }
  }

  async updateFlags(
    id: string,
    data: {
      isFeatured?: boolean;
      isFlashSale?: boolean;
      flashSaleEnd?: string | null;
      flashSalePrice?: number | null;
      allowCredit?: boolean;
    },
  ) {
    let flashSaleEndValue: Date | null | undefined = undefined;
    let flashSalePriceValue: number | undefined = undefined;

    if (data.isFlashSale === true) {
      const now = new Date();
      const end = data.flashSaleEnd;
      const desiredEnd = end ? new Date(end) : new Date(now.getTime() + 48 * 60 * 60 * 1000);
      flashSaleEndValue = desiredEnd > now ? desiredEnd : new Date(now.getTime() + 48 * 60 * 60 * 1000);
      flashSalePriceValue = data.flashSalePrice ?? undefined;
    } else if (data.isFlashSale === false) {
      flashSaleEndValue = null;
      flashSalePriceValue = undefined;
    }

    const result = await this.prisma.product.update({
      where: { id: id },
      data: {
        isFeatured: data.isFeatured ?? undefined,
        isFlashSale: data.isFlashSale ?? undefined,
        allowCredit: data.allowCredit ?? undefined,
        flashSaleEnd: flashSaleEndValue,
        flashSalePrice: flashSalePriceValue,
      },
    });
    return result;
  }

  async seedSampleProducts() {
    const category = await this.prisma.category.upsert({
      where: { slug: 'general' },
      update: {},
      create: { name: 'General', slug: 'general', isActive: true, sortOrder: 0 },
    });

    const brand = await this.prisma.brand.upsert({
      where: { slug: 'kryros' },
      update: {},
      create: { name: 'Kryros', slug: 'kryros' },
    });

    const samples = [
      {
        name: 'iPhone 13 Pro',
        slug: 'iphone-13-pro',
        description: 'Apple iPhone 13 Pro with A15 Bionic and ProMotion display.',
        price: 18500,
        sku: 'IP13PRO-256-GRY',
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1632633178775-8b3083a0b20e?w=1200',
      },
      {
        name: 'HP EliteBook x360 G8',
        slug: 'hp-elitebook-x360-g8',
        description: 'Premium business convertible with powerful performance.',
        price: 22000,
        sku: 'HP-EBX360-G8',
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200',
      },
      {
        name: 'Samsung Galaxy S22',
        slug: 'samsung-galaxy-s22',
        description: 'Flagship smartphone with dynamic AMOLED display.',
        price: 16500,
        sku: 'SM-GS22-128-BLK',
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
      },
    ];

    const created: any[] = [];
    for (const s of samples) {
      const p = await this.prisma.product.upsert({
        where: { slug: s.slug },
        update: {},
        create: {
          name: s.name,
          slug: s.slug,
          description: s.description,
          shortDescription: s.description,
          price: s.price,
          sku: s.sku,
          isFeatured: s.isFeatured,
          categoryId: category.id,
          brandId: brand.id,
          isActive: true,
          isFlashSale: false,
        },
      });
      // Ensure primary image exists
      const hasImage = await this.prisma.productImage.findFirst({ where: { productId: p.id, isPrimary: true } });
      if (!hasImage) {
        await this.prisma.productImage.create({
          data: { productId: p.id, url: s.image, alt: p.name, isPrimary: true, sortOrder: 0 },
        });
      }
      created.push(p);
    }
    return { success: true, count: created.length, products: created };
  }

  async seedFlashSales() {
    const now = new Date();
    const ends = new Date(now.getTime() + 1000 * 60 * 60 * 48);
    const base = await this.prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });
    const updated: any[] = [];
    for (const p of base) {
      const priceNum = Number((p as any).price);
      const promo = Math.max(1, Math.round(priceNum * 0.9 * 100) / 100);
      const u = await this.prisma.product.update({
        where: { id: p.id },
        data: { isFlashSale: true, flashSaleEnd: ends, flashSalePrice: promo },
      });
      updated.push(u);
    }
    return { success: true, count: updated.length, products: updated, endsAt: ends.toISOString() };
  }
}
