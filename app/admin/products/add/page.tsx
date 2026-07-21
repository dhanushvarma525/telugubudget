"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function AddProductPage() {


  const router = useRouter();



  const [name, setName] = useState("");

  const [categories, setCategories] = useState<string[]>([]);


  const [price, setPrice] = useState("");

  const [oldPrice, setOldPrice] = useState("");



  const [image, setImage] = useState("");

  const [image2, setImage2] = useState("");

  const [image3, setImage3] = useState("");

  const [image4, setImage4] = useState("");

  const [image5, setImage5] = useState("");

  const [image6, setImage6] = useState("");



  const [affiliateLink, setAffiliateLink] = useState("");



  const [description, setDescription] = useState("");

  const [features, setFeatures] = useState("");



  const [rating, setRating] = useState("5");


  const [stock, setStock] = useState("In Stock");



  const [brand, setBrand] = useState("");

  const [coupon, setCoupon] = useState("");

  const [delivery, setDelivery] = useState("Free Delivery");



  // 🔥 NEW HOT PICK SWITCH

  const [hotPick, setHotPick] = useState(false);



  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);





  const availableCategories = [


    "Today's Deals",


    "Under ₹150",


    "Impress Your Crush",


    "Mom's Favorites",


    "Dad's Essentials",


    "Devotional",


    "Electronics",


    "Fashion",


    "Men & Women Wear",


  ];





  function toggleCategory(categoryName:string){


    setCategories((prev)=>


      prev.includes(categoryName)

      ? prev.filter(
          (item)=>item !== categoryName
        )

      : [
          ...prev,
          categoryName
        ]


    );


  }






  async function uploadImage(

    file:File,

    setImageFunction:any

  ){


    setUploading(true);



    try{


      const formData = new FormData();



      formData.append(
        "file",
        file
      );




      const res = await fetch(

        "/api/upload",

        {

          method:"POST",

          body:formData,

        }

      );



      const data = await res.json();




      if(data.success){


        setImageFunction(
          data.image
        );


      }

      else{


        alert(data.message);


      }



    }

    catch(error){


      console.log(error);

      alert(
        "Image upload failed"
      );


    }

    finally{


      setUploading(false);


    }


  }






  async function handleUpload(

    e:React.ChangeEvent<HTMLInputElement>,

    setImageFunction:any

  ){


    const file =
      e.target.files?.[0];



    if(!file){

      return;

    }



    await uploadImage(

      file,

      setImageFunction

    );


  }
  async function saveProduct() {


  if (

    !name ||

    !price ||

    !image ||

    categories.length === 0

  ) {


    alert(
      "Main image, name, price and category are required."
    );


    return;


  }




  setSaving(true);



  try {



    const res = await fetch(

      "/api/products",

      {

        method:"POST",


        headers:{

          "Content-Type":
          "application/json",

        },



        body:JSON.stringify({



          name,



          // Old category support

          category:
          categories[0],



          // Multiple categories

          categories,




          price,



          old_price:
          oldPrice,




          image,

          image2,

          image3,

          image4,

          image5,

          image6,




          affiliate_link:
          affiliateLink,




          description,

          features,




          rating,

          stock,




          brand,

          coupon,

          delivery,




          // 🔥 IMPORTANT

          // Controls homepage Today's Hot Picks

          hot_pick:
          hotPick,



        }),



      }

    );






    const data =
      await res.json();





    if(data.success){



      alert(
        "Product Added Successfully"
      );



      router.push(
        "/admin/products"
      );



    }

    else{



      alert(
        data.message
      );



    }





  }

  catch(error){



    console.log(error);



    alert(
      "Something went wrong"
    );



  }

  finally{



    setSaving(false);



  }



}return (

<main
className="
min-h-screen
bg-gray-100
p-8
"
>


<div
className="
max-w-3xl
mx-auto
bg-white
rounded-xl
shadow
p-8
"
>


<h1
className="
text-3xl
font-bold
mb-6
"
>
Add Product
</h1>




<input

placeholder="Product Name"

value={name}

onChange={(e)=>
setName(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

/>





<div
className="
border
rounded-lg
p-4
mb-4
"
>


<p
className="
font-semibold
mb-3
"
>
Select Categories
</p>



<div
className="
grid
grid-cols-2
gap-3
"
>


{

availableCategories.map((cat)=>(


<label

key={cat}

className="
flex
items-center
gap-2
"

>


<input

type="checkbox"

checked={
categories.includes(cat)
}

onChange={()=>
toggleCategory(cat)
}

/>



<span>
{cat}
</span>



</label>



))


}


</div>


</div>





{/* 🔥 HOT PICK SWITCH */}

<div
className="
flex
items-center
gap-3
mb-5
"
>


<input

type="checkbox"

checked={hotPick}

onChange={(e)=>
setHotPick(e.target.checked)
}

className="
w-5
h-5
"

/>


<label
className="
font-semibold
"
>

🔥 Show in Today's Hot Picks

</label>


</div>







<input

placeholder="Brand"

value={brand}

onChange={(e)=>
setBrand(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

/>





<input

placeholder="Price"

value={price}

onChange={(e)=>
setPrice(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

/>





<input

placeholder="Old Price"

value={oldPrice}

onChange={(e)=>
setOldPrice(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

/>





<p
className="
font-semibold
mb-2
"
>
Main Image (Required)
</p>




<input

type="file"

accept="image/*"

onChange={(e)=>
handleUpload(
e,
setImage
)
}

className="mb-4"

/>





{
image && (

<img

src={image}

alt="Main Product"

className="
w-32
h-32
object-cover
rounded
mb-4
"

/>

)

}<p className="font-semibold mb-2">
  Additional Images (Optional)
</p>


{
[
  {
    label:"Image 2",
    setter:setImage2,
    value:image2
  },

  {
    label:"Image 3",
    setter:setImage3,
    value:image3
  },

  {
    label:"Image 4",
    setter:setImage4,
    value:image4
  },

  {
    label:"Image 5",
    setter:setImage5,
    value:image5
  },

  {
    label:"Image 6",
    setter:setImage6,
    value:image6
  },

].map((img,index)=>(


<div
key={index}
className="mb-4"
>


<p className="font-medium mb-2">
{img.label}
</p>


<input

type="file"

accept="image/*"

onChange={(e)=>
handleUpload(
e,
img.setter
)
}

className="mb-2"

/>



{
img.value && (

<img

src={img.value}

alt={img.label}

className="
w-32
h-32
object-cover
rounded
"

/>

)

}


</div>


))
}






<textarea

placeholder="Product Description"

value={description}

onChange={(e)=>
setDescription(e.target.value)
}

className="
w-full
border
p-3
rounded
h-32
mb-4
"

/>





<textarea

placeholder="About this item / Features (one per line)"

value={features}

onChange={(e)=>
setFeatures(e.target.value)
}

className="
w-full
border
p-3
rounded
h-40
mb-4
"

/>





<input

placeholder="Rating (Example: 4.5)"

value={rating}

onChange={(e)=>
setRating(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

/>





<select

value={stock}

onChange={(e)=>
setStock(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

>


<option value="In Stock">
🟢 In Stock
</option>


<option value="Out of Stock">
🔴 Out of Stock
</option>


</select>







<input

placeholder="Coupon (Example: EXTRA10)"

value={coupon}

onChange={(e)=>
setCoupon(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

/>







<input

placeholder="Delivery (Example: Free Delivery)"

value={delivery}

onChange={(e)=>
setDelivery(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-4
"

/>







<input

placeholder="Amazon / Flipkart Affiliate Link"

value={affiliateLink}

onChange={(e)=>
setAffiliateLink(e.target.value)
}

className="
w-full
border
p-3
rounded
mb-6
"

/>






{
uploading && (

<p
className="
text-blue-600
mb-4
"
>
Uploading image...
</p>

)

}







<button

onClick={saveProduct}

disabled={
saving ||
uploading
}

className="
w-full
bg-orange-500
hover:bg-orange-600
text-white
py-3
rounded-lg
font-bold
disabled:opacity-50
"

>


{
saving
?
"Saving..."
:
"Save Product"
}


</button>




</div>


</main>


);

}