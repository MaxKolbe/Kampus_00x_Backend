const express = require("express")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const userModel = require("../models/userModel")
const router = express.Router()

require("dotenv").config()

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.emailName,
        pass: process.env.emailPass
    }
})

// Reset Password Route
//In this example, when a user submits their email to request a password reset, a unique token is generated using crypto.randomBytes. 
//This token is then saved to the user's resetPasswordToken field in the database along with an expiration time (resetPasswordExpires). 
//An email is then sent to the user's email address with a link that includes the token as a parameter. When the user clicks on the link, 
//they will be directed to a page where they can enter a new password. The server will verify that the token is valid and has not expired, 
//and if so, update the user's password and clear the resetPasswordToken and resetPasswordExpires fields in the database.
//Note that this example assumes that you have already set up a route for the page where users can enter a new password, and that the route 
//for this page is /resetPassword/:token.
router.get("/", (req, res)=>{
  //res.render("resetPasswordForm");
  res.send("reset form")
})

router.post("/", async (req, res)=>{
    crypto.randomBytes(32, async (err, buffer) => {
        if(err){
            console.log(err);
            //return res.redirect("/login");
        }
        const token = buffer.toString("hex");   
        
        try{
            const {email} = req.body 

            if(!email){
                console.log(`There was no email`)
                res.status(400).json({message: "There was no email"})
            }

            const user = await userModel.findOne({email: email})

            if(!user){
                console.log(`User does not exist`)
                res.status(400).json({message: "User does not exist"})
            }
            
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();
                    

            var mailOptions = {
                from: process.env.emailName,
                to: email,
                subject: ` Password Reset Request for Your Kampus Account`,
                html: `<p>Dear ${user.username},</p>
                <p>We have received a request to reset the password for your Kampus account. To ensure the security of your account, we are providing you with the necessary steps to reset your password.</p>
                <p>Please follow the instructions below to reset your password:</p>
                <ol>
                    <li>Click on the following link to access the password reset page: <a href="http://${req.headers.host}/forgotPassword/resetPassword/${token}" target="_blank" rel="noopener noreferrer">RESET</a></li>
                    <li>Once you land on the password reset page, you will be prompted to enter a new password. Choose a strong password that includes a combination of uppercase and lowercase letters, numbers, and special characters to enhance your account's security.</li>
                    <li>After setting your new password, click on the "Reset Password" or "Save Changes" button to finalize the process.</li>
                </ol>
                <p>Please note that this password reset link will expire within an hour for security reasons. If you do not reset your password within this timeframe, you will need to initiate the reset process again.</p>
                <p>If you did not initiate this password reset request, please ignore this email, and your account will remain secure. However, if you suspect any unauthorized activity or believe your account has been compromised, we recommend contacting our support team immediately for further assistance.</p>
                <p>Thank you for your attention to this matter. Should you have any questions or require further assistance, please don't hesitate to reach out to our support team at [support email/phone number].</p>
                <p>Best regards,<br>Kampus Team</p>`
                
            }

            transporter.sendMail(mailOptions, (err, info)=>{
                if(err){
                    console.log(`There was an error ${err}`)
                    res.status(400).json({message: "There was an error"})
                }else{ 
                    console.log(`Mail sent successfully`)
                    res.status(200).json({message: "Mail sent successfully"})
                } 
            })    
        }catch(err){
            console.log(err)
            res.status(400).json({message: "There was an error"})
        }
    })
})

// Render password reset form
router.get("/resetPassword/:token", async (req, res)=>{
    try{
        const user = await userModel.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {$gt: Date.now()},
          })

        if (!user) {
        console.log(`There was no user found`)
        res.status(400).json({message: "There was no user found"})
        res.redirect("/forgotPassword");
        }
        
        res.json({token: req.params.token });  
    }catch(err){
        console.log(`There was an error ${err}`) 
        res.status(400).json({message: "There was an error"})
    }
})

//In this example, the first route renders a form that allows the user to enter a new password. 
//The :token parameter is used to look up the user in the database and verify that the token is valid and has not expired. 
//If the token is invalid or has expired, the user is redirected to the password reset page with an error message.
//The second route handles the submission of the form and updates the user's password in the database. Again, the :token 
//parameter is used to look up the user in the database and verify that the token is valid and has not expired. 
//If the token is invalid or has expired, the user is redirected to the password reset page with an error message.
//If the token is valid, the user's password is updated using the setPassword method provided by passport-local-mongoose. 
//The resetPasswordToken and resetPasswordExpires fields in the database are then cleared, and the user is logged in and 
//redirected to the login route.
router.post("/resetPassword/:token", async (req, res) => {
    try {
        const user = await userModel.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            console.log("There was no user found");
            return res.status(400).json({ message: "There was no user found" });
            // Use 'return' to exit the handler after sending the JSON response
        }

        //Password Update 
        user.setPassword(req.body.password, (err) => {
            if (err) {
                console.log(`There was an error: ${err}`);
                return res.status(400).json({ message: "There was an error" });
                // Use 'return' to exit the handler after sending the JSON response
            }

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save()
            res.json({ success: true, message: "Password changed successfully" });
            // res.redirect("/login");
               
        });
    } catch (err) {
        console.log(`There was an error: ${err}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

// router.get("/data", (req, res)=>{
//   const sessionData = req.session;
//   console.log(sessionData.passport.user)
//   res.send(sessionData)
// }) 

module.exports = router