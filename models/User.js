const mongoose = require("mongoose");

const User = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password:{
    type:String,
  }
 
});

module.exports = mongoose.model("BlogUser", User);
