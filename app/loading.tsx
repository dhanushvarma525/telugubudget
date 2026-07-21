export default function Loading() {

  return (

    <main
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
      "
    >

      <div
        className="
        flex
        flex-col
        items-center
        gap-4
        "
      >

        {/* Logo Animation */}

        <div
          className="
          text-5xl
          animate-bounce
          "
        >
          🛒
        </div>


        <h2
          className="
          text-xl
          font-bold
          text-orange-500
          "
        >
          TeluguBudget
        </h2>


        <p
          className="
          text-gray-500
          "
        >
          Finding best deals for you...
        </p>



        <div
          className="
          w-40
          h-2
          bg-gray-200
          rounded-full
          overflow-hidden
          "
        >

          <div
            className="
            h-full
            bg-orange-500
            animate-pulse
            w-2/3
            rounded-full
            "
          />

        </div>


      </div>


    </main>

  );

}