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

@Injectable()
export class CMSService {
  constructor(private prisma: PrismaService) {}

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
              { label: 'SELECT COLOR', icon: '', isActive: true },
              { label: 'SELECT STORAGE', icon: '', isActive: true },
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
