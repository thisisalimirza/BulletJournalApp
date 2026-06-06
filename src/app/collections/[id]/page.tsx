import CollectionPageClient from "./CollectionPageClient";

// Collections are user-generated at runtime. We pre-render a placeholder so the
// static export accepts this dynamic route; the client-side router renders the
// actual collection for any real ID without needing a pre-built HTML file.
export async function generateStaticParams() {
  return [{ id: "_" }];
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionPageClient id={id} />;
}
