import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { SettingsService } from '../settings/settings.service';
import { ShippingZonesService } from '../shipping-zones/shipping-zones.service';
import { Prisma, PaymentMethod } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private shippingZonesService: ShippingZonesService,
  ) {}

  private convertToPaymentMethod(method: string): PaymentMethod {
    const methodMap: Record<string, PaymentMethod> = {
      'CARD': PaymentMethod.CARD,
      'card': PaymentMethod.CARD,
      'BANK_TRANSFER': PaymentMethod.BANK_TRANSFER,
      'bank_transfer': PaymentMethod.BANK_TRANSFER,
      'bank': PaymentMethod.BANK_TRANSFER,
      'MOBILE_MONEY': PaymentMethod.MOBILE_MONEY,
      'mobile_money': PaymentMethod.MOBILE_MONEY,
      'mobile': PaymentMethod.MOBILE_MONEY,
      'WALLET': PaymentMethod.WALLET,
      'wallet': PaymentMethod.WALLET,
      'CREDIT': PaymentMethod.CREDIT,
      'credit': PaymentMethod.CREDIT,
      'WHATSAPP': PaymentMethod.WHATSAPP,
      'whatsapp': PaymentMethod.WHATSAPP,
    };
    
    const normalized = method?.toUpperCase();
    return methodMap[normalized] || PaymentMethod.CARD;
  }

  async findAll(userId?: string, params?: { skip?: number; take?: number; status?: string }) {
    const { skip = 0, take = 20, status } = params || {};
    const where: any = userId ? { userId } : {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, meta: { total, skip, take } };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              }
            },
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async trackOrder(orderNumber: string, email: string) {
    // 1. Find the order by orderNumber (which is the friendly ID like ORD-123)
    // We search by orderNumber or ID just in case
    const order = await this.prisma.order.findFirst({
      where: {
        AND: [
          {
            OR: [
              { orderNumber: { equals: orderNumber, mode: 'insensitive' } },
              { id: { equals: orderNumber, mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { user: { email: { equals: email, mode: 'insensitive' } } },
              { shippingAddress: { email: { equals: email, mode: 'insensitive' } } }
            ]
          }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              }
            },
            variant: true,
          },
        },
        shippingAddress: true,
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found with the provided details');
    }

    // Return more detailed tracking info
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
        image: item.product.images?.find(i => i.isPrimary)?.url || item.product.images?.[0]?.url,
        variant: item.variant?.value
      })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      shippingAddress: order.shippingAddress ? {
        firstName: order.shippingAddress.firstName,
        lastName: order.shippingAddress.lastName,
        address: order.shippingAddress.street,
        city: order.shippingAddress.cityName || order.shippingAddress.city,
        state: order.shippingAddress.stateName || order.shippingAddress.state,
        country: order.shippingAddress.country
      } : null,
      shippingStatus: order.status
    };
  }

  async create(userId: string | undefined, data: CreateOrderDto) {
    const { items, shippingAddressId: providedShippingAddressId, billingAddressId: providedBillingAddressId, paymentMethod, notes, addressDetails } = data;
    
    if (!items || items.length === 0) {
      throw new BadRequestException('Order items are required');
    }

    // Convert string payment method to enum
    const paymentMethodEnum = this.convertToPaymentMethod(paymentMethod);

    // 1. Fetch user to check role and wholesale account
    const user = userId ? await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wholesaleAccount: true },
    }) : null;

    // Verify addresses if IDs provided
    if (providedShippingAddressId && userId) {
      const address = await this.prisma.address.findFirst({
        where: { id: providedShippingAddressId, userId },
      });
      if (!address) throw new BadRequestException('Invalid shipping address');
    }
    if (providedBillingAddressId && userId) {
      const address = await this.prisma.address.findFirst({
        where: { id: providedBillingAddressId, userId },
      });
      if (!address) throw new BadRequestException('Invalid billing address');
    }

    // 2. Fetch products and variants
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { 
        inventory: true, 
        variants: true,
        wholesalePrices: user?.wholesaleAccount ? {
          where: { 
            OR: [
              { accountId: user.wholesaleAccount.id },
              { accountId: null }
            ]
          }
        } : false
      },
    });

    // 3. Validation and Calculations
    let subtotal = 0;
    let totalDiscount = 0;
    const orderItemsData: any[] = [];
    const inventoryUpdates: any[] = [];

    // Aggregate quantities to check against total stock
    const quantityMap: Record<string, number> = {};
    const variantQuantityMap: Record<string, number> = {};

    for (const item of items) {
      quantityMap[item.productId] = (quantityMap[item.productId] || 0) + item.quantity;
      if (item.variantId) {
        variantQuantityMap[item.variantId] = (variantQuantityMap[item.variantId] || 0) + item.quantity;
      }
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      // 1. Check if product is wholesale-only
      if (product.isWholesaleOnly && (!user?.wholesaleAccount || user.wholesaleAccount.status !== 'APPROVED')) {
        throw new BadRequestException(`Product ${product.name} is for wholesale partners only. Please apply for a wholesale account.`);
      }

      // 2. Check MOQ (Minimum Order Quantity)
      const moq = product.wholesaleMoq || 1;
      if (item.quantity < moq) {
        throw new BadRequestException(`Minimum order quantity for ${product.name} is ${moq} units/packs.`);
      }

      const originalPrice = Number(product.price);
      let price = originalPrice;

      // ... price logic ...
      if (user?.wholesaleAccount) {
        // ... (wholesale price logic remains the same)
        let bestWholesalePrice: number | null = null;
        if (product.wholesalePrices?.length) {
          const applicableTier = product.wholesalePrices
            .filter((wp) => item.quantity >= wp.minQuantity)
            .sort((a, b) => b.minQuantity - a.minQuantity)[0];
          if (applicableTier) bestWholesalePrice = Number(applicableTier.price);
        }
        if (bestWholesalePrice === null && product.wholesalePrice) {
          bestWholesalePrice = Number(product.wholesalePrice);
        }
        if (bestWholesalePrice !== null) price = bestWholesalePrice;
      } else if (
        product.isFlashSale &&
        product.flashSalePrice &&
        product.flashSaleEnd &&
        new Date(product.flashSaleEnd) > new Date()
      ) {
        price = Number(product.flashSalePrice);
      }

      // Note: We no longer block orders due to insufficient stock. 
      // Stock will still be updated (allowing negative values) for admin tracking.
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found for product ${product.id}`);
        
        if (!user?.wholesaleAccount || !product.wholesalePrices?.length) {
          price = Number(variant.price);
        }
      } 
      // End of non-blocking stock check logic

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      totalDiscount += (originalPrice - price) * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price,
        total: itemTotal,
      });

      inventoryUpdates.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity * (product.unitsPerPack || 1),
      });
    }

    // Tax and Shipping
    let shipping = 0;
    const isNewShippingEnabled = await this.shippingZonesService.isEnabled();

    if (isNewShippingEnabled && data.shippingMethodId) {
      const method = await this.prisma.locationShippingMethod.findUnique({
        where: { id: data.shippingMethodId }
      });
      if (method) {
        shipping = subtotal >= Number(method.freeShippingThreshold || 0) ? 0 : Number(method.price);
      }
    } else {
      const shippingConfig = await this.settingsService.getShippingConfig();
      shipping = subtotal >= shippingConfig.threshold ? 0 : shippingConfig.fee;
    }

    const tax = subtotal * 0.16; // 16% VAT
    const total = subtotal + tax + shipping;

    // Simplified Order ID: random 7-character alphanumeric string
    const orderNumber = Math.random().toString(36).substr(2, 7).toUpperCase();

    // 4. Prisma Transaction
    return this.prisma.$transaction(async (tx) => {
      let finalShippingAddressId = providedShippingAddressId;
      let finalBillingAddressId = providedBillingAddressId;

      // Create address if details provided (for guest or new address)
      if (addressDetails) {
        const newAddress = await tx.address.create({
          data: {
            userId: userId || null,
            firstName: addressDetails.firstName,
            lastName: addressDetails.lastName,
            email: addressDetails.email,
            phone: addressDetails.phone,
            street: addressDetails.address,
            zipCode: addressDetails.zipCode,
            countryId: addressDetails.countryId,
            stateId: addressDetails.stateId,
            cityId: addressDetails.cityId,
            stateName: addressDetails.stateName,
            cityName: addressDetails.cityName,
            city: addressDetails.cityName, // Legacy field sync
            state: addressDetails.stateName, // Legacy field sync
            manual: addressDetails.manual || false,
            country: addressDetails.countryName || "Zambia",
            type: 'SHIPPING'
          }
        });
        finalShippingAddressId = newAddress.id;
        // For guest, use same address for billing if not provided
        if (!finalBillingAddressId) finalBillingAddressId = newAddress.id;
      }

      if (!finalShippingAddressId) {
        throw new BadRequestException('Shipping address is required');
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: paymentMethodEnum,
          subtotal: new Prisma.Decimal(subtotal),
          tax: new Prisma.Decimal(tax),
          shipping: new Prisma.Decimal(shipping),
          discount: new Prisma.Decimal(totalDiscount),
          total: new Prisma.Decimal(total),
          notes,
          shippingAddressId: finalShippingAddressId,
          billingAddressId: finalBillingAddressId,
          items: {
            create: orderItemsData.map(item => ({
              ...item,
              price: new Prisma.Decimal(item.price),
              total: new Prisma.Decimal(item.total),
            })),
          },
          logs: {
            create: {
              status: 'PENDING',
              notes: 'Order placed',
            },
          },
        },
        include: { items: true },
      });

      // Update Inventory
      for (const update of inventoryUpdates) {
        if (update.variantId) {
          await tx.productVariant.update({
            where: { id: update.variantId },
            data: { stock: { decrement: update.quantity } },
          });
        }

        // Always update base inventory for tracking (if exists)
        const inventory = await tx.inventory.findUnique({ where: { productId: update.productId } });
        if (inventory) {
          await tx.inventory.update({
            where: { productId: update.productId },
            data: { stock: { decrement: update.quantity } },
          });

          // Record stock movement
          await tx.stockMovement.create({
            data: {
              inventoryId: inventory.id,
              type: 'STOCK_OUT',
              quantity: update.quantity,
              reference: order.orderNumber,
              notes: `Order placement ${order.orderNumber}${inventory.stock - update.quantity < 0 ? ' (Backorder)' : ''}`,
            },
          });
        }
      }

      return order;
    });
  }

  async updateStatus(id: string, status: string, paymentStatus?: string) {
    await this.findById(id);
    return this.prisma.$transaction(async (tx) => {
      const data: any = { status: status as any };
      if (paymentStatus) {
        data.paymentStatus = paymentStatus as any;
      }

      const order = await tx.order.update({
        where: { id },
        data,
      });

      await tx.orderLog.create({
        data: {
          orderId: id,
          status: status as any,
          notes: `Order status updated to ${status}${paymentStatus ? ` (Payment: ${paymentStatus})` : ''}`,
        },
      });

      return order;
    });
  }
}
