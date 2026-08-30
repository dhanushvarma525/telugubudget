
import BlogCategoryPage from "@/components/BlogCategoryPage";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function TechPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const page = Math.max(
    1,
    Number.parseInt(params.page || "1", 10) || 1
  );

  return (
    <BlogCategoryPage
      category="Tech"
      title="Technology"
      description="Explore technology news, trends, gadgets, software and useful developments shaping the digital world."
      page={page}
    />
  );
}

