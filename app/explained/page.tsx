
import BlogCategoryPage from "@/components/BlogCategoryPage";

export default async function ExplainedPage({
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
      category="Explained"
      title="Explained"
      description="Technology concepts explained simply, clearly and without unnecessary technical jargon."
      page={page}
    />
  );
}

