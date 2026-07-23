"use client";

import { useState } from "react";

export default function ContactPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  async function submitContact() {

    if (!name || !email || !message) {

      alert("Please fill all fields");

      return;
    }


    setLoading(true);


    const res = await fetch(
      "/api/contact",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          message,
        }),
      }
    );


    const data = await res.json();


    if (data.success) {

      alert("Message sent successfully");

      setName("");
      setEmail("");
      setMessage("");

    } else {

      alert(data.message);

    }


    setLoading(false);

  }



  return (

    <main className="min-h-screen bg-slate-50 py-10 px-4">


      <div className="
      max-w-5xl
      mx-auto
      bg-white
      rounded-2xl
      shadow-lg
      overflow-hidden
      ">


        {/* Header */}

        <div className="
        bg-gradient-to-r
        from-blue-600
        to-indigo-700
        text-white
        px-8
        py-10
        ">


          <h1 className="
          text-4xl
          font-extrabold
          ">
            📩 Contact AnantaGo
          </h1>


          <p className="
          mt-3
          text-blue-100
          max-w-2xl
          leading-7
          ">
            Have a question, suggestion, or want to share feedback?
            Our team would love to hear from you.
          </p>


        </div>





        <div className="
        p-8
        md:p-10
        grid
        md:grid-cols-2
        gap-10
        ">


          {/* Information */}

          <div>


            <h2 className="
            text-2xl
            font-bold
            mb-5
            ">
              Get In Touch
            </h2>


            <p className="
            text-gray-700
            leading-8
            ">
              At <strong>AnantaGo</strong>, we help users discover
              useful products, trending deals, and smart shopping
              recommendations.
            </p>



            <div className="
            mt-8
            space-y-4
            text-gray-700
            ">


              <p>
                🔥 Latest Deals & Offers
              </p>


              <p>
                🛍️ Product Recommendations
              </p>


              <p>
                💡 Suggestions & Feedback
              </p>


              <p>
                🤝 Partnership Opportunities
              </p>


            </div>


          </div>





          {/* Form */}

          <div>


            <input

              placeholder="Your Name"

              value={name}

              onChange={
                e => setName(e.target.value)
              }

              className="
              w-full
              border
              rounded-lg
              p-3
              mb-4
              outline-none
              focus:border-blue-500
              "

            />




            <input

              placeholder="Email Address"

              value={email}

              onChange={
                e => setEmail(e.target.value)
              }

              className="
              w-full
              border
              rounded-lg
              p-3
              mb-4
              outline-none
              focus:border-blue-500
              "

            />





            <textarea

              placeholder="Your Message"

              value={message}

              onChange={
                e => setMessage(e.target.value)
              }

              className="
              w-full
              border
              rounded-lg
              p-3
              mb-4
              h-36
              outline-none
              focus:border-blue-500
              "

            />





            <button

              onClick={submitContact}

              className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-bold
              py-3
              rounded-lg
              transition
              "

            >

              {
                loading
                ?
                "Sending..."
                :
                "Send Message"
              }

            </button>


          </div>


        </div>


      </div>


    </main>

  );

}