"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
export default function EditProductPage() {

  const router = useRouter();

  const params = useParams();

 const id = String(params.id);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");

  const [category, setCategory] = useState("");

  const [price, setPrice] = useState("");

  const [oldPrice, setOldPrice] = useState("");

  const [image, setImage] = useState("");

  const [affiliateLink, setAffiliateLink] = useState("");
  useEffect(() => {

  loadProduct();

}, []);
async function loadProduct() {

  try {

    const response = await fetch(`/api/products/${id}`);

    const data = await response.json();

    setName(data.name);

    setCategory(data.category);

    setPrice(data.price);

    setOldPrice(data.old_price);

    setImage(data.image);

    setAffiliateLink(data.affiliate_link);

  } catch (error) {

    alert("Failed to load product");

  } finally {

    setLoading(false);

  }

}
async function handleImageUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {

  const file = e.target.files?.[0];

  if (!file) return;

  setUploading(true);

  try {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {

      setImage(data.image);

      alert("Image uploaded successfully");

    } else {

      alert(data.message);

    }

  } catch (error) {

    console.log(error);

    alert("Image upload failed");

  } finally {

    setUploading(false);

  }

}

async function updateProduct() {

  if (!name || !price || !image) {

    alert("Please fill all required fields");

    return;

  }

  setSaving(true);

  try {

    const response = await fetch(

      `/api/products/${id}`,

      {

        method: "PUT",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify({

          name,

          category,

          price,

          old_price: oldPrice,

          image,

          affiliate_link: affiliateLink

        })

      }

    );

    const data = await response.json();

    if (data.success) {

      alert("Product updated successfully");

      router.push("/admin/products");

    } else {

      alert(data.message);

    }

  } catch (error) {

    console.log(error);

    alert("Update failed");

  } finally {

    setSaving(false);

  }
}


if (loading) {

  return (

    <div className="flex items-center justify-center h-screen text-2xl font-bold">

      Loading Product...

    </div>

  );

}
return (

  <main className="max-w-3xl mx-auto p-8">

    <h1 className="text-3xl font-bold mb-8">

      Edit Product

    </h1>
<div className="mb-6">

  <label className="block mb-2 font-semibold">

    Product Name

  </label>

  <input

    type="text"

    value={name}

    onChange={(e)=>setName(e.target.value)}

    className="w-full border rounded-lg p-3"

  />

</div>
<div className="mb-6">

  <label className="block mb-2 font-semibold">

    Category

  </label>

  <select

    value={category}

    onChange={(e)=>setCategory(e.target.value)}

    className="w-full border rounded-lg p-3"

  >

    <option>Today's Deals</option>

    <option>Mobiles</option>

    <option>Electronics</option>

    <option>Fashion</option>

    <option>Kitchen</option>

    <option>Home</option>

    <option>Beauty</option>

    <option>Books</option>

    <option>Devotional</option>

    <option>Under ₹150</option>

  </select>

</div>
<div className="mb-6">

  <label className="block mb-2 font-semibold">

    Price

  </label>

  <input

    type="text"

    value={price}

    onChange={(e)=>setPrice(e.target.value)}

    className="w-full border rounded-lg p-3"

  />

</div>
<div className="mb-6">

  <label className="block mb-2 font-semibold">

    Old Price

  </label>

  <input

    type="text"

    value={oldPrice}

    onChange={(e)=>setOldPrice(e.target.value)}

    className="w-full border rounded-lg p-3"

  />

</div>
<div className="mb-6">

  <label className="block mb-2 font-semibold">

    Current Image

  </label>

  {image && (

    <img
      src={image}
      alt="Product"
      className="w-40 h-40 object-cover rounded border"
    />

  )}

</div>
<div className="mb-6">

  <label className="block mb-2 font-semibold">

    Upload New Image

  </label>

  <input

    type="file"

    accept="image/*"

    onChange={handleImageUpload}

    className="w-full"

  />

  {uploading && (

    <p className="text-blue-600 mt-2">

      Uploading...

    </p>

  )}

</div>
<div className="mb-6">

  <label className="block mb-2 font-semibold">

    Affiliate Link

  </label>

  <input

    type="text"

    value={affiliateLink}

    onChange={(e)=>setAffiliateLink(e.target.value)}

    className="w-full border rounded-lg p-3"

  />

</div>
<button

  onClick={updateProduct}

  disabled={saving}

  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"

>

  {saving ? "Saving..." : "Save Changes"}

</button>
  </main>

);
}