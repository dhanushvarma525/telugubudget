import { writeFile, mkdir } from "fs/promises";
import path from "path";


export async function POST(req: Request) {


  try {


    const formData = await req.formData();


    const file = formData.get("file") as File;



    if (!file) {

      return Response.json({

        success:false,

        message:"No file selected"

      });

    }




    const bytes = await file.arrayBuffer();


    const buffer = Buffer.from(bytes);




    const fileName =
      Date.now()
      +
      "-"
      +
      file.name.replace(/\s+/g, "-");





    const uploadFolder = path.join(

      process.cwd(),

      "public",

      "uploads"

    );





    await mkdir(

      uploadFolder,

      {
        recursive:true
      }

    );





    const filePath = path.join(

      uploadFolder,

      fileName

    );





    await writeFile(

      filePath,

      buffer

    );





    return Response.json({

      success:true,

      image:`/uploads/${fileName}`

    });





  }

  catch(error:any){


    console.log(
      "UPLOAD ERROR:",
      error
    );



    return Response.json({

      success:false,

      message:error.message

    });


  }


}