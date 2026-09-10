
import BlogCategoryPage from "@/components/BlogCategoryPage";

export default async function SecurityPage({
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
      category="Security"
      title="Security"
      description="Stay informed about online security, privacy, scams, account protection and safer ways to use technology."
      page={page}
    />
  );
}

