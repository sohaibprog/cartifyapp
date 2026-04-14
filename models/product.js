const mongoose=require('mongoose');
const subCategory = require('./sub_category');
const productSchema=mongoose.Schema({
    productName:{
        type: String,
        trim: true,
        required: true,
    },
    productPrice:{
        type: Number,
        required: true,
    },
    quantity:{
        type: Number,
        required:true,
    },
    description:{
        type: String,
        required:true,
    },
    vendorId:{
        type: String,
        required:true,
    },
    shopName:{
        type: String,
        required:true,
    },
    category:{
        type: String,
        required:true,
    },
    subcategory:{
        type:String,
        required: true,
    },
    images:[
        {
            type: String,
            required:true,
        },
    ],
    new:{
        type:Boolean,
        default:true,
    },
    recommend:{
        type:Boolean,
        default: true,
    },
    popular:{
        type:Boolean,
        default: true,
    },
    discount:{
        type: Number,
        default: 0,
    },
    status:{
        type: String,
        default: "Processing",
    },


    averageRating:{
        type: Number,
        default:0,
    },
    totalRatings:{
        type:Number,
        default:0,
    }
});
const Product=mongoose.model('Product',productSchema);
module.exports=Product;