import { notFound, redirect } from "next/navigation";
import { categoryFromRouteSlug, categoryPath, eraFromRouteSlug } from "@/lib/routes";

// Categories are sections of the civilization page, not pages of their own:
// /roma/personajes takes the visitor to /roma#personajes.
export default async function CategoryPage({ params }: PageProps<"/[era]/[category]">) {
  const { era: eraSlug, category: categorySlug } = await params;
  const era = eraFromRouteSlug(eraSlug);
  const category = categoryFromRouteSlug(categorySlug);

  if (!era || !category) {
    notFound();
  }
  redirect(categoryPath(era, category));
}
