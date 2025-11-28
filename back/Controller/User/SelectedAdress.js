const selectedAdressModal = require("../../Model/User/SelectedAddress");

class SelectedAdress {
  async addressadd(req, res) {
    try {
      let { Name, Number, ApartmentName, fletNumber,userId ,addresstype,addressid,towerName} = req.body;
         await selectedAdressModal.updateMany({userId:userId,addresstype:addresstype},{$set:{isSelected:false}})
      let check =await selectedAdressModal.findOne({userId:userId,addressid:addressid});
      if(check){
          if(Name){
             check.Name=Name; 
          }
           if(Number){
             check.Number=Number; 
          }
           if(ApartmentName){
             check.ApartmentName=ApartmentName; 
          }
           if(fletNumber){
             check.fletNumber=fletNumber; 
          }
          if(towerName){
              check.towerName=towerName;
          }
          check.isSelected=true;
          check = await check.save()
           return res.status(200).json({ success: "Successfully Added" });
      }
      const dataadress = new selectedAdressModal({
        Name,
        Number,
        ApartmentName,
        fletNumber,
        towerName,
        userId,addressid,addresstype
      });
      
      console.log("hiii",userId);
      dataadress.save()
        .then((data) => {
          return res.status(200).json({ success: "Successfully Added" });
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).json({ error: "please try again!" });
        });
    } catch (error) {
      return res.status(400).json({ error: "Message not Sent..!" });
    }
  }

  async getSelectedAddressByUserID(req, res) {
    try {
        let userId=req.params.userId;
        
      const getdata = await selectedAdressModal.find({userId:userId});
 
        return res.status(200).json({ getdata: getdata });
     
    } catch (error) {
      return res.status(400).json({ error: "Message not Sent..!" });
    }
  }
  
    async getSelectedAddressByUserIDAddType(req, res) {
    try {
        let userId=req.params.userId;
        let addtype=req.params.addtype
      const getdata = await selectedAdressModal.findOne({userId:userId,addresstype:addtype,isSelected:true});
 
        return res.status(200).json({ getdata: getdata });
     
    } catch (error) {
      return res.status(400).json({ error: "Message not Sent..!" });
    }
  }
  
   async getSelectedAddressByUserIDAddressID(req, res) {
    try {
        let userId=req.params.userId;
        let addressid=req.params.addressid
      const getdata = await selectedAdressModal.findOne({userId:userId,ApartmentName:addressid});
 
        return res.status(200).json({ getdata: getdata });
     
    } catch (error) {
      return res.status(400).json({ error: "Message not Sent..!" });
    }
  }


  async DeleteSelectedAddress(req, res) {
    try {
      const EnquiryListId = req.params.id;
      await selectedAdressModal.deleteOne({ _id: EnquiryListId });
      return res.status(200).json({ success: "Deleted Sucessfully..." });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}


module.exports =  new SelectedAdress();;
