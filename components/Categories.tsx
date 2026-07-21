import Link from "next/link";

export default function Categories() {

  const categories = [
 {
  name: "🔥 Today's Deals",
  image: "/images/uploads/todays-deals.png",
  link: "/categories/todays-deals",
},
  {
    name: "💰 Products Under ₹150",
    image: "/images/uploads/under-150.png",
    link: "/categories/under-150",
  },
  {
    name: "❤️ Impress Your Crush",
    image: "/images/uploads/crush.png",
    link: "/categories/crush",
  },
  {
    name: "👩 Mom's Favorites",
    image: "/images/uploads/mom.png",
    link: "/categories/mom",
  },
 {
  name: "👗 Men & Women Wear",
  image: "/images/uploads/dresses.png",
  link: "/categories/men-women-wear",
},
  {
    name: "🕉️ Devotional",
    image: "/images/uploads/devotional.png",
    link: "/categories/devotional",
  },
  {
    name: "📱 Electronics",
    image: "/images/uploads/electronics.png",
    link: "/categories/electronics",
  },
  {
    name: "👗 Fashion",
    image: "/images/uploads/fashion.png",
    link: "/categories/fashion",
  },
];


  return (

    <section className="max-w-7xl mx-auto px-4 py-8">

      <h2 className="text-2xl md:text-3xl font-bold mb-6">
        Shop by Category
      </h2>


      <div
        className="
        grid
        grid-cols-4
        gap-3
        md:gap-5
        "
      >

        {categories.map((category) => (

          <Link
            href={category.link}
            key={category.name}
          >

            <div
              className="
              bg-white
              rounded-xl
              shadow-sm
              hover:shadow-lg
              transition
              p-3
              text-center
              cursor-pointer
              "
            >

              <img
                src={category.image}
                alt={category.name}
                className="
                w-full
                aspect-square
                object-cover
                rounded-lg
                "
              />


              <p
                className="
                mt-2
                text-xs
                md:text-sm
                font-semibold
                line-clamp-2
                "
              >
                {category.name}
              </p>


            </div>

          </Link>

        ))}

      </div>


    </section>

  );
}