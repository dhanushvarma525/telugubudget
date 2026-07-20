import Link from "next/link";

export default function Categories() {
  const categories = [
    {
      name: "🔥 Today's Deals",
      image: "/images/todays-deals.png",
      link: "/categories/todays-deals",
    },
    {
      name: "💰 Products Under ₹150",
      image: "/images/under-150.png",
      link: "/categories/under-150",
    },
    {
      name: "❤️ Impress Your Crush",
      image: "/images/crush.png",
      link: "/categories/crush",
    },
    {
      name: "👩 Mom's Favorites",
      image: "/images/mom.png",
      link: "/categories/mom",
    },
    {
      name: "👨 Dad's Essentials",
      image: "/images/dad.png",
      link: "/categories/dad",
    },
    {
      name: "🕉️ Devotional",
      image: "/images/devotional.png",
      link: "/categories/devotional",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">

      <h2 className="text-4xl font-bold mb-8">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

        {categories.map((category) => (

          <Link
            href={category.link}
            key={category.name}
          >

            <div
              className="
              bg-white
              rounded-2xl
              shadow-md
              overflow-hidden
              hover:shadow-xl
              hover:-translate-y-1
              transition
              cursor-pointer
              "
            >

              <img
                src={category.image}
                alt={category.name}
                className="w-full h-40 object-cover"
              />

              <div className="p-4 text-center font-semibold">
                {category.name}
              </div>

            </div>

          </Link>

        ))}

      </div>

    </section>
  );
}