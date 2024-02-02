const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

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
        requird: true
    },
    age:{
        type: String,
        requird: true
    }, 
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpires:{ 
        type: Date
    }
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })// Automatically handles hashing and salting of passwords
// and adds the following properties to the user object:
//   - password
//   - salt
//   - hash

module.exports = mongoose.model("users", userSchema)