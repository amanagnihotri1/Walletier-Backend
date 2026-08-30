const mongoose=require("mongoose");
const UserSchema= new mongoose.Schema({
email:{
    type:String,
    required:true,
    unique:true
},
fullName:{
    type:String,
    required:true,
    min:4
},
password:{
    type:String,
    required:true
},
avatar: {
            type: String
        },
google:{
    id:String,
    token:String,
},
gender:{
    type:String,
    enum:["Male","Female"]
},
occupation:{
    type:String,
    enum:["Employed","Unemployed","Student"],
},
Income:{
    type:Number
}
},{timestamps:true});
module.exports=mongoose.model("User",UserSchema);