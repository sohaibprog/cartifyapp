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
        
        const normalizePhone = (p) => {
            let cleaned = p.replace(/\D/g, '');
            if (cleaned.startsWith('92')) cleaned = '0' + cleaned.substring(2);
            return cleaned;
        };
        const phoneNormalized = normalizePhone(phone);

        // 1. Phone validation (Pakistan format: 03...)
        if (!/^03\d{9}$/.test(phoneNormalized) || phoneNormalized.substring(2).split('').every(char => char === '0')) {
            return res.status(400).json({ msg: "Invalid Pakistan phone number (Cannot be all zeros)" });
        }

        // 2. Email validation (General Business Email)
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        if (!emailRegex.test(emailLower)) {
            return res.status(400).json({ msg: "Invalid email format" });
        }

        // 3. IBAN Validation (Strict Format - PKXX AAAA NNNN...)
        const normalizedIBAN = accountNumber.toUpperCase().replace(/\s/g, '');
        const ibanRegex = /^PK[0-9]{2}[A-Z]{4}[0-9]{16}$/;
        if (!ibanRegex.test(normalizedIBAN)) {
            return res.status(400).json({ msg: "Invalid IBAN structure (Format: PKXX AAAA 0000 0000 0000 0000)" });
        }
        
        const numericPart = normalizedIBAN.substring(8);
        if (numericPart.split('').every(char => char === '0')) {
            return res.status(400).json({ msg: "IBAN numeric part cannot be all zeros" });
        }

        // 4. Password validation (Strength)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ msg: "Password does not meet complexity requirements" });
        }

        // 5. Uniqueness Checks
        const existingEmail = await Vendor.findOne({ email: emailLower });
        if (existingEmail) return res.status(400).json({ msg: "Vendor with this email already exists" });

        const existingPhone = await Vendor.findOne({ phone: phoneNormalized });
        if (existingPhone) return res.status(400).json({ msg: "Vendor with this phone number already exists" });

        const existingAccount = await Vendor.findOne({ accountNumber: normalizedIBAN });
        if (existingAccount) return res.status(400).json({ msg: "Vendor with this IBAN already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let vendor = new Vendor({
            fullName, shopName, address, phone: phoneNormalized, city, bank, accountNumber: normalizedIBAN, accountTitle, email: emailLower, password: hashedPassword
        });await vendor.save();

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
            let cleaned = value.replace(/\D/g, '');
            if (cleaned.startsWith('92')) cleaned = '0' + cleaned.substring(2);
            query.phone = cleaned;
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
