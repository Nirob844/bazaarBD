import { Cart, CartItem, CartStatus } from '@prisma/client';
import prisma from '../../../shared/prisma';

// Helper function to calculate cart totals
const calculateCartTotals = async (cartId: string): Promise<void> => {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: {
        include: {
          promotions: {
            select: {
              discountValue: true,
              type: true,
              isPercentage: true,
            },
          },
        },
      },
      variant: true,
    },
  });

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let itemCount = 0;

  for (const item of cartItems) {
    const itemTotal = Number(item.unitPrice) * item.quantity;
    subtotal += itemTotal;
    totalDiscount += Number(item.discount);
    totalTax += Number(item.tax);
    itemCount += item.quantity;
  }

  // Update cart with calculated totals
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total: subtotal - totalDiscount + totalTax,
      itemCount,
    },
  });
};

// Helper function to calculate item price
const calculateItemPrice = (product: any, variant?: any) => {
  // Use variant price if available, otherwise use product price
  const basePrice = variant?.basePrice || product.basePrice;
  const salePrice = variant?.salePrice || product.salePrice;

  // Use sale price if available, otherwise use base price
  const unitPrice = salePrice || basePrice;

  // Calculate tax
  const taxRate = variant?.taxRate || product.taxRate || 0;
  const tax = Number(unitPrice) * Number(taxRate);

  return {
    unitPrice: Number(unitPrice),
    tax: Number(tax),
  };
};

// Create or get existing cart
const getOrCreateCart = async (customerId: string): Promise<Cart> => {
  let cart = await prisma.cart.findUnique({
    where: {
      customerId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              promotions: {
                select: {
                  discountValue: true,
                  type: true,
                  isPercentage: true,
                },
              },
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        customerId,
        status: CartStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                promotions: {
                  select: {
                    discountValue: true,
                    type: true,
                    isPercentage: true,
                  },
                },
              },
            },
            variant: true,
          },
        },
      },
    });
  }

  return cart;
};

// Get cart by user ID
const getCartByUserId = async (customerId: string): Promise<Cart | null> => {
  return prisma.cart.findUnique({
    where: {
      customerId,
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
};

// Add item to cart
const addItemToCart = async (
  customerId: string,
  productId: string,
  quantity: number,
  variantId?: string
): Promise<Cart> => {
  const cart = await getOrCreateCart(customerId);

  // Get product details for pricing
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      promotions: {
        select: {
          discountValue: true,
          type: true,
          isPercentage: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Get variant if specified
  let variant;
  if (variantId) {
    variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new Error('Product variant not found');
    }
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId,
    },
  });

  // Calculate prices
  const { unitPrice, tax } = calculateItemPrice(product, variant);

  // Calculate promotion discount
  const promotion = product.promotions?.[0];
  let discount = 0;
  if (promotion) {
    discount = promotion.isPercentage
      ? (unitPrice * Number(promotion.discountValue)) / 100
      : Number(promotion.discountValue);
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + quantity,
        unitPrice,
        discount,
        tax,
        total: Number(
          (unitPrice - discount + tax) * (existingItem.quantity + quantity)
        ),
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        unitPrice,
        discount,
        tax,
        total: Number((unitPrice - discount + tax) * quantity),
      },
    });
  }

  await calculateCartTotals(cart.id);
  return getOrCreateCart(customerId);
};

// Update cart item quantity
const updateCartItem = async (
  cartItemId: string,
  quantity: number
): Promise<CartItem> => {
  if (quantity <= 0) throw new Error('Quantity must be greater than 0');

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      product: {
        include: {
          promotions: {
            select: {
              discountValue: true,
              type: true,
              isPercentage: true,
            },
          },
        },
      },
      variant: true,
    },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  const { unitPrice, tax } = calculateItemPrice(
    cartItem.product,
    cartItem.variant
  );

  // Calculate promotion discount
  const promotion = cartItem.product.promotions?.[0];
  let discount = 0;
  if (promotion) {
    discount = promotion.isPercentage
      ? (unitPrice * Number(promotion.discountValue)) / 100
      : Number(promotion.discountValue);
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity,
      unitPrice,
      discount,
      tax,
      total: Number((unitPrice - discount + tax) * quantity),
    },
  });

  await calculateCartTotals(cartItem.cartId);
  return updatedItem;
};

// Remove item from cart
const removeItemFromCart = async (cartItemId: string): Promise<CartItem> => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  const deletedItem = await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  await calculateCartTotals(cartItem.cartId);
  return deletedItem;
};

// Clear cart
const clearCart = async (customerId: string): Promise<void> => {
  const cart = await prisma.cart.findUnique({ where: { customerId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await calculateCartTotals(cart.id);
};

// Delete cart
const deleteCart = async (customerId: string): Promise<void> => {
  await prisma.cart.deleteMany({ where: { customerId } });
};

// Update cart status
const updateCartStatus = async (
  customerId: string,
  status: CartStatus
): Promise<Cart> => {
  return prisma.cart.update({
    where: { customerId },
    data: { status },
  });
};

// Apply coupon to cart
const applyCoupon = async (
  customerId: string,
  couponCode: string,
  discount: number
): Promise<Cart> => {
  const cart = await prisma.cart.update({
    where: { customerId },
    data: {
      couponCode,
      couponDiscount: discount,
    },
  });

  await calculateCartTotals(cart.id);
  return cart;
};

export const CartService = {
  getOrCreateCart,
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
  deleteCart,
  updateCartStatus,
  applyCoupon,
};
