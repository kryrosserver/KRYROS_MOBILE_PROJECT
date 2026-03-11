import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

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
        user: true,
        items: { include: { product: { include: { images: true } }, variant: true } },
        shippingAddress: true,
        billingAddress: true,
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(userId: string, data: CreateOrderDto) {
    const { items, shippingAddressId, billingAddressId, paymentMethod, notes } = data;

    // 1. Fetch user to check role and wholesale account
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wholesaleAccount: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Verify addresses
    if (shippingAddressId) {
      const address = await this.prisma.address.findFirst({
        where: { id: shippingAddressId, userId },
      });
      if (!address) throw new BadRequestException('Invalid shipping address');
    }
    if (billingAddressId) {
      const address = await this.prisma.address.findFirst({
        where: { id: billingAddressId, userId },
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
        wholesalePrices: user.wholesaleAccount ? {
          where: { accountId: user.wholesaleAccount.id }
        } : false
      },
    });

    // 3. Validation and Calculations
    let subtotal = 0;
    let totalDiscount = 0;
    const orderItemsData: any[] = [];
    const inventoryUpdates: any[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      const originalPrice = Number(product.price);
      let price = originalPrice;

      // Check wholesale pricing first if applicable
      if (user.wholesaleAccount && product.wholesalePrices?.length) {
        // Find the best wholesale price for this quantity
        const applicablePrice = product.wholesalePrices
          .filter((wp) => item.quantity >= wp.minQuantity)
          .sort((a, b) => b.minQuantity - a.minQuantity)[0];
        
        if (applicablePrice) {
          price = Number(applicablePrice.price);
        }
      } else if (
        product.isFlashSale &&
        product.flashSalePrice &&
        product.flashSaleEnd &&
        new Date(product.flashSaleEnd) > new Date()
      ) {
        price = Number(product.flashSalePrice);
      }

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found for product ${product.id}`);
        // If it's a wholesaler, we might still use the wholesale price calculated above, 
        // or the variant price if it's more specific. For now, let's assume wholesale price applies to the base product.
        // But if not a wholesaler, we definitely use the variant price.
        if (!user.wholesaleAccount || !product.wholesalePrices?.length) {
          price = Number(variant.price);
        }
        if (variant.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for variant ${variant.name} of product ${product.name}`);
        }
      } else {
        if (!product.inventory || product.inventory.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }
      }

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
        quantity: item.quantity,
      });
    }

    // Tax and Shipping
    const shippingConfig = await this.settingsService.getShippingConfig();
    const tax = subtotal * 0.16; // 16% VAT
    const shipping = subtotal >= shippingConfig.threshold ? 0 : shippingConfig.fee;
    const total = subtotal + tax + shipping;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 4. Prisma Transaction
    return this.prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod,
          subtotal,
          tax,
          shipping,
          discount: totalDiscount,
          total,
          notes,
          shippingAddressId,
          billingAddressId,
          items: {
            create: orderItemsData,
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
        } else {
          await tx.inventory.update({
            where: { productId: update.productId },
            data: { stock: { decrement: update.quantity } },
          });
        }

        // Record stock movement
        const inventory = await tx.inventory.findUnique({ where: { productId: update.productId } });
        if (inventory) {
          await tx.stockMovement.create({
            data: {
              inventoryId: inventory.id,
              type: 'STOCK_OUT',
              quantity: update.quantity,
              reference: order.orderNumber,
              notes: `Order placement ${order.orderNumber}`,
            },
          });
        }
      }

      return order;
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findById(id);
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status: status as any },
      });

      await tx.orderLog.create({
        data: {
          orderId: id,
          status: status as any,
          notes: `Order status updated to ${status}`,
        },
      });

      return order;
    });
  }
}
