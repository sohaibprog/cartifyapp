const express=require ('express');
const Category=require('../models/category');
const categoryRouter=express.Router();
categoryRouter.post('/api/categories',async(req,res)=>{
    try{
        const {name, image, banner}=req.body;
        const category=new Category({name, image, banner});
        await category.save();
        res.status(201).send(category);
    }
    catch(e){
        res.status(500).json({error:e.message});
    }
})
categoryRouter.get('/api/categories',async(req,res)=>{
    try{
        const categories=await Category.find();
        res.status(200).send(categories);
    }
    catch(e){
        res.status(500).json({error:e.message});
    }
})

categoryRouter.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, banner } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, image, banner },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ msg: "Category not found" });
        }
        res.status(200).send(updatedCategory);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

categoryRouter.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ msg: "Category not found" });
        }
        res.status(200).send(deletedCategory);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports=categoryRouter;