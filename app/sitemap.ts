import { MetadataRoute } from "next";


export default async function sitemap()
: Promise<MetadataRoute.Sitemap> {


  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";



  let products:any[] = [];

  let blogs:any[] = [];





  // PRODUCTS

  try {

    const productsRes =
      await fetch(
        `${baseUrl}/api/products`,
        {
          cache:"no-store"
        }
      );


    const productsData =
      await productsRes.json();



    products =
      productsData.products || [];



  }
  catch(error){

    console.log(
      "Products sitemap error",
      error
    );

  }





  // BLOGS

  try {


    const blogsRes =
      await fetch(
        `${baseUrl}/api/blogs`,
        {
          cache:"no-store"
        }
      );


    const blogsData =
      await blogsRes.json();



    blogs =
      blogsData.blogs || [];



  }
  catch(error){

    console.log(
      "Blogs sitemap error",
      error
    );

  }







  return [


    // HOME

    {
      url:baseUrl,

      lastModified:new Date()

    },





    // PRODUCTS

    ...products.map(
      (product:any)=>({

        url:
        `${baseUrl}/products/${product.id}`,

        lastModified:
        product.updated_at
        ?
        new Date(product.updated_at)
        :
        new Date()

      })
    ),





    // BLOGS

    ...blogs
    .filter(
      (blog:any)=>
      blog.published
    )
    .map(
      (blog:any)=>({

        url:
        `${baseUrl}/blog/${blog.slug}`,

        lastModified:
        blog.updated_at
        ?
        new Date(blog.updated_at)
        :
        new Date()

      })
    )


  ];

}