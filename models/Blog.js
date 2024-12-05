const mongoose = require("mongoose");

// Define the Blog schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category:{
     type: mongoose.Schema.Types.ObjectId,
    ref: "Category", 
  },
  description: { type: String },
  subdescription: { type: String },
  images: [
    {
      type: String,
    },
  ],
  banner: [
    {
      type: String,
    },
  ],
  date:{
    type: Date, 
    default:Date.now()
  } , 
  author:{
    type:String,
  }
});

// Export the Blog model
module.exports = mongoose.model("Blog", blogSchema);
