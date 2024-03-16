const express = require("express")
const cartModel = require("../models/cartModel")
const router = express.Router()
const {verifyCred, verifyCredAndAuthorization, verifyCredAndAdmin} = require("../middleware/verifyCred")

router.use(express.urlencoded({extended: false}))

//Create Product
router.post("/", verifyCredAndAdmin, async (req, res)=>{
    const newProduct = new productModel(req.body)
    try{
        const savedProduct = await newProduct.save()
        res.status(200).json(savedProduct)
    }catch(err){
        res.status(500).json({message: `Error in creating product: ${err}`})
    }
})

//Handles Product Update request
router.put("/:id", verifyCredAndAdmin, async (req, res)=>{
    try{
        await productModel.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
        res.status(201).json({message: "Product updated successfully"})
    }catch(err){
        res.status(500).json({message: `Error in updating Product: ${err}`})
    }
})

//Handles Delete Product request
router.delete("/:id", verifyCredAndAdmin, async (req,res)=>{
    try{
        await productModel.findByIdAndDelete(req.params.id)
        res.status(200).json({message: `Product deleted successfully`})
    }catch(err){
        res.status(500).json({message:`Error in deleting product: ${err}`})
    }
})

//Handles GET Product request
router.get("/find/:id", async (req,res)=>{
    try{
        const product = await productModel.findById(req.params.id)
        res.status(200).json(product)
    }catch(err){
        res.status(500).json({message:`Error in getting product: ${err}`})
    }
})  

//Handles GET All Products request
router.get("/find", verifyCredAndAdmin, async (req,res)=>{
    const qNew = req.query.new
    const qCategory = req.query.category
    try{  
        let products

        if(qNew){
            products = await productModel.find().sort({createdAt: -1}).limit(5)
        }else if(qCategory){
            products = await productModel.find({categories:{
                $in: [qCategory]
            }})
        }else{
            products = await productModel.find()
        }

        res.status(200).json(products)
    }catch(err){
        res.status(500).json({message:`Error in getting all products: ${err}`})
    }
})  

module.exports = router

