export const shopSearchAbleFields: string[] = [
  'name',
  'slug',
  'address',
  'contactEmail',
  'contactPhone',
];

export const shopFilterAbleFields: string[] = ['searchTerm', 'address'];
export const shopRelationalFields: string[] = ['vendorId'];
export const shopRelationalFieldsMapper: { [key: string]: string } = {
  vendorId: 'vendor',
};
