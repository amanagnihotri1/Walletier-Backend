const entries=require("../models/entrySchema");
const{sub, startOfMonth, endOfMonth}=require("date-fns");
const {format,parse}=require("date-fns");
const getMonthlyIncomeData=async(req,res,next)=>
{
    try{
        const{dateVal,uid}=req.query;
        const dateObj=parse(dateVal,'MM/dd/yyyy',new Date());
        const data=await entries.find({date:{$gte:dateObj},userId:uid}).sort({'date':-1});
        res.send(data);
    }catch(err)
    {
        next(err);
    }
}
const particularMonthData=async(req,res,next)=>
{
  try{
     const{dateVal,uid}=req.query;
     let dateObj=parse(dateVal,"MM/dd/yyyy",new Date());
    const data=await entries.aggregate([{
     $match:{date:{$gte:startOfMonth(dateObj),$lte:endOfMonth(dateObj)},userId:uid}
    },
    {
      $group:{
       _id:'$entryType',
       totalSum:{$sum:'$amount'},
      },
    }
  ]);
  console.log(data[0]);
    res.status(200).json(data);
  }catch(err)
  {
    next(err);
  }
}
const getExpenseGraphData=async(req,res,next)=>{
  try{
    const {uid}=req.query;
    const reqData=await entries.find({
    date:{
      $gte:startOfMonth(new Date()),
      $lte:new Date()},
    userId:uid,
    entryType:"Expense"
    });
    res.send(reqData);
  }catch(err){
   next(err);
  }
}
const deleteEntry=async(req,res,next)=>
{
  try{
    const {entryId}=req.query;
    const data=await entries.deleteOne({id:entryId});
    res.json({data,message:`deleted entry with Id ${entryId}`});
  }catch(err){
    next(err);
  }

}
module.exports={getMonthlyIncomeData,particularMonthData,deleteEntry,getExpenseGraphData};