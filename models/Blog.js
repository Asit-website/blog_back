const mongoose = require("mongoose");

// Define the Blog schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: { type: String },
  images: [
    {
      type: String,
    },
  ],
  date:{
    type: Date, 
    default:Date.now()
  }
});

// Export the Blog model
module.exports = mongoose.model("Blog", blogSchema);
