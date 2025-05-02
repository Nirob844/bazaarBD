import prisma from '../../../shared/prisma';

const updateShopAnalytics = async (
  productId: string,
  quantity: number,
  price: number
) => {
  // Find the product to get the shopId
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { shopId: true },
  });

  if (!product || !product.shopId) {
    throw new Error('Product or Shop not found!');
  }

  const shopId = product.shopId;
  const totalSaleAmount = price * quantity;

  // Check if shop analytics already exists
  let analytics = await prisma.shopAnalytics.findUnique({
    where: { shopId },
  });

  if (!analytics) {
    // Create new analytics if not exists
    analytics = await prisma.shopAnalytics.create({
      data: { shopId },
    });
  }

  // Update shop analytics
  await prisma.shopAnalytics.update({
    where: { id: analytics.id },
    data: {
      totalSales: { increment: totalSaleAmount },
      totalOrders: { increment: 1 },
      visitorCount: { increment: 1 },
    },
  });
};

const getShopAnalytics = async (shopId: string) => {
  const analytics = await prisma.shopAnalytics.findUnique({
    where: { shopId },
  });

  if (!analytics) {
    throw new Error('Shop Analytics not found!');
  }

  return analytics;
};

export const ShopAnalyticsService = {
  updateShopAnalytics,
  getShopAnalytics,
};
