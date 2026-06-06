"use client";

import PageShell from "@/components/layout/PageShell";
import CollectionView from "@/components/modules/CollectionView";
import { useBulletStore } from "@/lib/store/bulletStore";

export default function CollectionPageClient({ id }: { id: string }) {
  const scope = useBulletStore((s) => s.scopes[`collection-${id}`]);
  const name = scope?.label || "Collection";

  return (
    <PageShell title={name} subtitle="Collection">
      <CollectionView id={id} name={name} />
    </PageShell>
  );
}
