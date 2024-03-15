const express = require("express")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const router = express.Router()
const {verifyCred, verifyCredAndAuthorization, verifyCredAndAdmin} = require("../middleware/verifyCred")

router.use(express.urlencoded({extended: false}))

//Creates JWT  
const createJwt = (id)=>{
    return jwt.sign({id}, process.env.secret, {expiresIn: 30*30})
}

//Handles the signup request for new users
router.post("/signup", async (req, res)=>{
    const {username, password, state, university, email, age} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
        try{
            const user = await userModel.create({username, password: hashedPassword, state, university, email, age})
            const token = createJwt(user.id)
            res.cookie("cred", token, {httpOnly: true})//save the jwt as a cookie 
            res.status(201).json({message: "User created successfully"})
        }catch(err){
            res.status(400).json({message: `There was an error in signing up: ${err}`});
    }
})

//Handles the login request for existing users
router.post('/login', async (req, res) => {
    const {email, password} = req.body
        try{
            const user = await userModel.findOne({email})
            if(user){
            if(await bcrypt.compare(password, user.password)){
                const token = createJwt(user.id)
                res.cookie("cred", token, {httpOnly: true})
                res.status(200).json({message: "Logged in successfully"})
            }}else{
                res.status(400).json({message: "There is no such user"})
            }
        }catch(err){
            res.status(400).json({message: `There was an error in logging in: ${err}`});
        }
})

//Handles the logout request
router.post('/logout', (req, res) => {
    res.clearCookie("cred")
    res.status(200).json({message: "Logged out successfully"})
});

//Handles user update request
router.put("/:id", verifyCredAndAuthorization, async (req, res)=>{
    if(req.body.password){
       req.body.password = await bcrypt.hash(req.body.password, 10)
    }
    try{
        await userModel.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
        res.status(201).json({message: "User updated successfully"})
    }catch(err){
        res.status(500).json({message: `Error in updated user: ${err}`})
    }
})

//Handles delete user request
router.delete("/:id", verifyCredAndAuthorization, async (req,res)=>{
    try{
        await userModel.findByIdAndDelete(req.params.id)
        res.status(200).json({message: `User deleted successfully`})
    }catch(err){
        res.status(500).json({message:`error: ${err}`})
    }
})

//Handles GET user request
router.get("/find/:id", verifyCredAndAdmin, async (req,res)=>{
    try{
        const user = await userModel.findById(req.params.id)
        const {password, ...others } = user._doc
        res.status(200).json(others)
    }catch(err){
        res.status(500).json({message:`error: ${err}`})
    }
})  

//Handles GET All Users request
router.get("/find", verifyCredAndAdmin, async (req,res)=>{
    const query = req.query.new
    try{  
        const users = query ? await userModel.find().sort({id: -1}).limit(5) : await userModel.find()
        res.status(200).json(users)
    }catch(err){
        res.status(500).json({message:`error: ${err}`})
    }
})  

//Handles GET All Users Statistics 
// router.get("/stats", verifyCredAndAdmin, async (req,res)=>{
//     const date = new Date()
//     const lastYear = new Date(date.setFullYear(date.getFullYear() -1 ))

//     try{
//         const data = await userModel.aggregate([
//             {$match: {createdAt: {$gte: lastYear}}},
//             {
//                 $project:{
//                     month: {$month: "$createdAt"}
//                 }
//             },
//             {
//                 $group:{
//                     _id: "$month",
//                     total: {$sum: 1}
//                 }
//             }
//         ])
//         res.status(200).json(data)
//     }catch(err){
//         res.status(500).json({message:`error: ${err}`})
//     }
// })  

module.exports = router

