import { AppShell } from "@/components/AppShell";
import { ArticleCard, Empty, PageHeading } from "@/components/CampusContent";
import { useCampusData } from "@/hooks/useCampusData";

export function CategoryPage({ slug }: { slug: string }) {
  const { articles, categories } = useCampusData();
  const category = categories.data?.find((c) => c.slug === slug);
  const filtered = articles.data?.filter((a) => a.categories?.slug === slug);
  return (
    <AppShell>
      <PageHeading
        title={category?.name ?? "Categoria"}
        subtitle={category?.description ?? undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered?.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {filtered?.length === 0 && <Empty />}
      </div>
    </AppShell>
  );
}
