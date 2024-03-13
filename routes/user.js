const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const router = express.Router()
const {verifyCred} = require("../middleware/verifyCred")

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
router.put("/:id", verifyCred, (req, res)=>{
    
})

module.exports = router

