// Searchable fields for user queries
export const userSearchableFields: string[] = [
  'email',
  'role',
  'customer.firstName',
  'customer.lastName',
  'customer.phone',
  'vendor.businessName',
  'vendor.businessEmail',
  'vendor.businessPhone',
];

// Filterable fields for user queries
export const userFilterableFields: string[] = [
  'searchTerm',
  'role',
  'isEmailVerified',
  'isLocked',
  'deletionStatus',
  'createdAt',
  'updatedAt',
  'lastLogin',
];

// Relational fields for user queries
export const userRelationalFields: string[] = ['customer', 'vendor', 'admin'];

// Fields to include in user responses
export const userProfileFields = {
  basic: {
    id: true,
    email: true,
    role: true,
    isEmailVerified: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  },
  customer: {
    id: true,
    firstName: true,
    lastName: true,
    phone: true,
    avatar: true,
    addresses: true,
  },
  vendor: {
    id: true,
    businessName: true,
    businessEmail: true,
    businessPhone: true,
    isVerified: true,
    shops: {
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        analytics: true,
      },
    },
  },
  admin: {
    id: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
  },
};

// Sortable fields for user queries
export const userSortableFields: string[] = [
  'email',
  'role',
  'createdAt',
  'updatedAt',
  'lastLogin',
  'isEmailVerified',
  'isLocked',
];

// User role constants
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

// User deletion status constants
export const DELETION_STATUS = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
  ARCHIVED: 'ARCHIVED',
} as const;

// User verification status constants
export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

// User account status constants
export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
  SUSPENDED: 'SUSPENDED',
} as const;

// User statistics time periods
export const STATS_TIME_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

// User pagination defaults
export const USER_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// User search defaults
export const USER_SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 50,
} as const;
