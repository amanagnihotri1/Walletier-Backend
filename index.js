require("dotenv").config();
const{rateLimit, MINUTE}=require("express-rate-limit");
const express=require("express");
const helmet=require("helmet");
const compression = require('compression');
const cookieParser = require("cookie-parser");
const {errorHandler}=require("./helper/utils");
const connectDB = require("./dbConfig");
const {login}=require("./controllers/authController");
const cors=require("cors");
const entryRoute = require("./routes/entryRoute");
const app=express();
const limiter = rateLimit({
	windowMs: 15000, 
	limit: 100, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 56, 
})
app.use(limiter)
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
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