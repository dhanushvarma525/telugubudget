import CategoryProductCard from "@/components/CategoryProductCard";
import Pagination from "@/components/Pagination";
import { getBaseUrl } from "@/lib/getBaseUrl";

const PRODUCTS_PER_PAGE = 10;


async function getProducts(page:number) {

  const url =
    `${getBaseUrl()}/api/products?page=${page}&limit=100`;


  const res = await fetch(url, {
    cache:"no-store",
  });


  if(!res.ok){
    throw new Error("Failed to fetch products");
  }


  return res.json();

}



export default async function MomsFavoritesPage({

  searchParams,

}:{

  searchParams: Promise<{page?:string}>;

}) {


  const params = await searchParams;


  const currentPage = Number(
    params.page || "1"
  );


  const data = await getProducts(currentPage);



  // Get only Mom's Favorites products
  const momProducts = data.products.filter(
    (product:any)=>
      product.categories?.includes(
        "Mom's Favorites"
      )
  );



  console.log(
    "FINAL MOM PRODUCTS:",
    momProducts.map((p:any)=>({
      id:p.id,
      name:p.name,
      categories:p.categories
    }))
  );



  const totalPages = Math.ceil(
    momProducts.length / PRODUCTS_PER_PAGE
  );


  const start =
    (currentPage - 1) * PRODUCTS_PER_PAGE;


  const products =
    momProducts.slice(
      start,
      start + PRODUCTS_PER_PAGE
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
        👩 Mom's Favorites
      </h1>



      <p
        className="
        mb-6
        sm:mb-8
        text-gray-600
        "
      >
        Useful and loved products specially selected for moms.
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
          products.length === 0 ? (

            <p className="text-gray-500 text-lg">
              No products found.
            </p>

          ) : (

            products.map((product:any)=>(


              <CategoryProductCard

                key={product.id}

                id={product.id}

                name={product.name}

                price={product.price}

                image={product.image}

                coupon={product.coupon}

                coupon_available={
                  product.coupon_available
                }

              />


            ))

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