import Navbar from "@/components/Navbar";
import TrendingDeals from "@/components/TrendingDeals";
import Categories from "@/components/Categories";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import { getBaseUrl } from "@/lib/getBaseUrl";


const PRODUCTS_PER_PAGE = 30;



async function getProducts(page:number){

  const res = await fetch(
    `${getBaseUrl()}/api/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
    {
      cache:"no-store",
    }
  );


  if(!res.ok){

    const errorText = await res.text();

    console.log(
      "PRODUCT API ERROR:",
      errorText
    );

    throw new Error(errorText);

  }


  return res.json();

}




export default async function Home({

  searchParams,

}:{

  searchParams: Promise<{page?:string}>;

}){


  const params = await searchParams;


  const currentPage = Number(
    params.page || "1"
  );



  const {
    products,
    totalPages

  } = await getProducts(currentPage);




  // Trending Products = latest products
  // Hot Picks are handled separately

  const trendingProducts = products;



  return (

    <main
      className="
      min-h-screen
      bg-gray-100
      "
    >



      <Navbar />



      {/* 🔥 TOP HOT PICKS SLIDER */}

      <TrendingDeals />



      <Categories />





      <section
        className="
        mx-auto
        max-w-7xl
        px-4
        py-8
        sm:px-6
        "
      >



        <div
          className="
          flex
          items-center
          justify-between
          mb-6
          "
        >


          <h2
            className="
            text-2xl
            sm:text-3xl
            font-bold
            "
          >

            🔥 Trending Products

          </h2>



          <p
            className="
            text-sm
            text-gray-500
            "
          >

            Page {currentPage} / {totalPages}

          </p>


        </div>





        <div
          className="
          grid
          grid-cols-2
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
          sm:gap-6
          "
        >


          {

            trendingProducts.length === 0 ? (

              <p
                className="
                col-span-full
                text-gray-500
                "
              >

                No products available.

              </p>


            ) : (


              trendingProducts.map((product:any)=>(


                <ProductCard

                  key={product.id}

                  id={product.id}

                  name={product.name}

                  price={product.price}

                  image={product.image}

                  affiliate_link={
                    product.affiliate_link
                  }

                />


              ))


            )


          }



        </div>





        <div
          className="
          mt-10
          flex
          justify-center
          "
        >


          <Pagination

            currentPage={currentPage}

            totalPages={totalPages}

          />


        </div>



      </section>




      <Footer />


    </main>

  );

}