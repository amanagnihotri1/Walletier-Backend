const passport=require("passport");
const bcrypt=require("bcrypt");
const cookie=require("cookie-parser");
const User=require("../models/User");
const jwt=require("jsonwebtoken");
 const passwordReset = async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).json({ message: "User not exists!" });
    }

    const secret = process.env.SESSION_SECRET + user.password;
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );


    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
const passwordRequest=async(req,res)=>{
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });
    const secret = process.env.SESSION_SECRET + user.password;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });
    const resetURL = `${process.env.PROD_URL}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 't1129172@gmail.com',
        pass: 'password',
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: 'Password Reset Request',
      text: `You are receiving this because you have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetURL}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}; 
const signup=async(req,res)=>{ 
  const{useremail,userpassword,userName,profilepicture,userId,access_token}=req.body;
  try{
    const findUser=await User.find({email:req.body.email});
    if(!findUser){
   return res.json({status:"Failed",message:"User already exists with this email address"}) 
  }
   const saltRounds=10;
   const encryptedPassword=await bcrypt.hash(userpassword,saltRounds);
   const userDoc=new User({
    fullName:userName,
    email:useremail,
    password:encryptedPassword,
    profilePicture:profilepicture || "",
    google:{
      id:userId,
      token:access_token,
      name:userName,
    }
  })
  userDoc.save();
  res.status(201).json({status:"success",data:"User Created Successfully",message:userDoc});
}catch(err){
  return res.json({status:err.statusCode,message:err.message});
}
}
const userLogin=async(req,res)=>{ // function to make user login to the app
try{
  const{userEmail,userPass}=req.body;
  const findUser=await User.find({email:userEmail});
 if(!findUser){
   res.status(404).json({status:"Sucess",message:"User does not exist with this email address"});
 }
 console.log("104",findUser)
 console.log("105",userPass,findUser[0].password);
  const matchPassword=await bcrypt.compare(userPass,findUser[0].password);
  if(!matchPassword){
     res.status(401).json({status:"Failed",message:"Incorrect password"});
  }
     const token = await jwt.sign({ _id: findUser[0]._id },process.env.SESSION_SECRET,{ expiresIn: "24h" });
            res.cookie("token",token, {httpOnly: true,secure:false }).send({ token,userDetails:findUser[0]});
            console.log("112",cookie);
}
catch(err){
  return res.json({status:err.statusCode,message:err.message});
}
}
const logout=async(req,res)=>{
 res.clearCookie("token");
 res.status(200).json({status:"success",message:"logged out successfully"});
}
module.exports={userLogin,signup,logout,passwordReset,passwordRequest};