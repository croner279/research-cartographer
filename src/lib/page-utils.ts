export function formatPageNumbers(pages: number[]) {
  if (!pages.length) return "";
  const unique = [...new Set(pages)].sort((a, b) => a - b);
  return unique.map((page) => `p.${page}`).join(", ");
}
