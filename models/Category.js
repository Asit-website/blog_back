const mongoose = require("mongoose");

// Define the Category schema
const Category = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  }
});

// Export the Category model
module.exports = mongoose.model("Category", Category);
