export const DEFAULT_CATEGORY_ICONS = {
  "bills & utilities": "💡",
  "bills": "💡",
  "utilities": "💡",
  "electricity": "⚡",
  "water": "💧",
  "internet": "🌐",
  "education": "🎓",
  "entertainment": "🎬",
  "movies": "🍿",
  "food & dining": "🍔",
  "food": "🍔",
  "dining": "🍽️",
  "restaurants": "🍽️",
  "groceries": "🛒",
  "healthcare": "🏥",
  "health": "🏥",
  "medical": "💊",
  "shopping": "🛍️",
  "transportation": "🚗",
  "transport": "🚗",
  "fuel": "⛽",
  "travel": "✈️",
  "salary": "💵",
  "income": "💰",
  "investment": "📈",
  "investments": "📈",
  "personal": "👤",
  "other": "📦",
};

/**
 * Returns a valid emoji icon for a category.
 * If the icon is missing or corrupted ('?'), maps category name to a known emoji or returns empty string.
 */
export function getCategoryIcon(icon, name = "") {
  if (icon && icon !== "?" && icon !== "null" && icon !== "undefined" && icon.trim() !== "") {
    return icon;
  }
  const key = (name || "").toLowerCase().trim();
  return DEFAULT_CATEGORY_ICONS[key] || "";
}

/**
 * Returns formatted label: e.g. "💡 Bills & Utilities" or just "CategoryName" if no icon.
 */
export function formatCategoryLabel(icon, name = "") {
  const resolved = getCategoryIcon(icon, name);
  return resolved ? `${resolved} ${name}` : name;
}
