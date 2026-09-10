
import BlogCategoryPage from "@/components/BlogCategoryPage";

export default async function AIPage({
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
      category="AI"
      title="AI"
      description="Discover practical AI tools, updates, guides and useful ways artificial intelligence is changing everyday technology."
      page={page}
    />
  );
}

