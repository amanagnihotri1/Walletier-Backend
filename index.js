require("dotenv").config();
const apicache=require("apicache");
const express=require("express");
const connectDB = require("./dbConfig");
const cors=require("cors");
const entryRoute = require("./routes/entryRoute");
const app=express();
let cache=apicache.middleware;
app.use(cache('30 minutes'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
connectDB();
app.use("/api",entryRoute);
app.listen(process.env.PORT,(err)=>
    {
     if(err)
     {
       throw new Error({message:err});
     }
     else
     {
        console.log("server running successfully at port",process.env.PORT);
}
    })