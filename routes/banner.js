const express=require('express');
const Banner=require('../models/banner');
const bannerRouter=express.Router();
bannerRouter.post('/api/banner',async(req,res)=>{
    try{
        const {image}=req.body;
        const banner=new Banner({image});
        await banner.save();
        return res.status(201).send(banner);

    }
    catch(e){
        res.status(400).json({error:e.message})
    }
});
bannerRouter.get('/api/banner',async(req, res)=>{
    try{
        const banners=await Banner.find();
        return res.status(200).send(banners);
    }
    catch(e){
        res.status(500).json({error:e.message});
    }
});

bannerRouter.put('/api/banner/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { image } = req.body;
        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            { image },
            { new: true }
        );
        if (!updatedBanner) {
            return res.status(404).json({ msg: "Banner not found" });
        }
        res.status(200).send(updatedBanner);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

bannerRouter.delete('/api/banner/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBanner = await Banner.findByIdAndDelete(id);
        if (!deletedBanner) {
            return res.status(404).json({ msg: "Banner not found" });
        }
        res.status(200).send(deletedBanner);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports=bannerRouter;