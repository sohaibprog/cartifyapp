const express=require('express');
const ProductReview=require("../models/product_review");
const Product=require("../models/product");
const productReviewRouter=express.Router();
productReviewRouter.post('/api/product-review',async(req,res)=>{
    try {
        const{buyerId,email,fullName,productId, vendorId, productName, rating, review}=req.body;
        //chack if the user has already reviwed the product
        const existingReview=await ProductReview.findOne({buyerId, productId});
        if(existingReview){
            return res.status(400).json({msg: "You have Already reviewed this Product"});
        }
        const reviews=new ProductReview({buyerId,email,fullName,productId, vendorId, productName, rating, review});
        await reviews.save();

        //find the product associated with the review using the product id
        const product=await Product.findById(productId);
        if(!product){
            return res.status(404).json({error: "No Product Found"});
        }
        //update the total rating after incrementing it by 1
        product.totalRatings+=1;
        product.averageRating=((product.averageRating*(product.totalRatings-1))+rating)/product.totalRatings;
        //save the updated product back to database
        await product.save();

        return res.status(201).send(reviews);
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});
productReviewRouter.get('/api/reviews',async(req,res)=>{
    try {
        const reviews=await ProductReview.find();
        return res.status(200).json(reviews);
    } catch (e) {
        res.status(500).json({"error":e.message});
    }
})

// New: Get all reviews for a specific vendor
productReviewRouter.get('/api/reviews/vendor/:vendorId', async (req, res) => {
    try {
        const { vendorId } = req.params;
        const reviews = await ProductReview.find({ vendorId });
        return res.status(200).json(reviews);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// New: Get all reviews for a specific product
productReviewRouter.get('/api/reviews/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await ProductReview.find({ productId });
        return res.status(200).json(reviews);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

productReviewRouter.get('/api/reviews-of-product/:buyerId/:productId',async(req,res)=>{
    try {
        const {buyerId, productId}=req.params;
        const productReview=await ProductReview.find({buyerId: buyerId, productId: productId});
        if(!productReview||productReview.length==0){
            return res.status(404).json({msg:"No Product Review Found"});
        }
        else{
            return res.status(200).json(productReview);
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});



module.exports=productReviewRouter;