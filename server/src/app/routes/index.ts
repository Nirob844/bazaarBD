import express from 'express';
import { AddressRoutes } from '../modules/address/address.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { AdminAnalyticsRoutes } from '../modules/adminAnalytics/adminAnalytics.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CartRoutes } from '../modules/cart/cart.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { CustomerRoutes } from '../modules/customer/customer.routes';
import { InventoryRoutes } from '../modules/inventory/inventory.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import { ProductAttributeRoutes } from '../modules/product-attribute/product-attribute.routes';
import { ProductVariantRoutes } from '../modules/product-variant/product-variant.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { ProductImageRoutes } from '../modules/productImage/productImage.routes';
import { ProfileRoutes } from '../modules/profile/profile.routes';
import { PromotionRoutes } from '../modules/promotion/promotion.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { ShopRoutes } from '../modules/shop/shop.routes';
import { ShopAnalyticsRoutes } from '../modules/shopAnalytics/shopAnalytics.routes';
import { ProductTagRoutes } from '../modules/tag/tag.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { VendorRoutes } from '../modules/vendor/vendor.routes';
import { VendorAnalyticsRoutes } from '../modules/vendorAnalytics/vendorAnalytics.routes';
import { VerificationCodeRoutes } from '../modules/verificationCode/verificationCode.routes';

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
    path: '/verification',
    route: VerificationCodeRoutes,
  },
  {
    path: '/customers',
    route: CustomerRoutes,
  },
  {
    path: '/addresses',
    route: AddressRoutes,
  },
  {
    path: '/vendors',
    route: VendorRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
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
    path: '/shops',
    route: ShopRoutes,
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
    path: '/product_attributes',
    route: ProductAttributeRoutes,
  },
  {
    path: '/product_variants',
    route: ProductVariantRoutes,
  },
  {
    path: '/tags',
    route: ProductTagRoutes,
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
  {
    path: '/analytics/admin',
    route: AdminAnalyticsRoutes,
  },
  {
    path: '/analytics/vendor',
    route: VendorAnalyticsRoutes,
  },
  {
    path: '/analytics/shop',
    route: ShopAnalyticsRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
