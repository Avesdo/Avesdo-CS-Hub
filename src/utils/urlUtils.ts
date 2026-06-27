export function createBaseSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function generateUniqueSlug(name: string, existingSlugs: Set<string>): string {
  const baseSlug = createBaseSlug(name);
  if (!baseSlug) {
    // Fallback if name was purely special characters
    return `entity-${Math.random().toString(36).substring(2, 6)}`;
  }

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Duplicate found, append a 4-character random alphanumeric hash
  let uniqueSlug = '';
  let attempts = 0;
  do {
    const hash = Math.random().toString(36).substring(2, 6);
    uniqueSlug = `${baseSlug}-${hash}`;
    attempts++;
  } while (existingSlugs.has(uniqueSlug) && attempts < 10);

  return uniqueSlug;
}
