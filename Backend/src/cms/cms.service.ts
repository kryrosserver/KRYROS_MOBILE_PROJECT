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
    return this.prisma.homePageSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async listHomePageSections() {
    return this.prisma.homePageSection.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createHomePageSection(data: CreateHomePageSectionDto) {
    return this.prisma.homePageSection.create({
      data: { ...data } as any,
    });
  }

  async updateHomePageSection(id: string, data: UpdateHomePageSectionDto) {
    return this.prisma.homePageSection.update({
      where: { id },
      data: { ...data } as any,
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
        type: 'PromoBanner',
        order: 4,
        isActive: true,
        title: 'DISCOUNT UP TO 50%',
        subtitle: 'EARPHONE BLUETOOTH',
        description: 'Get amazing deals on our latest Bluetooth earphones',
        imageUrl: '',
        link: '/shop',
        linkText: 'Shop Now',
        backgroundColor: '#1B2533',
        textColor: '#ffffff',
        animation: 'fadeIn'
      },
      {
        type: 'ProductPromoList',
        order: 5,
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
            },
            {
              title: 'Iphone 15 Promax',
              subtitle: 'Save 20% Today, Limited',
              linkText: 'See More Products',
              imageUrl: '',
              link: '/shop',
              backgroundColor: '#EEF2FF',
              textColor: '#4F46E5'
            },
            {
              title: 'Iphone 15 Promax',
              subtitle: 'Free Shipping On Over $50',
              linkText: 'See More Products',
              imageUrl: '',
              link: '/shop',
              backgroundColor: '#FFF7ED',
              textColor: '#92400E'
            }
          ]
        }
      },
      {
        type: 'CategoriesGrid',
        order: 6,
        isActive: true,
        title: 'Shop by Category',
        subtitle: 'Browse our collections',
        animation: 'zoomIn'
      },
      {
        type: 'PopularTagsProducts',
        order: 7,
        isActive: true,
        title: 'Popular Tags',
        subtitle: 'Shop popular products',
        animation: 'fadeIn',
        config: {
          tags: [
            { label: 'BESTSELLER', isActive: true },
            { label: 'HOT', isActive: true },
            { label: 'NEW', isActive: true },
            { label: 'SALE', isActive: true }
          ],
          filter: 'popular',
          limit: 10
        }
      },
      {
        type: 'ProductGrid',
        order: 8,
        isActive: true,
        title: 'Featured Products',
        config: { limit: 8, filter: 'featured' },
        animation: 'slideUp',
      },
      {
        type: 'DualBannerSection',
        order: 9,
        isActive: true,
        title: 'Featured Deals',
        animation: 'fadeIn',
        config: {
          banners: [
            {
              badge: 'TREND PRODUCT',
              badgeColor: '#991B1B',
              title: 'DJI GimbalX10',
              subtitle: 'Up to 22% off Gimbals',
              linkText: 'Check Details',
              imageUrl: '',
              link: '/shop',
              backgroundColor: '#FFF1F2',
              textColor: '#991B1B'
            },
            {
              badge: 'NEW PRODUCT',
              badgeColor: '#6D28D9',
              title: 'AMD Ryzen 210B',
              subtitle: 'Up to 40% off Kitchen',
              linkText: 'Check Details',
              imageUrl: '',
              link: '/shop',
              backgroundColor: '#EDE9FE',
              textColor: '#6D28D9'
            }
          ]
        }
      },
      {
        type: 'PopularFiltersProducts',
        order: 10,
        isActive: true,
        title: 'Popular Filters',
        animation: 'slideUp',
        config: {
          filters: [
            { label: 'All Categories', isActive: true },
            { label: 'BESTSELLER', isActive: true },
            { label: 'HOT', isActive: true },
            { label: 'NEW', isActive: true },
            { label: 'TREND PRODUCTS', isActive: true },
            { label: 'PROMOTION PRICES', isActive: true }
          ],
          limit: 8
        }
      },
      {
        type: 'TrendProductsBanner',
        order: 11,
        isActive: true,
        animation: 'fadeIn',
        config: {
          badges: [
            { label: 'TREND PRODUCTS', color: '#991B1B', backgroundColor: '#FEE2E2' },
            { label: 'PROMOTION PRICES', color: '#78350F', backgroundColor: '#FEF3C7' }
          ],
          title: 'New generation M1 Processor - limited stocks!',
          featuredProducts: [
            'IPHONE 14 PRO MAX',
            'IPHONE 13 PRO MAX',
            'SAMSUNG ULTRA 22 PRO'
          ],
          buttonText: 'Check Products',
          buttonLink: '/shop',
          imageUrl: '',
          backgroundColor: '#FFF7ED',
          textColor: '#78350F'
        }
      },
      {
        type: 'ProductReviews',
        order: 12,
        isActive: true,
        title: 'Product Reviews',
        subtitle: 'Our references are very valuable, the result of a great effort',
        animation: 'slideIn',
        config: {
          reviews: [
            {
              customerName: 'John Doe',
              customerImage: '',
              role: 'REVIEWER',
              rating: 5,
              reviewText: 'Electronic products are developing a little more every day to make our lives easier. They adapt to the developing digital world.',
              date: '3 YEARS AGO',
              purchasedProduct: 'Samsung Powerbank',
              purchasedProductImage: '',
              purchasedProductLink: '/shop'
            },
            {
              customerName: 'Jane Smith',
              customerImage: '',
              role: 'VIEWER',
              rating: 4,
              reviewText: 'Great quality products and fast shipping! Highly recommend.',
              date: '2 YEARS AGO',
              purchasedProduct: 'Apple Airpods Headphones',
              purchasedProductImage: '',
              purchasedProductLink: '/shop'
            }
          ]
        }
      },
      {
        type: 'DiscountBanner',
        order: 13,
        isActive: true,
        animation: 'fadeIn',
        config: {
          discountText: '40 % OFF',
          discountTextColor: '#991B1B',
          title: 'Discount valid on all phone accessories for November!',
          titleColor: '#991B1B',
          buttonText: 'Check Products',
          buttonLink: '/shop',
          buttonColor: '#991B1B',
          buttonTextColor: '#FFFFFF',
          backgroundImageUrl: '',
          backgroundColor: '#FFF1F2',
          overlayColor: 'rgba(255, 241, 242, 0.9)'
        }
      },
      {
        type: 'CreditSection',
        order: 14,
        isActive: true,
        title: 'KRYROS Credit',
        subtitle: 'Buy now, pay later',
        animation: 'fadeIn'
      }
    ];

    const existingSections = await this.prisma.homePageSection.findMany();
    const existingTypes = new Set(existingSections.map(s => s.type));
    const missingSections = defaultSections.filter(s => !existingTypes.has(s.type));
    let addedCount = 0;

    for (const section of missingSections) {
      await this.prisma.homePageSection.create({ data: section as any });
      addedCount++;
    }

    if (addedCount > 0) {
      return { success: true, message: `Added ${addedCount} new homepage sections successfully!` };
    } else {
      return { success: true, message: `All homepage sections are already present.` };
    }
  }

  async getBanners() {
    return this.prisma.cMSBanner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
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

    const config = await this.prisma.footerConfig.findFirst();

    return {
      sections,
      config,
    };
  }

  // Footer Sections
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
}
