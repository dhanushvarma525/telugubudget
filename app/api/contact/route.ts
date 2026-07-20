import db from "@/lib/db";
import nodemailer from "nodemailer";



export async function POST(
req:Request
){


try{


const body = await req.json();



const {

name,

email,

message

}=body;




// Save in database

await db.query(

`
INSERT INTO contacts

(
name,
email,
message
)

VALUES (?,?,?)

`,

[

name,

email,

message

]


);





// Send Email


const transporter = nodemailer.createTransport({

service:"gmail",

auth:{

user:process.env.EMAIL_USER,

pass:process.env.EMAIL_PASSWORD

}

});





await transporter.sendMail({


from:process.env.EMAIL_USER,


to:process.env.EMAIL_USER,


subject:"New TeluguBudget Contact Message",


html:`

<h2>New Customer Message</h2>

<p>
<b>Name:</b> ${name}
</p>


<p>
<b>Email:</b> ${email}
</p>


<p>
<b>Message:</b>
</p>

<p>
${message}
</p>

`


});






return Response.json({

success:true

});


}

catch(error:any){



console.log(error);



return Response.json({

success:false,

message:error.message

});


}



}