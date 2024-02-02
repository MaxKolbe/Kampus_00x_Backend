const express = require("express")
const mongoose = require("mongoose")
const userModel = require("./models/userModel")
const passport = require("passport")
// const flash = require('express-flash');
const session = require("express-session")
const LocalStrategy = require('passport-local').Strategy;
const forgotPassword = require("./routes/forgotPassword")
require("dotenv").config()

const app = express()
const port = process.env.PORT

//Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,//signs the session ID cookie
    resave: false,//session data should not be saved to the session store on every request
    saveUninitialized: true,//a new empty session should be created for every request
    cookie: { maxAge: 60 * 5 * 1000 }//session lasts 5 minutes 
}))
app.use(express.json())//JSON middleware
app.use(express.urlencoded({extended: false}))//Accessing forms in req variable
app.use(passport.initialize())//Initialize Passport middleware-preps Passport for authentication
app.use(passport.session())//Sets up session support for Passport
// app.use(flash());

passport.use(new LocalStrategy({ usernameField: 'email' }, userModel.authenticate()));//Authentication strategy (username/password)
passport.serializeUser(userModel.serializeUser());//serialize the user object to and from the session
passport.deserializeUser(userModel.deserializeUser());//deserialize the user object to and from the session

//Database connection
mongoose.connect(process.env.url)
.then(()=>{
    console.log(`Connected to the mongo database successfully`)
}).catch((err)=>{
    console.log(`Database connection error: ${err}`)
})
app.use("/forgotPassword", forgotPassword)

app.get("/", (req, res)=>{
    res.status(200).json({message: "server is running"})
})

//Handles the signup request for new users
app.post("/signup", (req, res)=>{
    const {username, password, state, university, email, age} = req.body
    const newUser = new userModel({
        username, state, university, email, age
    }); 
    userModel.register(newUser, password, (err, user) => {
        if (err){
            console.log(err); 
            res.status(400).json({error: err});
        } else {
            passport.authenticate('local')(req, res, () => {
                res.status(201).json({message: "user created successfully"})
            });
        } 
    });
})

//Handles the login request for existing users
app.post('/login', passport.authenticate('local', { failureRedirect: '/' , usernameField: 'email' }), (req, res) => {
    res.status(200).json({message: "Logged in successfully"})
});//note logs in with email and password

//Handles the logout request
app.post('/logout', (req, res) => {
    req.logout(()=>{
        res.status(200).json({message: "logged out successfully"})
    })  
});

//catch errors middleware
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({message: 'something broke', error: err});
});

//server listener
app.listen(port, ()=>{
    console.log(`Server started at Localhost:${port}`)
})