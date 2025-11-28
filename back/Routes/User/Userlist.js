// const express = require("express");
// const router = express.Router();
// const CutomerController = require("../../Controller/User/Userlist");
// const multer = require('multer');

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "Public/Customer");
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     },
// });
// const upload = multer({ storage: storage });


// router.post("/Sendotp", CutomerController.loginWithOtp);
// router.post("/mobileotpverification", CutomerController.otpVarification);

// router.post("/registercustomer", CutomerController.AddCustomer)
// router.post("/logincustomer", CutomerController.loginCustomer)
// router.post("/sendmail", CutomerController.sendMail)
// router.post("/otpverification", CutomerController.Otpverification)
// router.put('/newpassword', CutomerController.NewPassword)
// router.put('/updateuser', upload.any(), CutomerController.updatedUser)
// router.put('/profileimg', upload.any(), CutomerController.profileimg)
// router.get("/registeruser", CutomerController.getRegisterUser)
// router.get("/export-all", CutomerController.exportAllUsers)
// router.put("/blockuser/:id", CutomerController.BlockUser);
// router.get('/getUserByCompany/:companyId', CutomerController.getUserByCompany);
// router.delete('/deleteUser/:id', CutomerController.deleteUser);
// router.get("/my-referrals/:userId", CutomerController.getMyReferralData)
// router.post('/addStudentInformation', CutomerController.addOrUpdateStudentInfo);

// // Address routes
// router.post('/addresses', CutomerController.addAddress);
// router.get('/customers/:customerId/addresses', CutomerController.getAddresses);
// router.get('/customers/:customerId/addresses/:addressId', CutomerController.getAddressById);
// router.get('/customers/:customerId/addresses/type/:addressType', CutomerController.getAddressesByType);
// router.get('/customers/:customerId/addresses/default', CutomerController.getDefaultAddress);
// router.put('/customers/:customerId/addresses/:addressId', CutomerController.updateAddress);
// router.delete('/customers/:customerId/addresses/:addressId', CutomerController.deleteAddress);
// router.patch('/customers/:customerId/addresses/:addressId/primary', CutomerController.setPrimaryAddress);
// // In your routes file
// router.patch('/customers/:customerId/addresses/:addressId/remove-default', CutomerController.removeDefaultAddress);

// router.get("/get-referral-settings", CutomerController.getReferralSettings);
// router.get("/get-my-referral-code/:userId", CutomerController.getMyReferralCode);

// // Location validation route
// const HubController = require("../../Controller/Packer/HubList");
// router.post("/validate-location", HubController.validateLocation);

// module.exports = router;












const express = require("express");
const router = express.Router();
const CutomerController = require("../../Controller/User/Userlist");
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "Public/Customer");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });


router.post("/Sendotp", CutomerController.loginWithOtp);
router.post("/mobileotpverification", CutomerController.otpVarification);

router.post("/registercustomer", CutomerController.AddCustomer)
router.post("/logincustomer", CutomerController.loginCustomer)
router.post("/sendmail", CutomerController.sendMail)
router.post("/otpverification", CutomerController.Otpverification)
router.put('/newpassword', CutomerController.NewPassword)
router.put('/updateuser', upload.any(), CutomerController.updatedUser)
router.put('/profileimg', upload.any(), CutomerController.profileimg)
router.get("/registeruser", CutomerController.getRegisterUser)
router.get("/export-all", CutomerController.exportAllUsers)
router.post('/addStudentInformation', CutomerController.addOrUpdateStudentInfo);

router.put("/blockuser/:id", CutomerController.BlockUser);
router.get('/getUserByCompany/:companyId', CutomerController.getUserByCompany);
router.delete('/deleteUser/:id', CutomerController.deleteUser);
router.get("/my-referrals/:userId", CutomerController.getMyReferralData)
router.post('/getCustomer/:id/detailed', CutomerController.getCustomerByIdDetailed);


// Address routes - UPDATED
router.post('/addresses', CutomerController.addAddress);
router.get('/customers/:customerId/addresses', CutomerController.getAddresses);
router.get('/customers/:customerId/addresses/:addressId', CutomerController.getAddressById);
router.get('/customers/:customerId/addresses/type/:addressType', CutomerController.getAddressesByType);
router.get('/customers/:customerId/addresses/primary', CutomerController.getPrimaryAddress); // CHANGED from /default to /primary
router.put('/customers/:customerId/addresses/:addressId', CutomerController.updateAddress);
router.delete('/customers/:customerId/addresses/:addressId', CutomerController.deleteAddress);
router.patch('/customers/:customerId/addresses/:addressId/primary', CutomerController.setPrimaryAddress);
// REMOVED: router.patch('/customers/:customerId/addresses/:addressId/remove-default', CutomerController.removeDefaultAddress);
router.patch('/customers/:customerId/primary-address/remove', CutomerController.removePrimaryAddress); // ADDED: New route to remove primary address

router.get("/get-referral-settings", CutomerController.getReferralSettings);
router.get("/get-my-referral-code/:userId", CutomerController.getMyReferralCode);
router.get("/get-hub-menu", CutomerController.getHubMenu);


// Location validation route
const HubController = require("../../Controller/Packer/HubList");
router.post("/validate-location", HubController.validateLocation);

module.exports = router;