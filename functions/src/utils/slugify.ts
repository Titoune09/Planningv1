/**
 * Convertit un nom en slug URL-friendly
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '') // Remove leading/trailing -
}

/**
 * Génère un slug unique en ajoutant un suffixe si nécessaire
 */
export async function generateUniqueSlug(
  db: FirebaseFirestore.Firestore,
  baseName: string
): Promise<string> {
  let slug = slugify(baseName)
  let counter = 1

  // Check if slug exists
  while (true) {
    const existing = await db
      .collection('orgs')
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (existing.empty) {
      return slug
    }

    slug = `${slugify(baseName)}-${counter}`
    counter++
  }
}
