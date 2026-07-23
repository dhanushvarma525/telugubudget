import CategoryProductCard from "@/components/CategoryProductCard";
import Pagination from "@/components/Pagination";
import { getBaseUrl } from "@/lib/getBaseUrl";

const PRODUCTS_PER_PAGE = 30;


async function getProducts(page: number) {

  const res = await fetch(
    `${getBaseUrl()}/api/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
    {
      cache: "no-store",
    }
  );


  if (!res.ok) {

    throw new Error("Failed to fetch products");

  }


  return res.json();

}




export default async function DadPage({

  searchParams,

}: {

  searchParams: Promise<{ page?: string }>;

}) {


  const params = await searchParams;


  const currentPage = Number(
    params.page || "1"
  );



  const {
    products,
    totalPages

  } = await getProducts(currentPage);





  const dadProducts = products.filter(

    (product:any) =>

      product.category === "Dad's Essentials"

  );





  return (

    <main
      className="
      min-h-screen
      bg-gray-100
      p-4
      sm:p-8
      "
    >



      <h1
        className="
        text-2xl
        sm:text-4xl
        font-bold
        mb-3
        "
      >

        👨 Dad's Essentials

      </h1>





      <p
        className="
        mb-6
        sm:mb-8
        text-gray-600
        "
      >

        Best gifts and useful products for dads.

      </p>






      <div
        className="
        grid
        grid-cols-2
        sm:grid-cols-3
        lg:grid-cols-4
        gap-3
        sm:gap-6
        "
      >



        {
          dadProducts.length === 0 ? (

            <p className="text-lg text-gray-500">

              No products found.

            </p>


          ) : (


            dadProducts.map(

              (product:any)=>(


                <CategoryProductCard

                  key={product.id}

                  id={product.id}

                  name={product.name}

                  price={product.price}

                  image={product.image}

                  coupon={product.coupon}

                  coupon_available={product.coupon_available}

                />


              )

            )


          )
        }


      </div>






      <div
        className="
        mt-10
        sm:mt-12
        flex
        justify-center
        "
      >


        <Pagination

          currentPage={currentPage}

          totalPages={totalPages}

        />


      </div>



    </main>

  );

}