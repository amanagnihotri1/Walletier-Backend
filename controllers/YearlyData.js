const{sub}=require("date-fns");
const Entry=require("../models/Entry");
const lastyearData=async(req,res)=>
{
  try{
    const{useremail}=req.query;
    const dateObj=sub(new Date(),{years:1});
    console.log(useremail,dateObj);
    const data=await Entry.find({
        date:{$gte:dateObj},
        useremail
    }).sort({'date':-1});
    console.log(data);
    res.status(200).send(data);
  }catch(err)
  {
    res.status(500).json({message:err});
  }
}
module.exports=lastyearData;