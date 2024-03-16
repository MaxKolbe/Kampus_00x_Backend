const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const forgotPassword = require("./routes/forgotPassword")
const userRoute = require("./routes/user")
const producRoute = require("./routes/product")

require("dotenv").config()

const app = express()
const port = process.env.PORT

app.use(express.json())//JSON middleware
app.use(express.urlencoded({extended: false}))//Accessing forms in req variable
app.use(cookieParser())

//Database connection
mongoose.connect(process.env.url)
.then(()=>{
    console.log(`Connected to the mongo database successfully`)
}).catch((err)=>{
    console.log(`Database connection error: ${err}`)
})

app.use("/auth", userRoute)
app.use("/product", producRoute)
app.use("/forgotPassword", forgotPassword)

app.get("/", (req, res)=>{
    res.status(200).json({message: "server is running"})
})

//catch errors middleware
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({message: 'something broke', error: err});
});

//server listener
app.listen(port, ()=>{
    console.log(`Server started at Localhost:${port}`)
})