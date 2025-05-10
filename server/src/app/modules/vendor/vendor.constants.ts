export const vendorSearchableFields: string[] = [
  'businessName',
  'businessEmail',
  'businessPhone',
  'taxId',
];

export const vendorFilterableFields: string[] = [
  'searchTerm',
  'isVerified',
  'hasActiveShops',
  'deletionStatus',
  'businessName',
  'businessEmail',
  'businessPhone',
  'taxId',
];

export const vendorRelationalFields: string[] = [
  'userId',
  'shops',
  'products',
  'bankAccounts',
];

export const vendorRelationalFieldsMapper: { [key: string]: string } = {
  userId: 'user',
  shops: 'shops',
  products: 'products',
  bankAccounts: 'bankAccounts',
};

// Fields that can be used for sorting
export const vendorSortableFields: string[] = [
  'businessName',
  'createdAt',
  'updatedAt',
  'isVerified',
  'totalSales',
  'totalOrders',
  'rating',
];

// Fields that are included in the vendor profile
export const vendorProfileFields = {
  basic: {
    id: true,
    businessName: true,
    businessEmail: true,
    businessPhone: true,
    taxId: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
  },
  analytics: {
    totalSales: true,
    totalOrders: true,
    rating: true,
  },
  shops: {
    id: true,
    name: true,
    isActive: true,
    analytics: {
      totalSales: true,
      totalOrders: true,
      totalProducts: true,
      visitorCount: true,
    },
  },
  products: {
    id: true,
    name: true,
    basePrice: true,
    salePrice: true,
    stockStatus: true,
    averageRating: true,
    ratingCount: true,
  },
  bankAccounts: {
    id: true,
    bankName: true,
    accountType: true,
    isDefault: true,
    isVerified: true,
  },
  user: {
    email: true,
    lastLogin: true,
    isEmailVerified: true,
  },
};
