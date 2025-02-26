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
    include: {
      product: {
        select: {
          name: true,
        },
      },
    },
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
      product: true,
      history: true,
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

    await prisma.inventory.update({
      where: { id },
      data: {
        stock: {
          increment: payload.stock, // Adds new stock safely
        },
        history: {
          create: {
            action: 'IN',
            quantityChange: payload.stock,
            previousStock: existingInventory.stock,
            newStock: existingInventory.stock + payload.stock,
          },
        },
      },
    });
  }

  return prisma.inventory.findUnique({
    where: { id },
    include: { history: true },
  }) as Promise<Inventory>;
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
