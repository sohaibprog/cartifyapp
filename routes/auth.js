const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/user"); // Model import
const { auth } = require('../middleware/auth');

const authRouter = express.Router();

// Signup API
authRouter.post("/api/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the new user
        const user = new User({ fullName, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ user: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Signin API
authRouter.post("/api/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email exists
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(400).json({ msg: "No User Found With This Email" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, findUser.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Email or Password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: findUser._id }, "passwordKey");

        // Exclude the password field before sending the user object
        const { password: _, ...userWithoutPassword } = findUser.toObject();

        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password API
authRouter.post("/api/forgot-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "No User Found With This Email" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ msg: "Password has been reset successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// add user address, phone

authRouter.put("/api/users/:id", async(req,res)=>{
    try {
        const {id}=req.params;
        const {address, city, phone}=req.body;
        const updateUser=await User.findByIdAndUpdate(
            id,
            {address,
            city,
            phone},
            {new: true},
        );
        if(!updateUser){
            return res.status(404).json({error:"User not Found"});
        }
        else{
            res.status(200).json(updateUser);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });

    }
})


// fetch All Users but Exclude Password

authRouter.get('/api/users', async(req,res)=>{
    try {
        const users=await User.find().select('-password');
        return res.status(200).json(users);
    } catch (e) {
        res.status(500).json({error: e,message});
    }
});

// route to update buyer details

authRouter.put("/api/edit-buyer/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, address, phone, city, email, password } = req.body;

        // Check for existing email (excluding the current user)
        const existingEmail = await User.findOne({ email, _id: { $ne: id } });
        if (existingEmail) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user
        const updateUser = await User.findByIdAndUpdate(
            id,
            {
                fullName,
                address,
                phone,
                city,
                email,
                password: hashedPassword,
            },
            { new: true }
        );

        if (!updateUser) {
            return res.status(404).json({ error: "User not Found" });
        } else {
            res.status(200).json(updateUser);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



module.exports = authRouter;
