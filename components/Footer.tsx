import Link from "next/link";

export default function Footer() {

  const year = new Date().getFullYear();


  return (

    <footer className="bg-slate-950 text-gray-300 mt-14 border-t border-slate-800">

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">


        {/* BRAND */}

        <div>

          <Link
            href="/"
            className="text-3xl font-black tracking-tight"
          >
            <span className="text-blue-500">Ananta</span>
            <span className="text-orange-500">Go</span>
          </Link>


          <p className="mt-5 leading-7 text-gray-400 text-sm">
            Discover the best Amazon & Flipkart deals,
            trending products, honest reviews and
            smart shopping recommendations—all in one place.
          </p>


          <div className="mt-6">

            <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              Infinite Deals
            </span>


            <span className="inline-block ml-2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
              Smarter Shopping
            </span>

          </div>

        </div>





        {/* QUICK LINKS */}

        <div>

          <h3 className="text-white font-bold text-lg mb-5">
            Quick Links
          </h3>


          <div className="flex flex-col gap-3">


            <Link href="/" className="hover:text-blue-400 transition">
              🏠 Home
            </Link>


            <Link href="/categories" className="hover:text-blue-400 transition">
              📂 Categories
            </Link>


            <Link href="/categories/todays-deals" className="hover:text-blue-400 transition">
              🔥 Today's Deals
            </Link>


            <Link href="/blog" className="hover:text-blue-400 transition">
              📝 Blogs
            </Link>


            <Link href="/contact" className="hover:text-blue-400 transition">
              📞 Contact
            </Link>


          </div>

        </div>






        {/* LEGAL */}

        <div>

          <h3 className="text-white font-bold text-lg mb-5">
            Legal
          </h3>


          <div className="flex flex-col gap-3">


            <Link href="/about" className="hover:text-blue-400 transition">
              👤 About Us
            </Link>


            <Link href="/privacy" className="hover:text-blue-400 transition">
              🔒 Privacy Policy
            </Link>


            <Link href="/terms" className="hover:text-blue-400 transition">
              📄 Terms & Conditions
            </Link>


            <Link href="/disclaimer" className="hover:text-blue-400 transition">
              ⚠️ Disclaimer
            </Link>


            <Link href="/affiliate-disclosure" className="hover:text-blue-400 transition">
              💰 Affiliate Disclosure
            </Link>


          </div>

        </div>






        {/* SUPPORT */}

        <div>


          <h3 className="text-white font-bold text-lg mb-5">
            Need Help?
          </h3>


          <p className="text-sm text-gray-400 leading-7">
            Have a question, suggestion, or found a better deal?
            We'd love to hear from you.
          </p>


          <Link
            href="/contact"
            className="inline-flex items-center justify-center mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Contact Us
          </Link>


          <div className="mt-6 text-sm text-gray-400 space-y-2">

            <p>✔ Trusted Product Recommendations</p>

            <p>✔ Updated Deals Every Day</p>

            <p>✔ Honest Reviews</p>

          </div>


        </div>


      </div>





      {/* BOTTOM */}

      <div className="border-t border-slate-800">


        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">


          <p className="text-sm text-gray-400 text-center md:text-left">

            © {year}{" "}

            <span className="font-semibold text-white">
              Ananta<span className="text-orange-500">Go</span>
            </span>

            . All Rights Reserved.

          </p>




          <p className="text-xs text-gray-500 text-center md:text-right max-w-2xl">

            Some links on this website are affiliate links.
            If you purchase through these links, we may earn
            a small commission at no extra cost to you.

          </p>


        </div>


      </div>


    </footer>

  );

}