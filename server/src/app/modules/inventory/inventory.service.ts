import { Inventory, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: Inventory): Promise<Inventory> => {
  const { productId, stock } = data;
  const inventory = await prisma.inventory.create({
    data: {
      productId,
      stock,
      history: {
        create: {
          action: 'IN',
          quantityChange: stock,
          previousStock: 0,
          newStock: stock,
        },
      },
    },
    include: {
      history: true, // Return history with inventory
    },
  });

  return inventory;
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Inventory[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.InventoryWhereInput[] = [];

  const whereConditions: Prisma.InventoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.inventory.findMany({
    where: whereConditions,
    skip,
    take: limit,
    // orderBy:
    //   options.sortBy && options.sortOrder
    //     ? { [options.sortBy]: options.sortOrder }
    //     : {
    //         createdAt: 'desc',
    //       },
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
    where: {
      id,
    },
    include: {
      history: true,
      product: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Inventory>
): Promise<Inventory> => {
  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });

  if (!existingInventory) throw new Error('Inventory not found!');

  if (payload.stock !== undefined) {
    if (payload.stock < 0) throw new Error('Stock cannot be negative!');

    await prisma.inventoryHistory.create({
      data: {
        inventoryId: id,
        action: payload.stock > existingInventory.stock ? 'IN' : 'OUT',
        quantityChange: Math.abs(payload.stock - existingInventory.stock),
        previousStock: existingInventory.stock,
        newStock: payload.stock,
      },
    });
  }

  return prisma.inventory.update({
    where: { id },
    data: payload,
    include: { history: true },
  });
};

const deleteByIdFromDB = async (id: string): Promise<Inventory> => {
  const existingInventory = await prisma.inventory.findUnique({
    where: { id },
  });

  if (!existingInventory) throw new Error('Inventory not found!');

  await prisma.inventoryHistory.deleteMany({ where: { inventoryId: id } });

  return prisma.inventory.delete({ where: { id } });
};

export const InventoryService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};
