const express=require('express');
const Product=require("../models/product");
const productRouter=express.Router();
const {auth, vendorAuth}= require("../middleware/auth");
const subCategory = require('../models/sub_category');


productRouter.post('/api/add-product', auth, vendorAuth,async(req,res)=>{
    try {
        const{productName, productPrice, quantity,description,vendorId,shopName, category, subcategory, images}=req.body;
        const product=new Product({productName, productPrice, quantity,description,vendorId,shopName, category, subcategory, images});
        await product.save();
        return res.status(201).send(product);
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});
productRouter.get('/api/new-products',async(req,res)=>{
    try {
        const product=await Product.find({new:true});
        if(!product||product.length==0){
            return res.status(404).json({msg:"No Such Product Found"});
        }
        else{
            return res.status(200).json({product});
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});


// search recommended products
productRouter.get('/api/recommended-products',async(req,res)=>{
    try {
        const product=await Product.find({recommend:true, status:"Live"});
        if(!product||product.length==0){
            return res.status(404).json({msg:"No Such Product Found"});
        }
        else{
            return res.status(200).json({product});
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});


//get popular products
productRouter.get('/api/popular-products',async(req,res)=>{
    try {
        const product=await Product.find({popular:true, status:"Live"});
        if(!product||product.length==0){
            return res.status(404).json({msg:"No Such Product Found"});
        }
        else{
            return res.status(200).json(product);
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});
// new route for retrieving products by category
productRouter.get('/api/products-by-category/:category',async(req,res)=>{
    try {
        const {category}=req.params;
        const product=await Product.find({category, status:"Live"});
        if(!product||product.length==0){
            return res.status(404).json({msg:"No Such Product Found"});
        }
        else{
            return res.status(200).json(product);
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});


//get all products
productRouter.get('/api/all-products',async(req,res)=>{
    try {
        const product=await Product.find();
        if(!product||product.length==0){
            return res.status(404).json({msg:"No Product Found"});
        }
        else{
            return res.status(200).json(product);
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});


// update product status

productRouter.patch("/api/products/:id/:status", async(req,res)=>{
    try {
        const{id, status}=req.params;
        const updatedProduct=await Product.findByIdAndUpdate(
            id,
            {status:status}, 
            {new:true},


        );
        if(!updatedProduct){
            res.status(404).json({msg:"Product Not Found"});
        }
        else{
            res.status(200).json(updatedProduct);
        }
    } catch (e) {
        res.status(500).json({error: e.message});

    }
});

// new route for retrieving products by vendor id
productRouter.get('/api/products-by-vendor/:vendorId',async(req,res)=>{
    try {
        const {vendorId}=req.params;
        const product=await Product.find({vendorId});
        if(!product||product.length==0){
            return res.status(404).json({msg:"No Such Product Found"});
        }
        else{
            return res.status(200).json(product);
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});





// Update products

productRouter.put("/api/edit-product/:id", async(req,res)=>{
    try {
        const {id}=req.params;
        const {productName, category, subcategory, quantity, productPrice, description, images}=req.body;
        const updateProduct=await Product.findByIdAndUpdate(
            id,
            {
                productName,
                category,
                subcategory,
                quantity,
                productPrice,
                description,
                images
            },
            {new: true},
        );
        if(!updateProduct){
            return res.status(404).json({error:"Product not Found"});
        }
        else{
            res.status(200).json(updateProduct);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });

    }
})


// route for retrieving a single product by ID
productRouter.get("/api/product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }
        return res.status(200).json(product);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

//route for retriving related products by subcategory
productRouter.get("/api/related-products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }
        else{
            const relatedProducts= await Product.find({
                subcategory: product.subcategory,
                 _id:{$ne: productId}
                });
                if(!relatedProducts || relatedProducts.length == 0){
                    return res.status(404).json({msg: "no related product found"});
                }
                return res.status(200).json(relatedProducts);
        }
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
});


// route to retriving top 10 highest rated products

productRouter.get("/api/top-rated-products", async(req, res)=>{
    try {
        //fetch all products and set them by descending order of their ratings

    const topRatedProducts=await Product.find({status:"Live"}).sort({averageRating:-1});//sort by average rating
    if(!topRatedProducts || topRatedProducts.length==0){
        return res.status(404).json({msg: "No top Rated Products Found"});

    }
    return res.status(200).json(topRatedProducts);
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
});



//get products by subcategory
productRouter.get('/api/products-by-subcategory/:subcategory',async(req,res)=>{
    try {
        const {subcategory}=req.params;
        const product=await Product.find({subcategory:subcategory, status:"Live"});
        if(!product||product.length==0){
            return res.status(404).json({msg:"No Such Product Found"});
        }
        else{
            return res.status(200).json(product);
        }
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});


//route to search product by name or description

productRouter.get("/api/search-products", async(req, res)=>{
    try {
        const {query}=req.query;
        //validate that query parameter is provided
        if(!query){
            return res.status(404).json({msg : "Query parameter required"});
        }
        else{
            //search product collection 
            const products=await Product.find({
                status:"Live",
                $or:[
                    //using regex to match any product name containing the query string
                    {productName: {$regex:query, $options:"i"}},
                    {description: {$regex:query, $options:"i"}},
                    {category: {$regex:query, $options:"i"}},
                    {subcategory: {$regex:query, $options:"i"}},
                ]
            });
            if(!products || products.length==0){
                return res.status(404).json({msg: "No product Found"});
            }
            else{
                return res.status(200).json(products);
            }
        }
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
});



module.exports=productRouter;