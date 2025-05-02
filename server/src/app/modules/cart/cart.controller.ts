import { Cart, CartItem } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CartService } from './cart.service';

// Get or create cart
const getOrCreateCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.getOrCreateCart(req.params.customerId);
  sendResponse<Cart>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart fetched or created successfully!',
    data: result,
  });
});

// Get cart by user ID
const getCartByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.getCartByUserId(req.params.customerId);
  sendResponse<Cart | null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart data fetched successfully!',
    data: result,
  });
});

// Add item to cart
const addItemToCart = catchAsync(async (req: Request, res: Response) => {
  const { customerId, productId, quantity } = req.body;
  const result = await CartService.addItemToCart(
    customerId,
    productId,
    quantity
  );
  sendResponse<Cart>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item added to cart successfully!',
    data: result,
  });
});

// Update cart item quantity
const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const { cartItemId } = req.params;
  const result = await CartService.updateCartItem(cartItemId, quantity);
  sendResponse<CartItem>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart item updated successfully!',
    data: result,
  });
});

// Remove item from cart
const removeItemFromCart = catchAsync(async (req: Request, res: Response) => {
  const { cartItemId } = req.params;
  const result = await CartService.removeItemFromCart(cartItemId);
  sendResponse<CartItem>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart item removed successfully!',
    data: result,
  });
});

// Clear cart
const clearCart = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  await CartService.clearCart(customerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart cleared successfully!',
  });
});

// Delete entire cart
const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  await CartService.deleteCart(customerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart deleted successfully!',
  });
});

export const CartController = {
  getOrCreateCart,
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
  deleteCart,
};
