
import BlogCategoryPage from "@/components/BlogCategoryPage";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function SecurityPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const page =
    Math.max(
      1,
      Number.parseInt(
        params.page || "1",
        10
      ) || 1
    );

  return (
    <BlogCategoryPage
      category="Security"
      title="Security"
      description="Stay informed about online security, privacy, scams, account protection and safer ways to use technology."
      page={page}
    />
  );
}

