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
}
},{timestamps:true});
module.exports=mongoose.model("User",UserSchema);