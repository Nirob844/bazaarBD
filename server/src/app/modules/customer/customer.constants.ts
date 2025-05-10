/* eslint-disable no-unused-vars */
export const customerFilterableFields = [
  'firstName',
  'lastName',
  'phoneNumber',
  'user.isEmailVerified',
  'user.isLocked',
  'user.role',
  'user.lastLogin',
  'createdAt',
  'updatedAt',
];

export const customerSearchableFields = [
  'firstName',
  'lastName',
  'phoneNumber',
  'user.email',
  'addresses.address',
  'addresses.city',
  'addresses.state',
  'addresses.country',
  'addresses.postalCode',
];

export const customerRelationalFields = [
  'user',
  'addresses',
  'cart',
  'orders',
  'reviews',
];

export const customerRelationalFieldsMapper: { [key: string]: string } = {
  user: 'user',
  addresses: 'addresses',
  cart: 'cart',
  orders: 'orders',
  reviews: 'reviews',
};

export const customerProfileFields = {
  basic: {
    id: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    createdAt: true,
    updatedAt: true,
  },
  user: {
    id: true,
    email: true,
    role: true,
    isEmailVerified: true,
    lastLogin: true,
  },
  addresses: {
    id: true,
    address: true,
    city: true,
    state: true,
    country: true,
    postalCode: true,
    isDefault: true,
  },
  cart: {
    id: true,
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    },
  },
  orders: {
    id: true,
    status: true,
    total: true,
    createdAt: true,
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    },
  },
  reviews: {
    id: true,
    rating: true,
    comment: true,
    createdAt: true,
    product: {
      select: {
        id: true,
        name: true,
        images: true,
      },
    },
  },
};

export const customerSortableFields = [
  'firstName',
  'lastName',
  'phoneNumber',
  'createdAt',
  'updatedAt',
  'user.lastLogin',
];

// Constants for customer operations
export const CUSTOMER_CONSTANTS = {
  ROLES: {
    CUSTOMER: 'CUSTOMER',
  },
  DELETION_STATUS: {
    ACTIVE: 'ACTIVE',
    DELETED: 'DELETED',
  },
  VERIFICATION_STATUS: {
    VERIFIED: true,
    UNVERIFIED: false,
  },
  ACCOUNT_STATUS: {
    LOCKED: true,
    UNLOCKED: false,
  },
  STATS_PERIODS: {
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    THIS_YEAR: 'this_year',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  SEARCH: {
    MIN_TERM_LENGTH: 2,
    MAX_TERM_LENGTH: 50,
  },
} as const;

// Type for customer profile selection
export type CustomerProfileSelect = {
  [K in keyof typeof customerProfileFields]: boolean;
};

// Type for customer filter request
export type ICustomerFilterRequest = {
  searchTerm?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  'user.isEmailVerified'?: boolean;
  'user.isLocked'?: boolean;
  'user.role'?: string;
  'user.lastLogin'?: string;
  createdAt?: string;
  updatedAt?: string;
};
