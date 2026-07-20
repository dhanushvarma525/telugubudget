import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";


async function getProducts() {


  const res = await fetch(
    "http://localhost:3000/api/products",
    {
      cache:"no-store"
    }
  );


  return res.json();

}



export default async function Home() {


  const products = await getProducts();



  return (

    <main className="min-h-screen bg-gray-100">


      <Navbar />


      <Hero />


      <Categories />



      <section className="
      mx-auto
      max-w-7xl
      px-6
      py-10
      ">


        <h2 className="
        mb-6
        text-3xl
        font-bold
        ">
          🔥 Trending Products
        </h2>



        <div className="
        grid
        gap-6
        md:grid-cols-3
        ">


          {
            products.map((product:any)=>(


            <ProductCard
  id={product.id}
  name={product.name}
  price={product.price}
  image={product.image}
  affiliate_link={product.affiliate_link}
/>


            ))
          }


        </div>


      </section>



      <Footer />


    </main>

  );

}