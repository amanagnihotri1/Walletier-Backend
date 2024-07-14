const entries=require("../models/entrySchema");
const{parse, startOfDay,endOfDay,utcToZonedTime}=require("date-fns");
const addEntry=async(req,res,next)=>
{ 
try{
      const {userId,amount,category,date,entryType,monthlyGoal}=req.body;
      const newEntry=await entries.create(req.body);
      res.status(201).json({message:"new entry created successfully",newEntry});
}catch(err){
   next(err);
}
}
const getDailyData=async(req,res,next)=>
{ 
   try{ 
      const{uid}=req.query;
      dateObj=parse(new Date().toString(),"MM/dd/yyyy",new Date());
      const result=await entries.aggregate([{
        $match:{
           userId:uid,
           date:{$lte:endOfDay(Date.now()),$gte:startOfDay(Date.now())}
         }
      },
         {   $group:{
              _id:'$entryType',
              totalSum:{$sum:'$amount'} 
            }, 
         },
         ]);
      res.json(result);
   }catch(err)
   {
      next(err);
   }
}
const getDailyExpense=async(req,res,next)=>
{ 
   try{
      const{entryType,uid}=req.query;
      const userId=req.params.userId;
      const result=await entries.find({userId,entryType,userId:uid,date:new Date()});
     res.status(200).json(result);
   }catch(err)
   {
      next(err);
   }
}
const getcurrDayData=async(req,res,next)=>
{
   try{
      const{userid}=req.query;
      let dayObj=startOfDay(new Date());
      const data=await entries.aggregate([{
        $match:{date:{$gte:startOfDay(dayObj)},userId:userid} 
      }]);
      res.send(data);
   }catch(err){
      next(err);
   }
}
const updateEntry=async(req,res,next)=>
{
   try{
     const{entryId,entryCat,entryAmt,entryType}=req.body;
     const data=await entries.findByIdAndUpdate(entryId,{amount:entryAmt,category:entryCat,entryType});
     await data.save();
     return res.status(200).json(data);
   }catch(err){
      next(err);
   }
}

module.exports={getDailyData,addEntry,getcurrDayData,getDailyExpense,updateEntry};