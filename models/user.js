const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        trim: true,
    },
    address:{
        type:String,
        default:"",
        trim:true,
    },
    phone:{
        type:String,
        default:"",
    },
    city:{
        type:String,
        default:"",
    },
    email:{
        type:String,
        required:true,
        validate:{
            validator:(value)=>{
                const result=/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return result.test(value);
            },
            message:"Please Enter a Valid Email Address",
        }
    },
    password:{
        type:String,
        required:true,
        validate:{
            validator:(value)=>{
                // check password is at least 8 characters long
                return value.length>=8;
            },
            message:"The Password Must Be At Least 8 Characters Long",
        }
    }
});

const user=mongoose.model("user",userSchema);
module.exports=user;