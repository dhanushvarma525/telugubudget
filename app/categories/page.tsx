import Categories from "@/components/Categories";


export default async function CategoriesPage(){
await new Promise((resolve) => setTimeout(resolve, 2000));
  return (

    <main
      className="
      min-h-screen
      bg-gray-100
      p-4
      "
    >

      <h1
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        🛍️ All Categories
      </h1>


      <Categories />


    </main>

  );

}