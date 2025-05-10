export const adminSearchableFields = [
  'firstName',
  'lastName',
  'phoneNumber',
  'designation',
  'department',
];

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

export const adminRelationalFields = ['user'];

export const adminRelationalFieldsMapper: { [key: string]: string } = {
  user: 'user',
};

export const adminDesignations = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'SUPERVISOR',
  'SUPPORT',
] as const;

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
