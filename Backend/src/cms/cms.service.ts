import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateFooterSectionDto } from './dto/create-footer-section.dto';
import { UpdateFooterSectionDto } from './dto/update-footer-section.dto';
import { CreateFooterLinkDto } from './dto/create-footer-link.dto';
import { UpdateFooterLinkDto } from './dto/update-footer-link.dto';
import { UpdateFooterConfigDto } from './dto/update-footer-config.dto';
import { CreateHomePageSectionDto } from './dto/create-homepage-section.dto';
import { UpdateHomePageSectionDto } from './dto/update-homepage-section.dto';

@Injectable()
export class CMSService {
  constructor(private prisma: PrismaService) {}

  // ==================== HOME PAGE SECTIONS ====================

  async getHomePageSections() {
    const sections = await this.prisma.homePageSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    if (sections.length === 0) {
      await this.seedHomePageSections();
      return this.prisma.homePageSection.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    }

    return sections;
  }

  async listHomePageSections() {
    return this.prisma.homePageSection.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createHomePageSection(data: CreateHomePageSectionDto) {
    return this.prisma.homePageSection.create({
      data: {
        ...data,
        config: data.config ? (typeof data.config === 'string' ? JSON.parse(data.config) : data.config) : undefined,
      } as any,
    });
  }

  async updateHomePageSection(id: string, data: UpdateHomePageSectionDto) {
    return this.prisma.homePageSection.update({
      where: { id },
      data: {
        ...data,
        config: data.config ? (typeof data.config === 'string' ? JSON.parse(data.config) : data.config) : undefined,
      } as any,
    });
  }

  async deleteHomePageSection(id: string) {
    return this.prisma.homePageSection.delete({
      where: { id },
    });
  }

  async seedHomePageSections() {
    const defaultSections = [
      {
        type: 'HeroSlider',
        order: 1,
        isActive: true,
        title: 'Main Hero Slider',
        subtitle: 'Banners from the banner manager will show here',
        animation: 'fadeIn',
        config: { showBanners: true, type: 'HERO' }
      },
      {
        type: 'TrustBadges',
        order: 2,
        isActive: true,
        title: 'Our Guarantees',
        subtitle: 'Why shop with us',
        backgroundColor: '#ffffff',
        animation: 'slideUp',
        config: {
          items: [
            { icon: 'Truck', title: 'Fast Delivery', subtitle: 'Express Shipping' },
            { icon: 'ShieldCheck', title: 'Genuine Tech', subtitle: '100% Authentic' },
            { icon: 'Smartphone', title: 'Verified Seller', subtitle: 'Trusted Platform' },
            { icon: 'ArrowRight', title: 'Pay on Credit', subtitle: 'Flexible Terms' }
          ]
        }
      },
      {
        type: 'FlashSale',
        order: 3,
        isActive: true,
        title: 'Flash Sale',
        subtitle: 'Limited time offers',
        backgroundColor: '#f8fafc',
        animation: 'zoomIn',
        config: {
          limit: 4,
          endTime: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        }
      },
      {
        type: 'CategoryProducts',
        order: 4,
        isActive: true,
        title: 'Latest Smartphones',
        subtitle: 'Own the latest tech today',
        animation: 'slideUp',
        targetCategorySlug: 'smartphones',
        config: { limit: 10 }
      },
      {
        type: 'PromoBanner',
        order: 5,
        isActive: true,
        title: 'Fashion That Speaks',
        subtitle: 'New Collection 2025',
        description: 'Express your style with our latest premium fashion arrivals.',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&h=900&fit=crop&auto=format&q=90',
        link: '/shop?category=fashion',
        linkText: 'Shop Fashion',
        backgroundColor: '#1B2533',
        textColor: '#ffffff',
        animation: 'fadeIn'
      },
      {
        type: 'CategoryProducts',
        order: 6,
        isActive: true,
        title: 'Fashion Trends',
        subtitle: 'Streetwear, sneakers and more',
        animation: 'slideUp',
        targetCategorySlug: 'fashion',
        config: { limit: 10 }
      },
      {
        type: 'ProductPromoList',
        order: 7,
        isActive: true,
        title: 'Featured Deals',
        animation: 'slideUp',
        config: {
          items: [
            {
              title: 'Apple Ipad New Generation',
              subtitle: 'Up to 20% off Apple Devices',
              linkText: 'Buy Product',
              imageUrl: '',
              link: '/shop',
              backgroundColor: '#EEF2FF',
              textColor: '#4F46E5'
            },
            {
              title: 'Smart Headphone',
              subtitle: 'Up to 40% off new order',
              linkText: 'Buy Product',
              imageUrl: '',
              link: '/shop',
              backgroundColor: '#EEF2FF',
              textColor: '#4F46E5'
            },
            {
              title: 'Samsung Oled Smart TV',
              subtitle: 'Up to 20% off Apple Devices',
              linkText: 'Buy Product',
              imageUrl: '',
              link: '/shop',
              backgroundColor: '#ECFDF5',
              textColor: '#16A34A'
            }
          ]
        }
      },
      {
        type: 'CategoryProducts',
        order: 8,
        isActive: true,
        title: 'Audio & Earphones',
        subtitle: 'Immersive sound quality',
        animation: 'slideUp',
        targetCategorySlug: 'audio',
        config: { limit: 10 }
      },
      {
        type: 'CategoriesGrid',
        order: 9,
        isActive: true,
        title: 'Shop by Category',
        subtitle: 'Browse our collections',
        animation: 'zoomIn'
      },
      {
        type: 'CreditSection',
        order: 10,
        isActive: true,
        title: 'KRYROS Credit',
        subtitle: 'Buy now, pay later',
        animation: 'fadeIn'
      },
      {
        type: 'FeaturedProducts',
        order: 11,
        isActive: true,
        title: 'Featured Products',
        subtitle: 'Hand-picked for you',
        animation: 'slideUp'
      }
    ];

    // Find real categories to link targetCategoryId
    const allCategories = await this.prisma.category.findMany({
      where: { isActive: true },
      take: 20
    });

    const categoryMap = new Map();
    allCategories.forEach(c => {
      categoryMap.set(c.slug.toLowerCase(), c.id);
      categoryMap.set(c.name.toLowerCase(), c.id);
    });

    // Update targetCategoryId if slug or name matches
    for (const section of defaultSections) {
      if (section.targetCategorySlug) {
        const slug = section.targetCategorySlug.toLowerCase();
        // Try exact slug match
        if (categoryMap.has(slug)) {
          (section as any).targetCategoryId = categoryMap.get(slug);
        } else {
          // Try to find a category that contains the slug in its name
          const fuzzyMatch = allCategories.find(c => 
            c.name.toLowerCase().includes(slug) || 
            slug.includes(c.name.toLowerCase())
          );
          if (fuzzyMatch) {
            (section as any).targetCategoryId = fuzzyMatch.id;
          }
        }
      }
      
      // If still no category ID but it's a CategoryProducts section, assign a random one from available
      if (section.type === 'CategoryProducts' && !(section as any).targetCategoryId && allCategories.length > 0) {
        const randomIndex = Math.floor(Math.random() * allCategories.length);
        (section as any).targetCategoryId = allCategories[randomIndex].id;
      }
    }

    const existingSections = await this.prisma.homePageSection.findMany();
    
    // For a cleaner transition to the new UI, we will only add if the table is empty or if we want to force new defaults
    // If the user wants to keep their edits, we shouldn't overwrite everything.
    // However, the user asked to fix the sections not displaying.
    
    if (existingSections.length === 0) {
      for (const section of defaultSections) {
        await this.prisma.homePageSection.create({ data: section as any });
      }
      return { success: true, message: `Initialized ${defaultSections.length} homepage sections successfully!` };
    }

    // If sections exist, we want to ensure ALL prototype sections are present
    // We compare by both Type and Title to distinguish between different CategoryProducts sections
    const missingPrototype = defaultSections.filter(def => {
      return !existingSections.some(ext => ext.type === def.type && ext.title === def.title);
    });
    
    let addedCount = 0;
    for (const section of missingPrototype) {
      await this.prisma.homePageSection.create({ data: section as any });
      addedCount++;
    }

    // Force update isActive and order for ALL default sections if they exist
    for (const defaultSec of defaultSections) {
      const existing = existingSections.find(s => s.type === defaultSec.type && s.title === defaultSec.title);
      if (existing) {
        await this.prisma.homePageSection.update({
          where: { id: existing.id },
          data: { 
            order: defaultSec.order, 
            isActive: true,
            targetCategoryId: (defaultSec as any).targetCategoryId || existing.targetCategoryId,
            targetCategorySlug: defaultSec.targetCategorySlug || existing.targetCategorySlug
          }
        });
      }
    }

    return { 
      success: true, 
      message: addedCount > 0 ? `Restored ${addedCount} missing prototype sections.` : `Homepage layout synchronized with prototype.` 
    };
  }

  async getBanners() {
    const banners = await this.prisma.cMSBanner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    if (banners.length === 0) {
      await this.seedDefaultBanners();
      return this.prisma.cMSBanner.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
      });
    }

    return banners;
  }

  async seedDefaultBanners() {
    const defaultBanners = [
      {
        tag: 'New Arrivals 2025',
        title: 'Next-Level\nSmartphones.',
        subtitle: 'Own the latest iPhone, Samsung & more — with 0% financing from $58/mo.',
        linkText: 'Shop Phones',
        link: '/shop',
        secondaryCta: '0% Financing',
        secondaryCtaLink: '/financing',
        mediaType: 'youtube',
        videoUrl: 'B0TICvpuaww',
        badge: '50K+ Products',
        position: 0,
        isActive: true
      },
      {
        tag: 'Flash Deal — Ends Soon',
        title: 'Fashion That\nTurns Heads.',
        subtitle: 'Streetwear, sneakers, shades and more. New drops every week.',
        linkText: 'Explore Fashion',
        link: '/shop',
        secondaryCta: 'Flash Deals',
        secondaryCtaLink: '/flash-sales',
        mediaType: 'image',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&h=900&fit=crop&auto=format&q=90',
        badge: 'Up to 70% Off',
        position: 1,
        isActive: true
      },
      {
        tag: 'Best Sellers',
        title: 'Sound Without\nBoundaries.',
        subtitle: 'Sony, Apple AirPods, Samsung Buds — immersive audio at flash prices.',
        linkText: 'Shop Audio',
        link: '/shop',
        secondaryCta: 'View Deals',
        secondaryCtaLink: '/flash-sales',
        mediaType: 'image',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&h=900&fit=crop&auto=format&q=90',
        badge: 'New Drops',
        position: 2,
        isActive: true
      },
      {
        tag: '0% Interest — Instant Approval',
        title: 'Own It Today.\nPay Tomorrow.',
        subtitle: 'Get instant credit up to $5,500. No hidden fees, no paperwork.',
        linkText: 'Apply Now',
        link: '/financing',
        secondaryCta: 'Shop Now',
        secondaryCtaLink: '/shop',
        mediaType: 'image',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=900&fit=crop&auto=format&q=90',
        badge: 'Instant Credit',
        position: 3,
        isActive: true
      }
    ];

    for (const banner of defaultBanners) {
      await this.prisma.cMSBanner.create({ data: banner });
    }
    return { success: true, message: 'Default banners seeded' };
  }

  async listBanners() {
    return this.prisma.cMSBanner.findMany({
      orderBy: { position: 'asc' },
    });
  }

  async createBanner(data: CreateBannerDto) {
    return this.prisma.cMSBanner.create({ data });
  }

  async updateBanner(id: string, data: UpdateBannerDto) {
    return this.prisma.cMSBanner.update({
      where: { id },
      data,
    });
  }

  async deleteBanner(id: string) {
    return this.prisma.cMSBanner.delete({ where: { id } });
  }

  async getSections() {
    return this.prisma.cMSSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getPage(slug: string) {
    return this.prisma.cMSPage.findUnique({ where: { slug } });
  }

  async listPages() {
    return this.prisma.cMSPage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPage(data: { title: string; slug: string; content?: string; metaTitle?: string; metaDescription?: string; isActive?: boolean }) {
    return this.prisma.cMSPage.create({ data });
  }

  async updatePage(id: string, data: { title?: string; slug?: string; content?: string; metaTitle?: string; metaDescription?: string; isActive?: boolean }) {
    return this.prisma.cMSPage.update({ where: { id }, data });
  }

  async deletePage(id: string) {
    return this.prisma.cMSPage.delete({ where: { id } });
  }

  // Sections management
  async listSections() {
    return this.prisma.cMSSection.findMany({ orderBy: { order: 'asc' } });
  }

  async createSection(data: CreateSectionDto) {
    return this.prisma.cMSSection.create({ data: { ...data } as any });
  }

  async updateSection(id: string, data: UpdateSectionDto) {
    return this.prisma.cMSSection.update({ where: { id }, data: { ...data } as any });
  }

  async deleteSection(id: string) {
    return this.prisma.cMSSection.delete({ where: { id } });
  }

  async seedSections() {
    // Ensure a Categories Grid section exists and enabled
    const section = await this.prisma.cMSSection.findFirst({
      where: {
        OR: [{ type: 'categories' }, { title: 'Shop by Category' }],
      },
    });
    if (!section) {
      await this.prisma.cMSSection.create({
        data: {
          type: 'categories',
          title: 'Shop by Category',
          subtitle: 'Browse our wide range of tech products',
          isActive: true,
          order: 3,
        } as any,
      });
    } else if (!section.isActive) {
      await this.prisma.cMSSection.update({
        where: { id: section.id },
        data: { isActive: true },
      });
    }

    // Ensure a Fast Filters section exists
    const fastFilters = await this.prisma.cMSSection.findFirst({
      where: { type: 'fast_filters' },
    });
    if (!fastFilters) {
      await this.prisma.cMSSection.create({
        data: {
          type: 'fast_filters',
          title: 'Refine Your Search',
          isActive: true,
          order: 11,
          config: {
            items: [
              { label: 'FEATURED', icon: '🟡', isActive: true },
              { label: 'BEST SELLERS', icon: '🔥', isActive: true },
              { label: 'TOP RATED', icon: '⭐', isActive: true },
            ],
          } as any,
        } as any,
      });
    }

    // Ensure a Wholesale Deals section exists and enabled (with sample items)
    const wholesale = await this.prisma.cMSSection.findFirst({
      where: { type: 'wholesale_deals' },
    });
    if (!wholesale) {
      await this.prisma.cMSSection.create({
        data: {
          type: 'wholesale_deals',
          title: 'Featured Wholesale Deals',
          isActive: true,
          order: 5,
          config: {
            items: [
              { title: 'iPhone 13 (Bulk)', subtitle: 'Min 10 units', price: 9999, minQty: 10 },
              { title: 'MacBook Air M2 (Bulk)', subtitle: 'Min 5 units', price: 54999, minQty: 5 },
              { title: 'Samsung S24 (Bulk)', subtitle: 'Min 8 units', price: 39999, minQty: 8 },
            ],
          } as any,
        } as any,
      });
    }

    return { success: true };
  }

  // ==================== FOOTER MANAGEMENT ====================

  async getFooter() {
    const sections = await this.prisma.footerSection.findMany({
      where: { isActive: true },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    let config = await this.prisma.footerConfig.findFirst();

    if (sections.length === 0 || !config) {
      await this.seedFooter();
      const updatedSections = await this.prisma.footerSection.findMany({
        where: { isActive: true },
        include: {
          links: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });
      config = await this.prisma.footerConfig.findFirst();
      return { sections: updatedSections, config };
    }

    return {
      sections,
      config,
    };
  }

  // Footer Sections
  async getFooterSections() {
    return this.prisma.footerSection.findMany({
      where: { isActive: true },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async listFooterSections() {
    return this.prisma.footerSection.findMany({
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createFooterSection(data: CreateFooterSectionDto) {
    return this.prisma.footerSection.create({
      data,
      include: {
        links: true,
      },
    });
  }

  async updateFooterSection(id: string, data: UpdateFooterSectionDto) {
    return this.prisma.footerSection.update({
      where: { id },
      data,
      include: {
        links: true,
      },
    });
  }

  async deleteFooterSection(id: string) {
    return this.prisma.footerSection.delete({
      where: { id },
    });
  }

  // Footer Links
  async createFooterLink(data: CreateFooterLinkDto) {
    return this.prisma.footerLink.create({ data });
  }

  async updateFooterLink(id: string, data: UpdateFooterLinkDto) {
    return this.prisma.footerLink.update({
      where: { id },
      data,
    });
  }

  async deleteFooterLink(id: string) {
    return this.prisma.footerLink.delete({
      where: { id },
    });
  }

  // Footer Config
  async getFooterConfig() {
    return this.prisma.footerConfig.findFirst();
  }

  async updateFooterConfig(data: UpdateFooterConfigDto) {
    const existing = await this.prisma.footerConfig.findFirst();

    if (existing) {
      return this.prisma.footerConfig.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return this.prisma.footerConfig.create({ data: data as any });
    }
  }

  async seedFooter() {
    // Check if footer already exists
    const existingSection = await this.prisma.footerSection.findFirst();
    if (existingSection) {
      return { success: true, message: 'Footer already seeded' };
    }

    // Create default footer sections with links
    const shopSection = await this.prisma.footerSection.create({
      data: {
        title: 'Shop',
        order: 1,
        isActive: true,
      },
    });

    const shopLinks = [
      { label: 'Smartphones', href: '/shop?category=smartphones' },
      { label: 'Laptops', href: '/shop?category=laptops' },
      { label: 'Accessories', href: '/shop?category=accessories' },
      { label: 'Wearables', href: '/shop?category=wearables' },
      { label: 'Software', href: '/software' },
    ];

    for (let i = 0; i < shopLinks.length; i++) {
      await this.prisma.footerLink.create({
        data: {
          sectionId: shopSection.id,
          label: shopLinks[i].label,
          href: shopLinks[i].href,
          order: i,
          isActive: true,
        },
      });
    }

    const servicesSection = await this.prisma.footerSection.create({
      data: {
        title: 'Services',
        order: 2,
        isActive: true,
      },
    });

    const serviceLinks = [
      { label: 'Phone Repairs', href: '/services?type=repairs' },
      { label: 'Laptop Repairs', href: '/services?type=repairs' },
      { label: 'Installation', href: '/services?type=installation' },
      { label: 'Tech Support', href: '/services?type=support' },
      { label: 'Consulting', href: '/services?type=consulting' },
    ];

    for (let i = 0; i < serviceLinks.length; i++) {
      await this.prisma.footerLink.create({
        data: {
          sectionId: servicesSection.id,
          label: serviceLinks[i].label,
          href: serviceLinks[i].href,
          order: i,
          isActive: true,
        },
      });
    }

    const supportSection = await this.prisma.footerSection.create({
      data: {
        title: 'Support',
        order: 3,
        isActive: true,
      },
    });

    const supportLinks = [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Track Order', href: '/track-order' },
    ];

    for (let i = 0; i < supportLinks.length; i++) {
      await this.prisma.footerLink.create({
        data: {
          sectionId: supportSection.id,
          label: supportLinks[i].label,
          href: supportLinks[i].href,
          order: i,
          isActive: true,
        },
      });
    }

    const companySection = await this.prisma.footerSection.create({
      data: {
        title: 'Company',
        order: 4,
        isActive: true,
      },
    });

    const companyLinks = [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ];

    for (let i = 0; i < companyLinks.length; i++) {
      await this.prisma.footerLink.create({
        data: {
          sectionId: companySection.id,
          label: companyLinks[i].label,
          href: companyLinks[i].href,
          order: i,
          isActive: true,
        },
      });
    }

    // Create footer config
    await this.prisma.footerConfig.create({
      data: {
        description:
          'Your trusted source for phones, electronics, accessories, software, and technology services in Zambia and beyond.',
        contactPhone: '+260 966 423 719',
        contactEmail: 'kryrosmobile@gmail.com',
        contactAddress: 'Lusaka, Zambia',
        newsletterTitle: 'Subscribe to our Newsletter',
        newsletterSubtitle: 'Get the latest deals and updates directly to your inbox',
        copyrightText: '© {year} KRYROS MOBILE TECH LIMITED. All rights reserved.',
        socialLinks: [
          { platform: 'facebook', url: '#' },
          { platform: 'twitter', url: '#' },
          { platform: 'instagram', url: '#' },
          { platform: 'linkedin', url: '#' },
          { platform: 'youtube', url: '#' },
        ],
        paymentMethods: [{ name: 'Visa' }, { name: 'Mastercard' }, { name: 'M-Pesa' }],
        announcementBarEnabled: true,
        announcementBarText: '30% discount on all products special for November!',
        announcementBarBgColor: 'bg-kryros-dark',
        announcementBarTextColor: 'text-kryros-green',
        newsletterPopupEnabled: true,
        newsletterPopupTitle: 'Unlock Premium Deals',
        newsletterPopupSubtitle: 'Join our community and be the first to know about new arrivals, flash sales, and tech guides.',
        newsletterPopupDelay: 3000,
      } as any,
    });

    return { success: true, message: 'Footer seeded successfully' };
  }

  // ==================== SITE CONFIG ====================

  async getAllSiteConfigs() {
    return this.prisma.cMSSiteConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async getSiteConfig(key: string) {
    return this.prisma.cMSSiteConfig.findUnique({ where: { key } });
  }

  async upsertSiteConfig(key: string, value: any) {
    return this.prisma.cMSSiteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async seedSiteConfigs() {
    const defaults: Record<string, any> = {
      'trust-badges': {
        items: [
          { icon: 'Truck', title: 'Free Shipping', subtitle: 'On orders over $100' },
          { icon: 'ShieldCheck', title: 'Secure Payments', subtitle: '100% Secure' },
          { icon: 'RefreshCcw', title: 'Easy Returns', subtitle: '7-Day Returns' },
          { icon: 'Headphones', title: '24/7 Support', subtitle: 'We are here' },
        ],
      },
      'upgrade-banner': {
        heading: 'Upgrade Your Tech Game',
        subtitle: 'Unbeatable performance. Unmatched style.',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        discountText: '30%',
        discountSubtext: 'OFF',
        bgImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85',
      },
      'members-banner': {
        title: 'KRYROS Members',
        subtitle: 'Join and get exclusive discounts on every order',
        discount: '5%',
        ctaText: 'Join Now',
        ctaLink: '/signup',
        bgColor: '#050F1A',
      },
      'wholesale': {
        hero: {
          heading: 'Buy More, Save More!',
          subheading: 'Exclusive wholesale prices on thousands of products.',
          ctaText: 'Explore Products',
          ctaLink: '/shop',
        },
        steps: [
          { title: 'Browse Products', desc: 'Explore products available for wholesale' },
          { title: 'Add to Quote', desc: 'Add products to your quote list' },
          { title: 'Submit Quote', desc: 'Our team will review your request' },
          { title: 'Confirm & Order', desc: 'Confirm the quote and place your order' },
        ],
        features: [
          { title: 'Bulk Discounts', desc: 'Better prices on larger quantities' },
          { title: 'Priority Shipping', desc: 'Faster delivery for wholesale orders' },
          { title: 'Secure Payments', desc: 'Safe & encrypted transactions' },
          { title: 'Dedicated Support', desc: '24/7 priority customer support' },
        ],
        quoteCta: {
          title: 'Need a Custom Quote?',
          subtitle: 'Contact our wholesale team for personalised pricing',
          ctaText: 'Request Quote',
          ctaLink: '/contact',
        },
      },
      'product-settings': {
        deliveryThreshold: 100,
        freeDeliveryText: 'Free delivery on orders over $100',
        pickupAvailable: true,
        pickupText: 'Available at 3 pickup stations',
        paymentMethods: [
          { name: 'MTN Money', icon: 'mobile', isActive: true },
          { name: 'Airtel Money', icon: 'mobile', isActive: true },
          { name: 'Zamtel Kwacha', icon: 'mobile', isActive: true },
          { name: 'Visa Card', icon: 'card', isActive: true },
          { name: 'Mastercard', icon: 'card', isActive: true },
          { name: 'Bank Transfer', icon: 'bank', isActive: true },
        ],
        creditPlansVisible: true,
        defaultCreditDurations: [3, 6, 12],
      },
      'header': {
        logoText: 'KRYROS',
        announcementEnabled: true,
        announcementText: 'Free Delivery on all orders over $100',
        announcementCta: 'Track Order',
        announcementCtaLink: '/track',
        navLinks: [
          { label: 'Home', href: '/', isActive: true },
          { label: 'Shop', href: '/shop', isActive: true },
          { label: 'Get Now', href: '/get-now', isActive: true },
          { label: 'Wholesale', href: '/wholesale', isActive: true },
          { label: 'Pickup Stations', href: '/pickup-stations', isActive: true },
          { label: 'About Us', href: '/about', isActive: true },
          { label: 'Contact Us', href: '/contact', isActive: true },
        ],
      },
    };

    const results = [];
    for (const [key, value] of Object.entries(defaults)) {
      const existing = await this.prisma.cMSSiteConfig.findUnique({ where: { key } });
      if (!existing) {
        results.push(await this.prisma.cMSSiteConfig.create({ data: { key, value } }));
      }
    }
    return { success: true, seeded: results.length, message: `Seeded ${results.length} site configs` };
  }

  // ==================== BRAND BANNERS ====================

  async getBrandBanners(onlyActive = false) {
    return this.prisma.cMSBrandBanner.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { brandName: 'asc' },
    });
  }

  async getBrandBannerBySlug(brandSlug: string) {
    return this.prisma.cMSBrandBanner.findUnique({ where: { brandSlug } });
  }

  async upsertBrandBanner(data: any) {
    const { brandSlug, ...rest } = data;
    return this.prisma.cMSBrandBanner.upsert({
      where: { brandSlug },
      update: rest,
      create: { brandSlug, ...rest },
    });
  }

  async deleteBrandBanner(id: string) {
    return this.prisma.cMSBrandBanner.delete({ where: { id } });
  }

  async seedBrandBanners() {
    const defaults = [
      { brandSlug: 'apple', brandName: 'Apple', tagline: 'Think Different', description: 'Premium Apple products', bgColor: '#1d1d1f', bgGradient: 'linear-gradient(135deg,#1d1d1f,#3d3d3f)', ctaText: 'Shop Apple', ctaLink: '/shop?brand=Apple' },
      { brandSlug: 'samsung', brandName: 'Samsung', tagline: 'Do What You Cant', description: 'Galaxy Series & more', bgColor: '#1428A0', bgGradient: 'linear-gradient(135deg,#1428A0,#0070D2)', ctaText: 'Shop Samsung', ctaLink: '/shop?brand=Samsung' },
      { brandSlug: 'sony', brandName: 'Sony', tagline: 'Make Believe', description: 'Premium audio & electronics', bgColor: '#000000', bgGradient: 'linear-gradient(135deg,#000,#222)', ctaText: 'Shop Sony', ctaLink: '/shop?brand=Sony' },
    ];
    const results = [];
    for (const d of defaults) {
      const existing = await this.prisma.cMSBrandBanner.findUnique({ where: { brandSlug: d.brandSlug } });
      if (!existing) results.push(await this.prisma.cMSBrandBanner.create({ data: d }));
    }
    return { success: true, seeded: results.length };
  }
}
