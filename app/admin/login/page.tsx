"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function AdminLogin() {

  const router = useRouter();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);



  async function handleLogin() {


    if (!username || !password) {

      alert("Please enter username and password");

      return;

    }


    setLoading(true);


    try {


      const response = await fetch("/api/admin/login", {

        method: "POST",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify({

          username,

          password

        })

      });



      const data = await response.json();


      console.log("LOGIN RESPONSE:", data);



      if (data.success) {


        alert("Login Success");


        // Force navigation after cookie creation
        window.location.href = "/admin/dashboard";


      } else {


        alert(data.message || "Invalid Login");


      }



    } catch(error) {


      console.log("LOGIN ERROR:", error);

      alert("Server Error");


    } finally {


      setLoading(false);


    }


  }



  return (


    <main className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
    ">


      <div className="
        bg-white
        w-96
        p-8
        rounded-2xl
        shadow-lg
      ">


        <h1 className="
          text-3xl
          font-bold
          text-center
          mb-6
        ">

          Admin Login

        </h1>



        <input

          type="text"

          placeholder="Username"

          value={username}

          onChange={(e)=>setUsername(e.target.value)}

          className="
            border
            w-full
            p-3
            rounded
            mb-4
          "

        />



        <input

          type="password"

          placeholder="Password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

          className="
            border
            w-full
            p-3
            rounded
            mb-6
          "

        />



        <button

          onClick={handleLogin}

          disabled={loading}

          className="
            bg-orange-500
            text-white
            w-full
            py-3
            rounded-lg
            font-bold
          "

        >

          {loading ? "Logging in..." : "LOGIN"}

        </button>


      </div>


    </main>


  );

}