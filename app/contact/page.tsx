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



    try {


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


        alert(
          data.message || "Something went wrong"
        );


      }



    } catch(error) {


      alert(
        "Unable to send message. Please try again."
      );


    } finally {


      setLoading(false);


    }


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
          leading-7
          ">

            Have questions, suggestions, or feedback?
            We would love to hear from you.

          </p>


        </div>






        <div className="
        p-8
        md:p-10
        grid
        md:grid-cols-2
        gap-10
        ">



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

              At <strong>AnantaGo</strong>, we share useful
              products, deals, buying guides and shopping
              recommendations.

            </p>




            <div className="
            mt-8
            space-y-4
            text-gray-700
            ">


              <p>
                🛍️ Product Recommendations
              </p>


              <p>
                🔥 Deals & Offers
              </p>


              <p>
                💡 Feedback & Suggestions
              </p>


              <p>
                🤝 Business Opportunities
              </p>


            </div>



          </div>






          <div>


            <input

              type="text"

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
              focus:border-blue-500
              outline-none
              "

            />






            <input


              type="email"

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
              focus:border-blue-500
              outline-none
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
              focus:border-blue-500
              outline-none
              "


            />







            <button


              onClick={submitContact}


              disabled={loading}


              className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-gray-400
              text-white
              font-bold
              py-3
              rounded-lg
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