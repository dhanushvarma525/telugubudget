import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="
      mx-6
      mt-6
      rounded-3xl
      bg-black
      text-white
      p-12
      md:p-20
      text-center
      "
    >

      <h1 className="text-4xl md:text-6xl font-bold">
        BIG DEALS EVERY DAY
      </h1>


      <p className="mt-5 text-xl">
        Best Products at Best Prices
      </p>


      <Link href="/categories/todays-deals">

        <button
          className="
          mt-8
          bg-white
          text-black
          px-8
          py-3
          rounded-full
          font-bold
          hover:bg-gray-200
          "
        >
          Shop Now
        </button>

      </Link>


    </section>
  );
}