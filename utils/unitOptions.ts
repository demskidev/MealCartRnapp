// utils/unitOptions.ts
// Utility for getting unit options based on ingredient category

export function getUnitOptions(category: any): string[] {
  if (!category) return ['100grm', '200grm', '1kg'];
  const cat = typeof category === 'object' && category.name ? category.name.toLowerCase() : String(category).toLowerCase();
  if (cat.includes('liquid')) {
    return ['50ml', '100ml', '250ml', '500ml', '1L', 'tablespoon'];
  }
  if (cat.includes('fruit') || cat.includes('veggie') || cat.includes('vegetable') || cat.includes('meat')) {
    return ['100grm', '200grm', '1kg', 'tablespoon'];
  }
  // Default
  return ['100grm', '200grm', '1kg', 'tablespoon'];
}
