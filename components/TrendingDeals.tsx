import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";


async function getHotPicks() {

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("hot_pick", true)
    .order("id", { ascending: false })
    .limit(5);



  if(error){

    console.log(
      "HOT PICK ERROR:",
      error
    );

    return [];

  }


  return data || [];

}





export default async function TrendingDeals(){


  const products = await getHotPicks();



  return (

    <section
      className="
      max-w-7xl
      mx-auto
      px-3
      py-4
      "
    >


      <h2
        className="
        text-xl
        font-bold
        mb-3
        "
      >

        🔥 Today's Hot Picks

      </h2>





      {
        products.length === 0 ? (

          <p className="text-gray-500">

            No hot picks available

          </p>


        ) : (



          <div
            className="
            flex
            gap-3
            overflow-x-auto
            scrollbar-hide
            "
          >


            {
              products.map((product:any)=>(


                <div

                  key={product.id}

                  className="
                  min-w-[30%]
                  sm:min-w-[220px]
                  "

                >



                  <ProductCard


                    id={product.id}


                    name={product.name}


                    price={product.price}


                    old_price={product.old_price}


                    image={product.image}


                    affiliate_link={
                      product.affiliate_link
                    }


                  />



                </div>


              ))
            }



          </div>


        )
      }




    </section>

  );

}