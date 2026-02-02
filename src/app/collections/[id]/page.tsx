"use client";

import { use } from "react";
import PageShell from "@/components/layout/PageShell";
import CollectionView from "@/components/modules/CollectionView";
import { useBulletStore } from "@/lib/store/bulletStore";

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const scope = useBulletStore((s) => s.scopes[`collection-${id}`]);
  const name = scope?.label || "Collection";

  return (
    <PageShell title={name} subtitle="Collection">
      <CollectionView id={id} name={name} />
    </PageShell>
  );
}
