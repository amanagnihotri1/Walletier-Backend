require('dotenv').config();
const express=require("express");
const cookieParser=require("cookie-parser");
const connectDB=require("./dbConfig");
const {login}=require("./controllers/auth");
const cors=require("cors");
const app=express();
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", "https://walletier-0243.web.app/"],
  methods: ['GET','POST','DELETE', 'PUT','OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
connectDB();
app.use("/api",require("./routes/entryRoute"));
app.use("/api/auth",require("./routes/userRoute"));
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