import { Inventory, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { InventoryHistoryService } from '../inventory-history/inventory-history.service';

const insertIntoDB = async (data: {
  productId: string;
  variantId?: string;
  sku: string;
  barcode?: string;
  location?: string;
  batchNumber?: string;
  expiryDate?: Date;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reservedStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  notes?: string;
}): Promise<Inventory> => {
  const result = await prisma.inventory.create({
    data: {
      ...data,
      availableStock: data.stock - (data.reservedStock || 0),
    },
    include: {
      product: true,
      variant: true,
    },
  });

  // Create initial history record
  await InventoryHistoryService.insertIntoDB({
    inventoryId: result.id,
    action: 'ADJUSTMENT',
    quantityChange: data.stock,
    notes: 'Initial stock',
  });

  return result;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<Inventory[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, productId, variantId, location, lowStock } = filters;

  const andConditions: Prisma.InventoryWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          product: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          product: {
            sku: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          variant: {
            sku: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  }

  if (productId) {
    andConditions.push({ productId });
  }

  if (variantId) {
    andConditions.push({ variantId });
  }

  if (location) {
    andConditions.push({ location });
  }

  if (lowStock === 'true') {
    // For low stock items, we'll first get all items with reorderPoint
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        reorderPoint: {
          not: null,
        },
      },
      select: {
        id: true,
        stock: true,
        reorderPoint: true,
      },
    });

    // Then filter items where stock <= reorderPoint
    const lowStockIds = lowStockItems
      .filter(item => item.stock <= (item.reorderPoint || 0))
      .map(item => item.id);

    andConditions.push({
      id: {
        in: lowStockIds,
      },
    });
  }

  const whereConditions: Prisma.InventoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.inventory.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      product: true,
      variant: true,
    },
  });

  const total = await prisma.inventory.count({
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

const getDataById = async (id: string): Promise<Inventory | null> => {
  const result = await prisma.inventory.findUnique({
    where: { id },
    include: {
      product: true,
      variant: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Inventory>
): Promise<Inventory> => {
  const inventory = await prisma.inventory.findUnique({
    where: { id },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  // If stock is being updated, create a history record
  if (payload.stock !== undefined && payload.stock !== inventory.stock) {
    const quantityChange = payload.stock - inventory.stock;
    await InventoryHistoryService.insertIntoDB({
      inventoryId: id,
      action: 'ADJUSTMENT',
      quantityChange,
      notes: 'Manual stock adjustment',
    });
  }

  const result = await prisma.inventory.update({
    where: { id },
    data: {
      ...payload,
      availableStock:
        payload.stock !== undefined
          ? payload.stock - (payload.reservedStock || inventory.reservedStock)
          : undefined,
    },
    include: {
      product: true,
      variant: true,
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Inventory> => {
  const result = await prisma.inventory.delete({
    where: { id },
    include: {
      product: true,
      variant: true,
    },
  });

  return result;
};

const reserveStock = async (
  id: string,
  quantity: number
): Promise<Inventory> => {
  const inventory = await prisma.inventory.findUnique({
    where: { id },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  if (inventory.availableStock < quantity) {
    throw new Error('Insufficient stock available');
  }

  const result = await prisma.inventory.update({
    where: { id },
    data: {
      reservedStock: {
        increment: quantity,
      },
      availableStock: {
        decrement: quantity,
      },
    },
    include: {
      product: true,
      variant: true,
    },
  });

  return result;
};

const releaseStock = async (
  id: string,
  quantity: number
): Promise<Inventory> => {
  const inventory = await prisma.inventory.findUnique({
    where: { id },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  if (inventory.reservedStock < quantity) {
    throw new Error('Insufficient reserved stock');
  }

  const result = await prisma.inventory.update({
    where: { id },
    data: {
      reservedStock: {
        decrement: quantity,
      },
      availableStock: {
        increment: quantity,
      },
    },
    include: {
      product: true,
      variant: true,
    },
  });

  return result;
};

const getInventorySummary = async () => {
  const totalProducts = await prisma.inventory.count({
    where: { variantId: null },
  });

  const totalVariants = await prisma.inventory.count({
    where: { variantId: { not: null } },
  });

  // For low stock items, we'll use the same approach as in getAllFromDB
  const lowStockItems = await prisma.inventory.findMany({
    where: {
      reorderPoint: {
        not: null,
      },
    },
    select: {
      id: true,
      stock: true,
      reorderPoint: true,
    },
  });

  const lowStockCount = lowStockItems.filter(
    item => item.stock <= (item.reorderPoint || 0)
  ).length;

  const outOfStockItems = await prisma.inventory.count({
    where: {
      stock: 0,
    },
  });

  // Get total stock value by joining with product to get cost price
  const inventoryWithCost = await prisma.inventory.findMany({
    select: {
      stock: true,
      product: {
        select: {
          costPrice: true,
        },
      },
    },
  });

  const totalStockValue = inventoryWithCost.reduce((sum, item) => {
    const stock = Number(item.stock) || 0;
    const costPrice = Number(item.product.costPrice) || 0;
    return sum + stock * costPrice;
  }, 0);

  return {
    totalProducts,
    totalVariants,
    lowStockItems: lowStockCount,
    outOfStockItems,
    totalStockValue,
  };
};

export const InventoryService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  reserveStock,
  releaseStock,
  getInventorySummary,
};
