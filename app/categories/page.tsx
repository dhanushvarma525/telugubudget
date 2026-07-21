import Categories from "@/components/Categories";


export default function CategoriesPage(){

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