// utils/unitOptions.ts
// Utility for getting unit options based on ingredient category

import { Strings } from "@/constants/Strings";

export function getUnitOptions(category: any): string[] {
  if (!category) return [Strings.units._100_grams, Strings.units._200_grams, Strings.units._1_kg];
  const cat =
    typeof category === "object" && category.title
      ? category.title.toLowerCase()
      : String(category).toLowerCase();
      console.log("Determining unit options for category:", category);
  if (cat.includes(Strings.liquid)) {
    return [
      Strings.units._50_ml,
      Strings.units._100_ml,
      Strings.units._250_ml,
      Strings.units._500_ml,
      Strings.units._1_litre,
      Strings.units.tablespoon,
      Strings.units.teaspoon,
      Strings.units.cup,
    ];
  }
  if (
    cat.includes(Strings.fruit) ||
    cat.includes(Strings.veggies) ||
    cat.includes(Strings.vegetable) ||
    cat.includes(Strings.meat)
  ) {
    return [Strings.units._100_grams, Strings.units._200_grams, Strings.units._1_kg, Strings.units.tablespoon, Strings.units.teaspoon, Strings.units.cup];
  }
  // Default
  return [Strings.units._100_grams, Strings.units._200_grams, Strings.units._1_kg, Strings.units.tablespoon, Strings.units.teaspoon, Strings.units.cup];
}
