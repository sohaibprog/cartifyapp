const jwt=require('jsonwebtoken');
const User=require("../models/user");
const Vendor=require("../models/vendor")
//authentication middleware chacks if the user is authenticated
const auth=async(req, res, next)=>{
    try {
        const token=req.header("x-auth-token");
        //if no token is provided return 401 (unauthorized) response with an error mesg

        if(!token){
            return res.status(401).json({msg: "No authentication token, Authorization denied"});
        }
            //verify jet token using secret key
            const verified=jwt.verify(token, "passwordKey");
            //if the token verification fails return 401
            if(!verified){
                return res.status(401).json({msg: "Token Verification Failed, Authorization denied"});
            }
            //find the  verified normal user or vendor in the databse using the id
            const user=await User.findById(verified.id) || await Vendor.findById(verified.id);
            if(!user){
                return res.status(401).json({msg: "User not Found, Authorization denied"});
            }
            else{
                //attach the authenticated user to the request object
                //this makes the user data available 
                req.user=user;
                //attach the token to request object in case needed later
                
                req.token=token;
                //proceed to next middleware or route handler
                next();
            }
        
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

//vendor authentication middleware to ensure the user cant make request for vendor 
const vendorAuth=(req, res, next)=>{
    try {
        if (!req.user.role || req.user.role!=="vendor"){
            //if user is not vendor return 403 forbiden
            return res.status(403).json({msg: "Access denied, only vendors are allowed"});
            
        }
        next();
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

module.exports={auth, vendorAuth};