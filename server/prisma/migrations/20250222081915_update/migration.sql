/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `cart_id` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `min_stock_level` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `restock_date` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `stock_quantity` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `action_type` on the `InventoryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `inventory_id` on the `InventoryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `last_quantity` on the `InventoryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `new_quantity` on the `InventoryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_changed` on the `InventoryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `delivered_at` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipped_at` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_method` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `category_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `inventory_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `vendor_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cartId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action` to the `InventoryHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryId` to the `InventoryHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newStock` to the `InventoryHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousStock` to the `InventoryHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityChange` to the `InventoryHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('IN', 'OUT');

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_product_id_fkey";

-- DropForeignKey
ALTER TABLE "InventoryHistory" DROP CONSTRAINT "InventoryHistory_inventory_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_order_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_product_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_order_id_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_inventory_id_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_user_id_fkey";

-- DropIndex
DROP INDEX "Inventory_product_id_key";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "cart_id",
DROP COLUMN "createdAt",
DROP COLUMN "product_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "cartId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "createdAt",
DROP COLUMN "min_stock_level",
DROP COLUMN "product_id",
DROP COLUMN "restock_date",
DROP COLUMN "stock_quantity",
DROP COLUMN "updatedAt",
ADD COLUMN     "minStock" INTEGER,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "restockDate" TIMESTAMP(3),
ADD COLUMN     "stock" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "InventoryHistory" DROP COLUMN "action_type",
DROP COLUMN "inventory_id",
DROP COLUMN "last_quantity",
DROP COLUMN "new_quantity",
DROP COLUMN "quantity_changed",
ADD COLUMN     "action" "ActionType" NOT NULL,
ADD COLUMN     "inventoryId" TEXT NOT NULL,
ADD COLUMN     "newStock" INTEGER NOT NULL,
ADD COLUMN     "previousStock" INTEGER NOT NULL,
ADD COLUMN     "quantityChange" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "delivered_at",
DROP COLUMN "payment_method",
DROP COLUMN "payment_status",
DROP COLUMN "shipped_at",
DROP COLUMN "shipping_address",
DROP COLUMN "shipping_method",
DROP COLUMN "total_price",
DROP COLUMN "user_id",
ADD COLUMN     "total" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "createdAt",
DROP COLUMN "order_id",
DROP COLUMN "product_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category_id",
DROP COLUMN "inventory_id",
DROP COLUMN "vendor_id",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "vendorId" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "full_name",
DROP COLUMN "is_verified",
DROP COLUMN "phone_number",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Profile";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_key" ON "Inventory"("productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryHistory" ADD CONSTRAINT "InventoryHistory_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
