
import BlogCategoryPage from "@/components/BlogCategoryPage";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AIPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const page = Math.max(
    1,
    Number.parseInt(params.page || "1", 10) || 1
  );

  return (
    <BlogCategoryPage
      category="AI"
      title="AI"
      description="Discover practical AI tools, updates, guides and useful ways artificial intelligence is changing everyday technology."
      page={page}
    />
  );
}

