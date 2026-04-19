// import the express modeule
require('dotenv').config();
const express=require('express');
const cors = require('cors');
const mongoose=require("mongoose");
const authRouter=require("./routes/auth");
const bannerRouter=require('./routes/banner');
const categoryRouter=require("./routes/category");
const subCategoryRouter=require('./routes/sub_category');
const productRouter=require('./routes/product');
const productReviewRouter=require('./routes/product_review');
const vendorRouter=require('./routes/vendor');
const orderRouter=require("./routes/order")
// define the port number where the server will be listed on
const PORT = process.env.PORT || 3000;
// create an instance of express application
const app=express();

//momgodb string

const DB = process.env.MONGODB_URI || "mongodb+srv://crestzonee_db:crestzonee@cluster0.cuincq4.mongodb.net/";
// add middleware to register routes or to mount routes
app.use(express.json());
app.use(cors());
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);
app.use(orderRouter);


mongoose.connect(DB).then(()=>{
    console.log("mongo db connected successfully");
    
})

// start the server and listened on the specified port number
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, "0.0.0.0", function() {
        // log the number
        console.log('Server is running on port:' + PORT);  
    });
}
module.exports = app;