const express = require("express")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const productModel = require("../models/productModel")
const router = express.Router()
const {verifyCred, verifyCredAndAuthorization, verifyCredAndAdmin} = require("../middleware/verifyCred")

router.use(express.urlencoded({extended: false}))

// //Creates JWT  
// const createJwt = (id)=>{
//     return jwt.sign({id}, process.env.secret, {expiresIn: 30*30})
// }

//CREATE PRODUCT
router.post("/", verifyCredAndAdmin, async (req, res)=>{
    const newProduct = new product
    try{

    }catch(err){
        res.status(500).json({message: `There was an error in creating product: ${err}`})
    }
})





module.exports = router

