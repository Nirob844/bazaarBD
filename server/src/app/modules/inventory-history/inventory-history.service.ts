import { InventoryHistory, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: {
  inventoryId: string;
  action: string;
  quantityChange: number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  performedBy?: string;
}): Promise<InventoryHistory> => {
  const inventory = await prisma.inventory.findUnique({
    where: { id: data.inventoryId },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  const previousStock = inventory.stock;
  const newStock = previousStock + data.quantityChange;

  // Update inventory stock
  await prisma.inventory.update({
    where: { id: data.inventoryId },
    data: {
      stock: newStock,
      availableStock: newStock - inventory.reservedStock,
    },
  });

  // Create history record
  const result = await prisma.inventoryHistory.create({
    data: {
      inventoryId: data.inventoryId,
      action: data.action as any,
      quantityChange: data.quantityChange,
      previousStock,
      newStock,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      notes: data.notes,
      performedBy: data.performedBy,
    },
    include: {
      inventory: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  return result;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<InventoryHistory[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { inventoryId, action, startDate, endDate, referenceType } = filters;

  const andConditions: Prisma.InventoryHistoryWhereInput[] = [];

  if (inventoryId) {
    andConditions.push({ inventoryId });
  }

  if (action) {
    andConditions.push({ action: action as any });
  }

  if (referenceType) {
    andConditions.push({ referenceType });
  }

  if (startDate && endDate) {
    andConditions.push({
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }

  const whereConditions: Prisma.InventoryHistoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.inventoryHistory.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      inventory: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  const total = await prisma.inventoryHistory.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getDataById = async (id: string): Promise<InventoryHistory | null> => {
  const result = await prisma.inventoryHistory.findUnique({
    where: { id },
    include: {
      inventory: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  return result;
};

const getInventoryHistory = async (
  inventoryId: string,
  options: IPaginationOptions
): Promise<IGenericResponse<InventoryHistory[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const result = await prisma.inventoryHistory.findMany({
    where: { inventoryId },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      inventory: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  const total = await prisma.inventoryHistory.count({
    where: { inventoryId },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getInventoryStats = async (inventoryId: string) => {
  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    include: {
      history: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  const stats = await prisma.inventoryHistory.groupBy({
    by: ['action'],
    where: { inventoryId },
    _sum: {
      quantityChange: true,
    },
    _count: {
      _all: true,
    },
  });

  const recentActivity = await prisma.inventoryHistory.findMany({
    where: { inventoryId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      inventory: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  return {
    currentStock: inventory.stock,
    availableStock: inventory.availableStock,
    reservedStock: inventory.reservedStock,
    lastUpdated: inventory.lastUpdated,
    lastCounted: inventory.lastCounted,
    stats,
    recentActivity,
  };
};

export const InventoryHistoryService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  getInventoryHistory,
  getInventoryStats,
};
