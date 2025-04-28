import prisma from '../../../shared/prisma';

const updateVendorAnalytics = async (
  productId: string,
  quantity: number,
  price: number
) => {
  // Find the product to get the vendorId
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { vendorId: true },
  });

  if (!product || !product.vendorId) {
    throw new Error('Product or Vendor not found!');
  }

  const vendorId = product.vendorId;
  const totalSaleAmount = price * quantity;

  // Check if vendor analytics already exists
  let analytics = await prisma.vendorAnalytics.findUnique({
    where: { vendorId },
  });

  if (!analytics) {
    // Create new analytics if not exists
    analytics = await prisma.vendorAnalytics.create({
      data: { vendorId },
    });
  }

  // Calculate the new average rating if available
  //   let newRating = analytics.rating;
  //   if (rating) {
  //     const newRatingCount = analytics.totalOrders + 1;
  //     const newTotalRating = (newRating ?? 0) * analytics.totalOrders + rating;
  //     newRating = newTotalRating / newRatingCount;
  //   }

  // Update vendor analytics
  await prisma.vendorAnalytics.update({
    where: { id: analytics.id },
    data: {
      totalSales: { increment: totalSaleAmount },
      totalOrders: { increment: 1 },
    },
  });
};

const getVendorAnalytics = async (vendorId: string) => {
  const analytics = await prisma.vendorAnalytics.findUnique({
    where: { vendorId },
  });

  if (!analytics) {
    throw new Error('Vendor Analytics not found!');
  }

  return analytics;
};

export const VendorAnalyticsService = {
  updateVendorAnalytics,
  getVendorAnalytics,
};
