import type { Metadata } from "next";


export const metadata: Metadata = {

  title: "About AnantaGo",

  description:
    "Learn about AnantaGo, a shopping discovery platform sharing useful products, deals, buying guides and recommendations.",

};



export default function AboutPage() {

  return (

    <main className="min-h-screen bg-slate-50 py-10 px-4">

      <div className="
      max-w-5xl
      mx-auto
      bg-white
      rounded-2xl
      shadow-lg
      overflow-hidden
      ">


        <div className="
        bg-gradient-to-r
        from-blue-600
        to-indigo-700
        text-white
        px-8
        py-10
        ">


          <h1 className="
          text-4xl
          font-extrabold
          ">

            About AnantaGo

          </h1>


          <p className="
          mt-3
          text-blue-100
          leading-7
          ">

            Helping you discover better products, smarter deals,
            and useful recommendations.

          </p>


        </div>





        <div className="p-8 md:p-10">


          <p className="text-gray-700 leading-8">

            Welcome to <strong>AnantaGo</strong>, a shopping discovery
            platform created to help people find useful products,
            trending deals, and budget-friendly recommendations.

          </p>





          <section className="mt-10">


            <h2 className="text-2xl font-bold text-blue-600 mb-4">

              Our Mission

            </h2>


            <p className="text-gray-700 leading-8">

              Our mission is simple — make online shopping easier by
              discovering valuable products, sharing buying guides,
              and helping users make informed purchase decisions.

            </p>


          </section>






          <section className="mt-10">


            <h2 className="text-2xl font-bold text-blue-600 mb-4">

              What We Do

            </h2>


            <ul className="
            list-disc
            ml-6
            text-gray-700
            space-y-2
            ">


              <li>
                Discover useful products and trending deals
              </li>


              <li>
                Share product reviews and buying guides
              </li>


              <li>
                Recommend value-for-money products
              </li>


              <li>
                Create helpful shopping content
              </li>


            </ul>


          </section>







          <section className="mt-10">


            <h2 className="text-2xl font-bold text-blue-600 mb-4">

              Why Trust AnantaGo?

            </h2>


            <p className="text-gray-700 leading-8">

              We aim to provide clear information and useful
              recommendations. Our goal is to help users save time
              while discovering products that fit their needs.

            </p>


          </section>






          <section className="mt-10">


            <h2 className="text-2xl font-bold text-blue-600 mb-4">

              Affiliate Disclosure

            </h2>


            <p className="text-gray-700 leading-8">

              Some links on AnantaGo may be affiliate links.
              If you purchase through these links, we may earn a
              small commission at no extra cost to you.

            </p>


          </section>






          <p className="
          mt-10
          text-sm
          text-gray-500
          ">

            Last updated: July 2026

          </p>




        </div>


      </div>


    </main>

  );

}