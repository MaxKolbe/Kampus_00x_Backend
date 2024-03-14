const jwt = require("jsonwebtoken")
require("dotenv").config()

const verifyCred = (req, res, next)=>{
  const token = req.cookies.cred
  if(token){
    jwt.verify(token, process.env.secret, (err, user)=>{
      if(err){
        res.status(400).json({message: `User's Toen/cred is not valid. Error in verifying: ${err}`});
      }else{
        req.user = user
        next()
      }  
    })
  }else{
    res.status(400).json({message: `There was no token`});
  }
}

const verifyCredAndAuthorization = (req, res, next) =>{
  verifyCred(req, res, ()=>{
    if(req.user.id === req.params.id || req.user.isAdmin){
      next()
    }else{
      res.status(400).json({message: `User unidentified or isNotAdmin`});
    }
  })
}

const verifyCredAndAdmin= (req, res, next) =>{
  verifyCred(req, res, ()=>{
    if(req.user.isAdmin){
      next()
    }else{
      res.status(400).json({message: `User unidentified or isNotAdmin`});
    }
  })
}
module.exports = { 
  verifyCred, 
  verifyCredAndAuthorization,
  verifyCredAndAdmin
}