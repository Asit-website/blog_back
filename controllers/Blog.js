const Blog = require("../models/Blog");
const { uploadImageToCloudinary } = require("../util/Upload");

// Create a new blog
exports.CreateBlog = async (req, res) => {
    try {
      const { title, description } = req.body;
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images]; // Ensure images is an array
      const imageUrls = [];
  
      // Upload each image to Cloudinary and store the URL
      for (const image of images) {
        const result = await uploadImageToCloudinary(image, "blog_images");
        console.log("result ",result);
        imageUrls.push(result.secure_url);
      }
  
      const blogDetail = await Blog.create({
        title,
        description,
        images: imageUrls,
      });
  
      return res.status(200).json({
        status: true,
        blogDetail,
      });
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  };

// Edit an existing blog
exports.EditBlog = async (req, res) => {
    const { blogId } = req.params; // Get blogId from the request parameters
    const { title, description, images } = req.body; // Assuming images are being sent properly
  
    try {
      // Find and update the blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { title, description, images },
        { new: true, runValidators: true } // Options to return the updated document
      );
  
      if (!updatedBlog) {
        return res.status(404).json({ status: false, message: "Blog not found" });
      }
  
      return res.status(200).json({ status: true, message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error" });
    }
  };
  

// Delete a blog
exports.DeleteBlog = async (req, res) => {
  try {
    const { blogId } = req.body;

    await Blog.findByIdAndDelete(blogId);

    return res.status(200).json({
      status: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

// Get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
      const blogs = await Blog.find(); // Fetches all blogs from the database
  
      return res.status(200).json({
        status: true,
        blogs,
      });
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  };

  exports.GetBlog = async (req, res) => {
    const { blogId } = req.params;
  
    try {
      const blogDetail = await Blog.findById(blogId);
      if (!blogDetail) {
        return res.status(404).json({ status: false, message: "Blog not found" });
      }
      return res.status(200).json({ status: true, blog: blogDetail });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error" });
    }
  };
  