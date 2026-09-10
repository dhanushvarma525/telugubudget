
import BlogCategoryPage from "@/components/BlogCategoryPage";

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const parsedPage = params?.page
    ? Number.parseInt(params.page, 10)
    : 1;

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  return (
    <BlogCategoryPage
      category="Apps"
      title="Apps"
      description="Discover useful apps, new features, productivity tools and interesting software worth knowing about."
      page={page}
    />
  );
}

