const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        requird: true
    }, 
    state:{
        type: String,
        requird: true
    },
    university:{
        type: String,
        requird: true
    },
    email:{
        type: String,
        requird: true,
        unique: true
    },
    age:{
        type: String,
        requird: true
    }, 
    isAdmin:{
        type: Boolean,
        default: true
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpires:{ 
        type: Date
    }
}, { timestamps: true })

module.exports = mongoose.model("users", userSchema)