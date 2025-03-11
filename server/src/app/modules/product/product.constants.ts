export const productSearchAbleFields: string[] = ['name', 'description'];

export const productFilterAbleFields: string[] = [
  'searchTerm',
  'status',
  'price',
  'categoryId',
  'inventoryId',
  'promotionId',
];
export const productRelationalFields: string[] = [
  'categoryId',
  'inventoryId',
  'promotionId',
];
export const productRelationalFieldsMapper: { [key: string]: string } = {
  categoryId: 'category',
  inventoryId: 'inventory',
  promotionId: 'promotions',
};
