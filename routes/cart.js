const express = require("express")
const cartModel = require("../models/cartModel")
const router = express.Router()
const {verifyCred, verifyCredAndAuthorization, verifyCredAndAdmin} = require("../middleware/verifyCred")

router.use(express.urlencoded({extended: false}))

//Create Cart
router.post("/", verifyCred, async (req, res)=>{
    const newCart = new cartModel(req.body)
    try{
        const savedCart = await newCart.save()
        res.status(200).json(savedCart)
    }catch(err){
        res.status(500).json({message: `Error in creating Cart: ${err}`})
    }
})

//Handles Cart Update request
router.put("/:id", verifyCredAndAuthorization, async (req, res)=>{
    try{
        await cartModel.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
        res.status(201).json({message: "Cart updated successfully"})
    }catch(err){
        res.status(500).json({message: `Error in updating Cart: ${err}`})
    }
})

//Handles Delete Cart request
router.delete("/:id", verifyCredAndAuthorization, async (req,res)=>{
    try{
        await cartModel.findByIdAndDelete(req.params.id)
        res.status(200).json({message: `Cart deleted successfully`})
    }catch(err){
        res.status(500).json({message:`Error in deleting Cart: ${err}`})
    }
})

//Handles GET user Cart request
router.get("/find/:userId", verifyCredAndAuthorization, async (req,res)=>{
    try{
        const cart = await cartModel.findOne({_id: req.params.id})
        res.status(200).json(cart)
    }catch(err){
        res.status(500).json({message:`Error in getting Cart: ${err}`})
    }
})  

//Handles GET All Carts request
router.get("/", verifyCredAndAdmin, async (req,res)=>{
  
    try{
        const carts = await cartModel.find()
        res.status(200).json(carts)
    }catch(err){
        res.status(500).json({message:`Error in getting all Carts: ${err}`})
    }
})  

module.exports = router

