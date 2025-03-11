export const productSearchAbleFields: string[] = ['name', 'description'];

export const productFilterAbleFields: string[] = [
  'searchTerm',
  'status',
  'price',
  'categoryId',
  'inventoryId',
  'promotionId',
  'promotionType',
];
export const productRelationalFields: string[] = [
  'categoryId',
  'inventoryId',
  'promotionId',
  'promotionType',
];
export const productRelationalFieldsMapper: { [key: string]: string } = {
  categoryId: 'category',
  inventoryId: 'inventory',
  promotionId: 'promotions',
  promotionType: 'promotions',
};
