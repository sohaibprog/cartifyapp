const express= require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor=require('../models/vendor');
const vendor = require('../models/vendor');
const vendorRouter=express.Router();
// Signup API
vendorRouter.post("/api/vendor/signup", async (req, res) => {
    try {
        const { fullName,shopName,address,phone,city,bank,accountNumber,accountTitle, email, password } = req.body;
        const emailLower = email.toLowerCase();

        // Check if phone format is valid and not all zeros
        const phoneRegex = /^\d{4}-\d{7}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ msg: "Phone must be in the format 0000-0000000" });
        }
        if (phone === '0000-0000000') {
            return res.status(400).json({ msg: "Phone number cannot be all zeros" });
        }

        // Check if IBAN/Account Number format is valid (General IBAN regex)
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,28}$/;
        if (!ibanRegex.test(accountNumber)) {
            return res.status(400).json({ msg: "Invalid IBAN/Account Number format" });
        }
        if (accountNumber.substring(4).split('').every(char => char === '0')) {
            return res.status(400).json({ msg: "IBAN/Account Number cannot be all zeros" });
        }

        // Check if the email already exists
        const existingEmail = await Vendor.findOne({ email: emailLower });
        if (existingEmail) {
            return res.status(400).json({ msg: "Vendor with this email already exists" });
        }

        // Check if the phone already exists
        const existingPhone = await Vendor.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ msg: "Vendor with this phone number already exists" });
        }

        // Check if the Account Number already exists
        const existingAccount = await Vendor.findOne({ accountNumber });
        if (existingAccount) {
            return res.status(400).json({ msg: "Vendor with this Account Number/IBAN already exists" });
        }

        // Check password length
        if (password.length < 8) {
            return res.status(400).json({ msg: "Password must be at least 8 characters long" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the new user
        const vendor = new Vendor({ fullName,shopName,address,phone,city, bank,accountNumber,accountTitle,  email: emailLower, password: hashedPassword });
        await vendor.save();

        res.status(201).json({ vendor: vendor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Signin API
vendorRouter.post("/api/vendor/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email exists
        const findUser = await Vendor.findOne({ email });
        if (!findUser) {
            return res.status(400).json({ msg: "No Vendor Found With This Email" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, findUser.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Email or Password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: findUser._id }, "passwordKey");

        // Exclude the password field before sending the user object
        const { password: _, ...vendorWithoutPassword } = findUser.toObject();

        res.json({ token, vendor: vendorWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// fetch All vendors excluding password

vendorRouter.get('/api/vendors', async(req, res)=>{
    try {
        const vendors=await Vendor.find().select('-password');
        return res.status(200).json(vendors);
    } catch (e) {
        return res.status(500).json({error:e.message})
    }
});



//route to update vendor details
vendorRouter.put("/api/edit-vendor/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, shopName, address, phone, city, bank, accountNumber, accountTitle,email, password } = req.body;

        // Check for existing email (excluding the current user)
        const existingEmail = await Vendor.findOne({ email, _id: { $ne: id } });
        if (existingEmail) {
            return res.status(400).json({ msg: "Vendor with this email already exists" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user
        const updateUser = await Vendor.findByIdAndUpdate(
            id,
            {
                fullName,
                shopName,
                address,
                phone,
                city,
                bank, 
                accountNumber,
                accountTitle,
                email,
                password: hashedPassword,
            },
            { new: true }
        );

        if (!updateUser) {
            return res.status(404).json({ error: "Vendor not Found" });
        } else {
            res.status(200).json(updateUser);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Forgot Password API for Vendor
vendorRouter.post("/api/vendor/forgot-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const emailLower = email.toLowerCase();

        // Check if the vendor exists
        const vendor = await Vendor.findOne({ email: emailLower });
        if (!vendor) {
            return res.status(404).json({ msg: "No Vendor Found With This Email" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the vendor's password
        vendor.password = hashedPassword;
        await vendor.save();

        res.status(200).json({ msg: "Password has been reset successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Route to check if vendor detail exists (for real-time uniqueness validation)
vendorRouter.get("/api/vendor/check-uniqueness", async (req, res) => {
    try {
        const { field, value } = req.query;
        if (!field || !value) {
            return res.status(400).json({ msg: "Field and value are required" });
        }

        let query = {};
        if (field === 'email') {
            query.email = value.toLowerCase();
        } else if (field === 'phone') {
            query.phone = value;
        } else if (field === 'accountNumber') {
            query.accountNumber = value;
        } else {
            return res.status(400).json({ msg: "Invalid field name" });
        }

        const exists = await Vendor.findOne(query);
        res.json({ exists: !!exists });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports=vendorRouter;
