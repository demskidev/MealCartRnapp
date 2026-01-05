// utils/unitOptions.ts
// Utility for getting unit options based on ingredient category

export function getUnitOptions(category: any): string[] {
  if (!category) return ["100 grm", "200 grm", "1 kg"];
  const cat =
    typeof category === "object" && category.title
      ? category.title.toLowerCase()
      : String(category).toLowerCase();
      console.log("Determining unit options for category:", category);
  if (cat.includes("liquid")) {
    return [
      "50 ml",
      "100 ml",
      "250 ml",
      "500 ml",
      "1 Litre",
      "tablespoon",
      "teaspoon",
      "cup",
    ];
  }
  if (
    cat.includes("fruit") ||
    cat.includes("veggie") ||
    cat.includes("vegetable") ||
    cat.includes("meat")
  ) {
    return ["100 grm", "200 grm", "1 kg", "tablespoon", "teaspoon", "cup"];
  }
  // Default
  return ["100 grm", "200 grm", "1 kg", "tablespoon", "teaspoon", "cup"];
}
