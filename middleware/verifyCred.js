const jwt = require("jsonwebtoken")
require("dotenv").config()

const verifyCred = (req, res, next)=>{
  const token = req.cookies.cred
  if(token){
    jwt.verify(token, process.env.secret, (err, data)=>{
      if(err){
        res.status(400).json({message: `There was an error in verifying user: ${err}`});
      }else{
        next()
      }  
    })
  }else{
    res.status(400).json({message: `There was no token`});
  }
}

module.exports = { verifyCred }