import {
  AttributeType,
  Inventory,
  Product,
  ProductAttribute,
  ProductImage,
  ProductStatus,
  ProductTag,
  ProductVariant,
  Promotion,
  PromotionType,
  Review,
  StockStatus,
} from '@prisma/client';

export type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

export type CreateProductData = {
  name: string;
  description?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  taxRate?: number;
  taxClass?: string;
  minimumOrder?: number;
  maximumOrder?: number;
  bulkPricing?: Record<string, number>;
  sku: string;
  barcode?: string;
  status?: ProductStatus;
  stockStatus?: StockStatus;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  packageSize?: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass?: string;
  isBackorder?: boolean;
  backorderLimit?: number;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  featuredUntil?: Date;
  categoryId: string;
  vendorId: string;
  shopId?: string;
  inventory?: {
    stock: number;
    lowStockThreshold?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    location?: string;
    binNumber?: string;
    warehouseId?: string;
  };

  attributes?: Array<{
    attribute?: {
      id?: string; // Use if referencing an existing attribute
      name: string;
      type: AttributeType; // This is required!
      description?: string;
      isRequired?: boolean;
      isFilterable?: boolean;
      isVisible?: boolean;
      displayOrder?: number;
      values?: {
        value: string;
        displayValue?: string;
        isDefault?: boolean;
        displayOrder?: number;
      }[];
    };
    value: string; // The actual value used in the product
    displayValue?: string; // Optional, for display
    isFilterable?: boolean;
    isVisible?: boolean;
    displayOrder?: number;
  }>;

  variants?: Array<{
    name: string;
    sku?: string;
    basePrice?: number;
    salePrice?: number;
    costPrice?: number;
    taxRate?: number;
    taxClass?: string;
    minimumOrder?: number;
    maximumOrder?: number;
    stockStatus?: StockStatus;
    isBackorder?: boolean;
    backorderLimit?: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    attributes: Record<string, string>;
    imageUrl?: string;
    barcode?: string;
    upc?: string;
    ean?: string;
    isActive?: boolean;
    isDefault?: boolean;
    isVisible?: boolean;
    inventory?: {
      stock: number;
      lowStockThreshold?: number;
      reorderPoint?: number;
      reorderQuantity?: number;
      location?: string;
      binNumber?: string;
      warehouseId?: string;
    };
  }>;
  tags?: string[];
  images?: string[];
  promotions?: Array<{
    type: PromotionType;
    discountValue: number;
    isPercentage?: boolean;
    startDate: Date | string;
    endDate: Date | string;
    isActive?: boolean;
    maxUses?: number;
    currentUses?: number;
  }>;
};

export type ProductWithRelations = Product & {
  category: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
  shop: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  vendor: {
    id: string;
    businessName: string;
    businessEmail: string;
    imageUrl: string | null;
  };
  images: ProductImage[];
  inventory: Inventory | null;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  tags: ProductTag[];
  promotions: Promotion[];
  reviews: (Review & {
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      avatar: string | null;
    };
  })[];
};

export type VendorSelect = {
  id: true;
  businessName: true;
  businessEmail: true;
  imageUrl: true;
};

export type ShopSelect = {
  id: true;
  name: true;
  logo: true;
};
