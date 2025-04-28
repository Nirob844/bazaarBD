import prisma from '../../../shared/prisma';

const updateAdminAnalytics = async () => {
  // Calculate total users
  const totalUsers = await prisma.user.count();

  // Calculate total orders
  const totalOrders = await prisma.order.count();

  // Calculate total revenue
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
  });

  // Calculate total vendors
  const totalVendors = await prisma.vendor.count();

  // Calculate total products
  const totalProducts = await prisma.product.count();

  // Calculate total customers
  const totalCustomers = await prisma.customer.count();

  // Check if AdminAnalytics exists
  let adminAnalytics = await prisma.adminAnalytics.findUnique({
    where: { id: 'admin' }, // Assuming there's only one admin record
  });

  if (!adminAnalytics) {
    // Create new admin analytics if not exists
    adminAnalytics = await prisma.adminAnalytics.create({
      data: {
        id: 'admin', // Static ID for the single record
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalVendors,
        totalProducts,
        totalCustomers,
      },
    });
  } else {
    // Update existing admin analytics
    adminAnalytics = await prisma.adminAnalytics.update({
      where: { id: 'admin' },
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalVendors,
        totalProducts,
        totalCustomers,
      },
    });
  }

  return adminAnalytics;
};

const getAdminAnalytics = async () => {
  const adminAnalytics = await prisma.adminAnalytics.findUnique({
    where: { id: 'admin' }, // Assuming only one admin analytics record
  });

  if (!adminAnalytics) {
    throw new Error('Admin Analytics not found!');
  }

  return adminAnalytics;
};

export const AdminAnalyticsService = {
  updateAdminAnalytics,
  getAdminAnalytics,
};
