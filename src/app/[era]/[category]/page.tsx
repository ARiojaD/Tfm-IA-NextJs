import { notFound, redirect } from "next/navigation";
import { categoryFromRouteSlug, categoryPath, eraFromRouteSlug } from "@/lib/routes";

// Las categorías son secciones de la página de la civilización, no páginas propias:
// /roma/personajes lleva al visitante a /roma#personajes.
export default async function CategoryPage({ params }: PageProps<"/[era]/[category]">) {
  const { era: eraSlug, category: categorySlug } = await params;
  const era = eraFromRouteSlug(eraSlug);
  const category = categoryFromRouteSlug(categorySlug);

  if (!era || !category) {
    notFound();
  }
  redirect(categoryPath(era, category));
}
