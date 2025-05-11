// Searchable fields for shop queries
export const shopSearchAbleFields: string[] = [
  'name',
  'slug',
  'address',
  'contactEmail',
  'contactPhone',
  'description',
  'vendor.businessName',
  'vendor.businessEmail',
];

// Filterable fields for shop queries
export const shopFilterAbleFields: string[] = [
  'searchTerm',
  'name',
  'address',
  'contactEmail',
  'contactPhone',
  'isActive',
  'vendorId',
  'createdAt',
  'updatedAt',
];

// Relational fields for shop queries
export const shopRelationalFields: string[] = ['vendor'];

export const shopRelationalFieldsMapper: { [key: string]: string } = {
  vendor: 'vendor',
};

// Shop status constants
export const SHOP_CONSTANTS = {
  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
  },
  DELETION_STATUS: {
    ACTIVE: 'ACTIVE',
    DELETED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
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
