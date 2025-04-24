import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CartRoutes } from '../modules/cart/cart.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { CustomerRoutes } from '../modules/customer/customer.routes';
import { InventoryRoutes } from '../modules/inventory/inventory.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { ProductImageRoutes } from '../modules/productImage/productImage.routes';
import { ProfileRoutes } from '../modules/profile/profile.routes';
import { PromotionRoutes } from '../modules/promotion/promotion.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { UserRoutes } from '../modules/user/user.routes';

const router = express.Router();

const moduleRoutes = [
  //... routes
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/customers',
    route: CustomerRoutes,
  },
  {
    path: '/profile',
    route: ProfileRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/product_images',
    route: ProductImageRoutes,
  },
  {
    path: '/inventories',
    route: InventoryRoutes,
  },
  {
    path: '/promotions',
    route: PromotionRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
