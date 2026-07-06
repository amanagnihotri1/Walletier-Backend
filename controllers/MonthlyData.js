const Entry=require("../models/Entry");
const{sub, startOfMonth, endOfMonth}=require("date-fns");
const {format,parse}=require("date-fns");
const getMonthlyIncomeData=async(req,res)=>
{
    try{
        const{dateVal,useremail}=req.query;
        const dateObj=parse(dateVal,'MM/dd/yyyy',new Date());
        const data=await Entry.find({date:{$gte:dateObj},email:useremail}).sort({'date':-1});
        res.status(200).send(data);
    }catch(err)
    {
      res.status(500).json({message:err});
    }
}
const particularMonthData=async(req,res)=>
{
  try{
     const{dateVal,useremail}=req.query;
     let dateObj=parse(dateVal,"MM/dd/yyyy",new Date());
    const aggregateData=await Entry.aggregate([{
     $match:{date:{$gte:startOfMonth(dateObj),$lte:endOfMonth(dateObj)},useremail}
    },
    {
      $group:{
       _id:'$entryType',
       totalSum:{$sum:'$amount'},
      },
    },
     {
    $sort: { _id: 1 } 
  }
  ]);
     const data = {
      Expense: 0,   
      Income:  0 
    };

    aggregateData.map(item => {
      data[item._id] = item.totalSum;
    });
    res.status(200).send(data);
  }catch(err)
  {
    res.status(500).json({message:err});
  }
}
const getExpenseGraphData=async(req,res)=>{
  try{
    const {useremail}=req.query;
    const reqData=await Entry.aggregate([{
      $match:{date:{
      $gte:startOfMonth(new Date()),
      $lte:new Date()},
    useremail,
    entryType:"Expense"
    },
  },
{
  $group:{
    _id:'$category',
    totalSum:{$sum:"$amount"}

  }
}]);
    res.status(200).send(reqData);
  }catch(err){
    res.status(500).json({message:err.message});
  }
}
const deleteEntry=async(req,res)=>
{
  try{
    const {entryId}=req.query;
    console.log(entryId);
    const data=await Entry.deleteOne({_id:entryId});
    res.json({data,message:`deleted entry with Id ${entryId}`});
  }catch(err){
    res.status(500).json({message:err});
  }

}
module.exports={getMonthlyIncomeData,particularMonthData,deleteEntry,getExpenseGraphData};