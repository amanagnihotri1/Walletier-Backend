const mongoose=require("mongoose");
const connectDB=async()=>
{
   const conn=await mongoose.connect(`${process.env.CONN_STRING}`,{     
        serverSelectionTimeoutMS: 40000});
    if(conn)console.log("connected to DB");
}
module.exports=connectDB;