// Searchable fields for admin queries
export const adminSearchableFields = [
  'firstName',
  'lastName',
  'phoneNumber',
  'designation',
  'department',
  'user.email',
];

// Filterable fields for admin queries
export const adminFilterableFields = [
  'searchTerm',
  'firstName',
  'lastName',
  'phoneNumber',
  'designation',
  'department',
  'isActive',
  'createdAt',
  'updatedAt',
];

// Relational fields for admin queries
export const adminRelationalFields = ['user'];

export const adminRelationalFieldsMapper: { [key: string]: string } = {
  user: 'user',
};

// Admin designations
export const adminDesignations = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'SUPERVISOR',
  'SUPPORT',
] as const;

// Admin departments
export const adminDepartments = [
  'ADMINISTRATION',
  'CUSTOMER_SERVICE',
  'FINANCE',
  'IT',
  'MARKETING',
  'OPERATIONS',
  'SALES',
  'SUPPORT',
] as const;

// Admin constants
export const ADMIN_CONSTANTS = {
  DELETION_STATUS: {
    ACTIVE: 'ACTIVE',
    DELETED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
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

// Fields to include in admin responses
export const adminProfileFields = {
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
