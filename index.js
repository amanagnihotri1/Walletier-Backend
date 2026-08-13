require("dotenv").config();
const compression = require('compression');
const helmet = require('helmet');
const { errorHandler } = require("./helper/utils");
const{rateLimit, MINUTE}=require("express-rate-limit");
require('dotenv').config();
const express=require("express");
const cookieParser=require("cookie-parser");
const connectDB=require("./dbConfig");
const {login}=require("./controllers/auth");
const cors=require("cors");
const app=express();
const limiter = rateLimit({
	windowMs: 15000, 
	limit: 100, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 56, 
});
app.use(limiter);
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", "https://walletier-0243.web.app", "https://walletier-0243.firebaseapp.com/"],
  methods: ['GET','POST','DELETE', 'PUT','OPTIONS'],
  credentials: true
}));
app.use(errorHandler);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
connectDB();
app.use("/api",require("./routes/entryRoute"));
app.use("/api/auth",require("./routes/userRoute"));
app.listen(process.env.PORT || 3000,(err)=>
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