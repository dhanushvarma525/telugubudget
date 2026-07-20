"use client";

type Props = {
  name: string;
};

export default function ShareButton({ name }: Props) {
  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out this product on TeluguBudget!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Product link copied to clipboard!");
    }
  }

  return (
    <button
      onClick={handleShare}
      className="
      mt-4
      w-full
      bg-blue-600
      hover:bg-blue-700
      text-white
      py-3
      rounded-xl
      font-bold
      "
    >
      📤 Share Product
    </button>
  );
}