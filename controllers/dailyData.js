const Entry=require("../models/Entry");
const{parse,startOfDay,endOfDay,utcToZonedTime}=require("date-fns");
const addEntry=async(req,res)=> // Function to add Expense/Income entries
{ 
try{
      const {useremail,amount,category,date,entryType}=req.body;
      const newEntry=await new Entry({
         useremail,
         amount,
         category,
         date,
         entryType,
      });
      const savedEntry=await newEntry.save();
      res.status(201).json({message:"new entry created successfully",savedEntry});
}catch(err){
   res.json({message:err});
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
const updateEntry=async(req,res)=>
{
   try{
     const{entryId,entryCat,entryAmt,entryType}=req.body;
     const data=await Entry.findByIdAndUpdate(entryId,{amount:entryAmt,category:entryCat,entryType});
     await data.save();
      res.status(200).send(data);
   }catch(err){
      res.status(500).json({message:err});
   }
}

module.exports={getDailyData,addEntry,getcurrDayData,getDailyExpense,updateEntry};