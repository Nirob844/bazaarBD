export const vendorSearchableFields: string[] = [
  'businessName',
  'businessEmail',
  'businessPhone',
  'taxId',
  'user.email',
];

export const vendorFilterableFields: string[] = [
  'searchTerm',
  'isVerified',
  'createdAt',
  'updatedAt',
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
  user: {
    id: true,
    email: true,
    role: true,
    isEmailVerified: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  },
};

// Vendor constants
export const VENDOR_CONSTANTS = {
  DELETION_STATUS: {
    ACTIVE: 'ACTIVE',
    DELETED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
  },
  VERIFICATION_STATUS: {
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
  },
  ACCOUNT_STATUS: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    BLOCKED: 'BLOCKED',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  SEARCH: {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 50,
  },
} as const;
