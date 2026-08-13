const Entry=require("../models/Entry");
const{sub, startOfMonth, endOfMonth,startOfDay,endOfDay,utcToZonedTime,format,parse}=require("date-fns");
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

const lastyearData=async(req,res)=>
{
  try{
    const{useremail}=req.query;
    const dateObj=sub(new Date(),{years:1});
    const data=await Entry.find({
        date:{$gte:dateObj},
        useremail
    }).sort({'date':-1});
    res.status(200).send(data);
  }catch(err)
  {
    res.status(500).json({message:err});
  }
}
const getDailyData=async(req,res)=> //Function to display entries for current day
{ 
   try{ 
      const{useremail}=req.query;
      const result=await Entry.aggregate([{
        $match:{
           useremail,
           date:{$lte:endOfDay(Date.now()),$gte:startOfDay(Date.now())}
         }
      },
         {   $group:{
              _id:'$entryType',
              totalSum:{$sum:'$amount'} 
            }, 
         }
         ]);
         const data = {
      Expense: 0,   // default 0 if no expense entries
      Income:  0    // default 0 if no income entries
    };

    result.map(item => {
      data[item._id] = item.totalSum;
    });
      res.status(200).json(data);
   }catch(err)
   {
      res.status(500).json({message:err.message});
   }
}
const getDailyExpense=async(req,res)=> //Function to display daily expense 
{ 
   try{
      const{entryType,useremail}=req.query;
      const result=await Entry.find({useremail,entryType,date:new Date()});
     res.status(200).json(result);
   }catch(err)
   {
      res.status(500).json({message:err});
   }
}
const getcurrDayData=async(req,res)=>
{
   try{
      const{useremail}=req.query;
      let dayObj=startOfDay(new Date());
      const data=await Entry.aggregate([{
        $match:{date:{$gte:startOfDay(dayObj)},useremail} 
      }]);
      res.status(200).send(data);
   }catch(err){
      res.status(500).json({message:err});
   }
}
module.exports={getMonthlyIncomeData,particularMonthData,getExpenseGraphData,lastyearData,getDailyData,getDailyExpense,getcurrDayData};