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

module.exports={addEntry,updateEntry,deleteEntry};