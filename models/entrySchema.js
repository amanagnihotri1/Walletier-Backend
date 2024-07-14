const { randomUUID } = require("crypto");
const mongoose=require("mongoose");
const {Schema}=mongoose;
const entrySchema=new Schema({
amount:{
    type:Number,
    required:true
},
category:{
    type:String,
    required:true
},
date:{
    type:Date,
    required:true
},
entryType:{
    type:String,
    required:true
},
userId:{
    type:String,
    required:true
},
monthlyGoal:{
 type:Number,  
 min:0 
}
},{timestamps:true});
module.exports=mongoose.model("entry",entrySchema);
