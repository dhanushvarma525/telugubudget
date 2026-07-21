import { supabase } from "@/lib/supabase";


async function getContacts(){

  const {data,error}=await supabase
    .from("contacts")
    .select("*")
    .order("created_at",{ascending:false});


  if(error){

    console.log(error);
    return [];

  }


  return data || [];

}



export default async function ContactsPage(){


const contacts = await getContacts();



return (

<main
className="
min-h-screen
bg-gray-100
p-6
"
>


<div
className="
max-w-6xl
mx-auto
bg-white
rounded-xl
shadow
p-6
"
>


<h1
className="
text-3xl
font-bold
mb-6
"
>

📩 Customer Messages

</h1>




{

contacts.length === 0 ?


<p>
No messages yet
</p>


:


<div
className="
space-y-5
"
>


{

contacts.map((contact:any)=>(


<div

key={contact.id}

className="
border
rounded-xl
p-5
"

>


<div
className="
flex
justify-between
"
>


<h2
className="
font-bold
text-lg
"
>

{contact.name}

</h2>



<p
className="
text-sm
text-gray-500
"
>

{
new Date(contact.created_at)
.toLocaleDateString()
}

</p>


</div>



<p
className="
text-blue-600
mt-2
"
>

{contact.email}

</p>




<p
className="
mt-4
text-gray-700
"
>

{contact.message}

</p>




</div>


))


}


</div>


}


</div>


</main>

);


}