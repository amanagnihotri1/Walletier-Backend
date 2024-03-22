const{sub}=require("date-fns");
const entries=require("../models/entrySchema");
const lastyearData=async(req,res,next)=>
{
  try{
    const{userid}=req.query;
    const dateObj=sub(new Date(),{years:1});
    const data=await entries.find({
        date:{$gte:dateObj},
        userId:userid
    }).sort({date:-1});
    console.log(data);
    res.status(200).send(data);
  }catch(err)
  {
    next(err);
  }
}
module.exports=lastyearData;