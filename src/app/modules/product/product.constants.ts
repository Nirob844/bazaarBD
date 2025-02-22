export const productSearchAbleFields: string[] = ['name', 'description'];

export const productFilterAbleFields: string[] = [
  'searchTerm',
  'status',
  'price',
  'categoryId',
  'inventoryId',
];
export const productRelationalFields: string[] = ['categoryId', 'inventoryId'];
export const productRelationalFieldsMapper: { [key: string]: string } = {
  categoryId: 'category',
  inventoryId: 'inventory',
};
