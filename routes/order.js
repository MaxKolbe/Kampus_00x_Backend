const express = require("express")
const orderModel = require("../models/orderModel")
const router = express.Router()
const {verifyCred, verifyCredAndAuthorization, verifyCredAndAdmin} = require("../middleware/verifyCred")

router.use(express.urlencoded({extended: false}))

//Create order
router.post("/", verifyCred, async (req, res)=>{
    const neworder = new orderModel(req.body)
    try{
        const savedorder = await neworder.save()
        res.status(200).json(savedorder)
    }catch(err){
        res.status(500).json({message: `Error in creating order: ${err}`})
    }
})

//Handles order Update request
router.put("/:id", verifyCredAndAdmin, async (req, res)=>{
    try{
        await orderModel.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
        res.status(201).json({message: "order updated successfully"})
    }catch(err){
        res.status(500).json({message: `Error in updating order: ${err}`})
    }
})

//Handles Delete order request
router.delete("/:id", verifyCredAndAdmin, async (req,res)=>{
    try{
        await orderModel.findByIdAndDelete(req.params.id)
        res.status(200).json({message: `order deleted successfully`})
    }catch(err){
        res.status(500).json({message:`Error in deleting order: ${err}`})
    }
})

//Handles GET user orders request
router.get("/find/:userId", verifyCredAndAuthorization, async (req,res)=>{
    try{
        const orders = await orderModel.findOne({_id: req.params.id})
        res.status(200).json(orders)
    }catch(err){
        res.status(500).json({message:`Error in getting order: ${err}`})
    }
})  

//Handles GET All orders request
router.get("/", verifyCredAndAdmin, async (req,res)=>{
  
    try{
        const orders = await orderModel.find()
        res.status(200).json(orders)
    }catch(err){
        res.status(500).json({message:`Error in getting all orders: ${err}`})
    }
})  

//Get Monthly Income
// router.get("/income", verifyCredAndAdmin, async (req, res)=>{
//     const date = new Date()
//     const lastMonth =  new Date(date.setMonth(date.getMonth() -1))
//     const previousMonth =  new Date(date.setMonth(lastMonth.getMonth() -1))
//     try{
//         const income = await orderModel.aggregate([
//             {$match: {createdAt: {$gte: previousMonth}}},
//             {
//                 $project: {
//                     month: {$month: `$createdAt`},
//                     sales: `$amount`
//                 }
//             },
//             {
//                 $group:{
//                     _id: `month`,
//                     total: { $sum: `$sales`}
//                 }
//             }
//         ])
//         res.status(200).json(income)
//     }catch(err){
//         res.status(500).json({message:`Error in getting income: ${err}`})
//     }
// })

module.exports = router

