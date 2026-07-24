import ReviewSection from "@/components/ReviewSection";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import ProductImageSlider from "@/components/ProductImageSlider";
import { getBaseUrl } from "@/lib/getBaseUrl";


async function getProduct(id: string) {

  const res = await fetch(
    `${getBaseUrl()}/api/products/${id}`,
    {
      cache: "no-store",
    }
  );


  if (!res.ok) {
    return null;
  }


  return await res.json();

}



async function getSimilarProducts(
  category: string,
  id: string
) {

  const res = await fetch(
    `${getBaseUrl()}/api/products`,
    {
      cache: "no-store",
    }
  );


  if (!res.ok) {
    return [];
  }


  const data = await res.json();


  const products = data.products || [];


  return products
    .filter(
      (item: any) =>
        item.category === category &&
        item.id !== Number(id)
    )
    .slice(0, 4);

}





export default async function ProductPage({

  params,

}: {

  params: Promise<{ id: string }>

}) {


  const { id } = await params;


  const product = await getProduct(id);



  if (!product) {

    return (

      <div className="p-10 text-center">

        Product Not Found

      </div>

    );

  }



  const similarProducts =
    await getSimilarProducts(
      product.category,
      id
    );



  const discount =
    product.old_price &&
    Number(product.old_price) > Number(product.price)
      ? Math.round(
          (
            (Number(product.old_price) - Number(product.price))
            /
            Number(product.old_price)
          ) * 100
        )
      : null;



  return (

    <main
      className="
      min-h-screen
      bg-gray-100
      p-3
      sm:p-6
      "
    >


      <div
        className="
        max-w-5xl
        mx-auto
        bg-white
        rounded-xl
        shadow-md
        p-5
        "
      >



        <ProductImageSlider

          images={[
            product.image,
            product.image2,
            product.image3,
            product.image4,
          ].filter(Boolean)}

        />





        <h1
          className="
          text-2xl
          sm:text-4xl
          font-bold
          mt-6
          "
        >

          {product.name}

        </h1>





        {
          product.brand &&

          <p className="text-gray-500 mt-2">

            Brand: {product.brand}

          </p>

        }





        {/* PRICE WITH DISCOUNT */}

        <div className="flex items-center gap-3 flex-wrap mt-4">


          <span
            className="
            text-3xl
            font-bold
            text-orange-600
            "
          >

            ₹{product.price}

          </span>




          {
            product.old_price &&
            Number(product.old_price) > Number(product.price) && (

              <span
                className="
                text-xl
                text-gray-400
                line-through
                "
              >

                ₹{product.old_price}

              </span>

            )
          }





          {
            discount && (

              <span
                className="
                bg-green-100
                text-green-700
                px-3
                py-1
                rounded-full
                text-sm
                font-bold
                "
              >

                {discount}% OFF

              </span>

            )
          }



        </div>







        {
          product.coupon &&

          <div
            className="
            mt-4
            bg-yellow-100
            p-3
            rounded-lg
            "
          >

            🎟️ Coupon:
            <b> {product.coupon}</b>

          </div>

        }






        <p
          className="
          text-gray-700
          mt-5
          leading-relaxed
          "
        >

          {product.description}

        </p>







        <div
          className="
          flex
          gap-3
          mt-6
          "
        >

          <WishlistButton
            product={product}
          />


          <ShareButton
            name={product.name}
          />

        </div>







        <a

          href={product.affiliate_link}

          target="_blank"

          rel="noopener noreferrer"

          className="
          block
          mt-6
          bg-orange-500
          hover:bg-orange-600
          text-white
          text-center
          py-3
          rounded-xl
          font-bold
          "

        >

          🛒 Buy Now

        </a>







        {
          product.pros &&

          <div className="mt-8">

            <h2 className="text-xl font-bold">

              ✅ Pros

            </h2>


            <p
              className="
              mt-2
              whitespace-pre-line
              text-gray-700
              "
            >

              {product.pros}

            </p>

          </div>

        }






        {
          product.cons &&

          <div className="mt-6">

            <h2 className="text-xl font-bold">

              ❌ Cons

            </h2>


            <p
              className="
              mt-2
              whitespace-pre-line
              text-gray-700
              "
            >

              {product.cons}

            </p>

          </div>

        }



      </div>







      <div
        className="
        max-w-5xl
        mx-auto
        mt-6
        bg-white
        rounded-xl
        shadow-md
        p-5
        "
      >

        <ReviewSection

          productId={product.id}

        />

      </div>






      {
        similarProducts.length > 0 &&

        <div
          className="
          max-w-5xl
          mx-auto
          mt-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            mb-4
            "
          >

            Similar Products

          </h2>



          <div
            className="
            grid
            grid-cols-2
            sm:grid-cols-4
            gap-4
            "
          >

            {
              similarProducts.map((item:any)=>(

                <a
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="
                  bg-white
                  rounded-xl
                  shadow
                  p-3
                  "
                >

                  <img

                    src={item.image}

                    alt={item.name}

                    className="
                    h-32
                    w-full
                    object-cover
                    rounded-lg
                    "

                  />


                  <p className="font-semibold mt-2 text-sm">

                    {item.name}

                  </p>


                </a>

              ))
            }

          </div>

        </div>

      }



    </main>

  );

}