import { Cart, CartItem } from '@prisma/client';
import prisma from '../../../shared/prisma';

// Create or get existing cart
const getOrCreateCart = async (userId: string): Promise<Cart> => {
  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              imageUrls: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                imageUrls: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

// Get cart by user ID
const getCartByUserId = async (userId: string): Promise<Cart | null> => {
  return prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

// Add item to cart
const addItemToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<Cart> => {
  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return getOrCreateCart(userId);
};

// Update cart item quantity
const updateCartItem = async (
  cartItemId: string,
  quantity: number
): Promise<CartItem> => {
  if (quantity <= 0) throw new Error('Quantity must be greater than 0');
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

// Remove item from cart
const removeItemFromCart = async (cartItemId: string): Promise<CartItem> => {
  return prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });
};

// Clear cart
const clearCart = async (userId: string): Promise<void> => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

// Delete cart
const deleteCart = async (userId: string): Promise<void> => {
  await prisma.cart.deleteMany({ where: { userId } });
};

export const CartService = {
  getOrCreateCart,
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
  deleteCart,
};
