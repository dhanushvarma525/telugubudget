
import BlogCategoryPage from "@/components/BlogCategoryPage";

export default async function HowToPage({
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
      category="How-To"
      title="How-To Guides"
      description="Simple, practical technology guides that help you solve problems, configure devices and get more from your apps."
      page={page}
    />
  );
}

