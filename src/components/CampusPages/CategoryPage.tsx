import { AppShell } from "@/components/AppShell";
import { ArticleCard, BackButton, Empty, PageHeading } from "@/components/CampusContent";
import { useCampusData } from "@/hooks/useCampusData";

export function CategoryPage({ slug }: { slug: string }) {
  const { articles, categories } = useCampusData();
  const category = categories.data?.find((c) => c.slug === slug);
  const filtered = articles.data?.filter((a) => a.categories?.slug === slug);
  return (
    <AppShell>
      <BackButton fallbackTo="/noticias" />
      <PageHeading title={category?.name ?? "Categoria"} />
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered?.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {filtered?.length === 0 && <Empty />}
      </div>
    </AppShell>
  );
}
