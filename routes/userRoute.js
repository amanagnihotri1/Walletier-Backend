const express=require("express");
const{userLogin,signup,logout,passwordReset,passwordRequest}=require("../controllers/auth");
const userRoute=express.Router();
userRoute.post("/login",userLogin);
userRoute.post("/signup",signup);
userRoute.get("/logout",logout);
userRoute.post("/passwordreset",passwordReset);
userRoute.post('/passwordrequest',passwordRequest);
module.exports=userRoute;