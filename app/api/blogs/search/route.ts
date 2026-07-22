import { supabase } from "@/lib/supabase";


export async function GET(
req:Request
){

  const {searchParams}=new URL(req.url);


  const query =
  searchParams.get("q");



  if(!query){

    return Response.json({
      blogs:[]
    });

  }



  const {data,error}=await supabase
  .from("blogs")
  .select("*")
  .eq("published",true)
  .or(
    `title.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`
  )
  .order(
    "created_at",
    {
      ascending:false
    }
  );



  if(error){

    return Response.json(
      {
        error:error.message
      },
      {
        status:500
      }
    );

  }



  return Response.json({

    blogs:data

  });


}