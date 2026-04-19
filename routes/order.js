const express= require("express");
const orderRouter=express.Router();
const Order=require("../models/order");
const Product=require("../models/product");
const {auth,vendorAuth}=require("../middleware/auth");



orderRouter.post("/api/orders",auth,  async(req, res)=>{
    try {
        const {
            fullName, 
            email,  
            address,
            city, 
            buyerId, 
            productName, 
            productId,
            productPrice, 
            quantity, 
            category, 
            image, 
            vendorId,
            paymentStatus,
            paymentIntentId,
            paymentMethod,    
        }=req.body;
        const createdAt=new Date().getMilliseconds();
        const order=new Order( {
            fullName, 
            email,  
            address, 
            city, 
            buyerId, 
            productName, 
            productId,
            productPrice, 
            quantity, 
            category, 
            image, 
            vendorId, 
            paymentStatus,
            paymentIntentId,
            paymentMethod,   
            createdAt});
        await order.save();

        // Decrement product quantity (safely, never below 0)
        const product = await Product.findById(productId);
        if (product) {
            const newQuantity = Math.max(0, product.quantity - quantity);
            await Product.findByIdAndUpdate(productId, { $set: { quantity: newQuantity } });
        }

        return res.status(201).json(order);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});



// get orders by buyer id
orderRouter.get("/api/orders/:buyerId",auth, async (req, res)=>{
    try {
        //extract the buyer id 
        const {buyerId}=req.params;
        //match the buyer id 
        const orders=await Order.find({buyerId});
        //if no orders found return 404 with message

        if(orders.length==0){
            return res.status(404).json({msg: "No Orders Found"})
        }
        //if orders are found then return 200 status code
        return res.status(200).json(orders);

    } catch (e) {
        res.status(500).json({error: e.message});
    }
})

//delete orders by order id

orderRouter.delete("/api/orders/:id",auth, async(req,res)=>{
    try{
        //extract the id from request param
        const {id}=req.params;
        //find and delete order from database
        const deleteOrder= await Order.findByIdAndDelete(id);
        if(!deleteOrder){
            return res.status(404).json({msg: "No Order Found"});
        }
        else{
            //if the order successfully deleted return 200 status code
            return res.status(200).json({msg: "Order Deleted Successfully"});
        }
    }catch(e){
        res.status(500).json({error: e.message});
    }
})


// get orders by Vendor id
orderRouter.get("/api/orders/vendors/:vendorId", auth,vendorAuth, async (req, res)=>{
    try {
        //extract the Vendor id 
        const {vendorId}=req.params;
        //match the buyer id 
        const orders=await Order.find({vendorId});
        //if no orders found return 404 with message

        if(orders.length==0){
            return res.status(404).json({msg: "No Orders Found"})
        }
        //if orders are found then return 200 status code
        return res.status(200).json(orders);

    } catch (e) {
        res.status(500).json({error: e.message});
    }
})

orderRouter.patch("/api/orders/:id/:status", async(req,res)=>{
    try {
        const{id, status}=req.params;
        const updatedOrder=await Order.findByIdAndUpdate(
            id,
            {status:status}, 
            {new:true},


        );
        if(!updatedOrder){
            res.status(404).json({msg:"Order Not Found"});
        }
        else{
            res.status(200).json(updatedOrder);
        }
    } catch (e) {
        res.status(500).json({error: e.message});

    }
})
orderRouter.get('/api/orders',async(req,res)=>{
    try{
        const orders=await Order.find();
        res.status(200).send(orders);
    }
    catch(e){
        res.status(500).json({error:e.message});
    }
})



// get orders by Vendor id based on status
orderRouter.get("/api/orders-by-status/:vendorId/:status", async (req, res)=>{
    try {
        //extract the Vendor id 
        const {vendorId, status}=req.params;
        //match the vendor id and status 
        const orders=await Order.find({vendorId: vendorId, status: status});
        //if no orders found return 404 with message

        if(orders.length==0){
            return res.status(404).json({msg: "No Orders Found"})
        }
        //if orders are found then return 200 status code
        return res.status(200).json(orders);

    } catch (e) {
        res.status(500).json({error: e.message});
    }
})

module.exports=orderRouter;