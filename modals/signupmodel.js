const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true

    },
    email: {
        type: String,
        require: true,

        unique: true,
    },
    password: {
        type: String,
        require: true


    },
    token:{
        type:String,
    }


});



//hash passwoed

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next();
});

//match



//sign token



const User = mongoose.model("User", UserSchema);
module.exports = User;


