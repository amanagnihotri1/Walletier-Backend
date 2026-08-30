const mongoose=require("mongoose");
const {Schema}=mongoose;
const entrySchema=new Schema({
amount:{
    type:Number,
    required:true
},
category:{
    type:String,
    required:true,
    enum:["Travel","Business","Investements","Extra income","Deposits","Gifts","Miscellaneous","Bills","Shopping","Food","Entertainement","Daily Needs","Others"]
},
date:{
    type:Date,
    required:true
},
entryType:{
    type:String,
    enum:["Expense","Income"],
    required:true
},
userId:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
},
monthlyGoal:{
    type:Number,
    default:0
},
},{timestamps:true});
module.exports=mongoose.model("entry",entrySchema);
