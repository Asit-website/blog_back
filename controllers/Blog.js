const Blog = require("../models/Blog");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../util/Upload");

exports.CreateBlog = async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;
    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images]; 
    const imageUrls = [];

    for (const image of images) {
      const result = await uploadImageToCloudinary(image, "blog_images");
      imageUrls.push(result.secure_url);
    }

    const blogDetail = await Blog.create({
      title,
      description,
      category: categoryId,
      images: imageUrls,
    });

    await Category.findByIdAndUpdate(
      categoryId,
      { $push: { blogs: blogDetail._id } },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      blogDetail,
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};


exports.EditBlog = async (req, res) => {
  const { blogId } = req.params;
  const { title, description, categoryId } = req.body;
  const images = req.files?.images; // Check if images are present in the request

  console.log("title " ,title , "iamges " , images);

  try {
    const imageUrls = [];

    // If new images are provided, upload them to Cloudinary
    if (images) {
      const imageArray = Array.isArray(images) ? images : [images];
      for (const image of imageArray) {
        const result = await uploadImageToCloudinary(image, "blog_images");
        imageUrls.push(result.secure_url);
      }
    }

    // Update blog with new data and new images if provided
    const updateData = {
      title,
      description,
      category: categoryId,
    };
    if (imageUrls.length > 0) updateData.images = imageUrls; // Only update images if new images are uploaded

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ status: false, message: "Blog not found" });
    }

    // Update the category with the blog ID if necessary
    await Category.findByIdAndUpdate(
      categoryId,
      { $addToSet: { blogs: updatedBlog._id } },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.DeleteBlog = async (req, res) => {
  try {
    const { blogId, categoryId } = req.body;

    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res.status(404).json({ status: false, message: "Blog not found" });
    }

    await Category.findByIdAndUpdate(categoryId, { $pull: { blogs: blogId } });

    return res.status(200).json({
      status: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("category").sort({date: -1 }); // Populate category details
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
    const blogDetail = await Blog.findById(blogId).populate("category"); // Populate category details
    if (!blogDetail) {
      return res.status(404).json({ status: false, message: "Blog not found" });
    }
    return res.status(200).json({ status: true, blog: blogDetail });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.createCategory = async (req, res) => {
  const { title } = req.body;
  try {
    const newCategory = await Category.create({ title });
    return res.status(201).json({ status: true, category: newCategory });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { title, blogs } = req.body;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { title, blogs },
      { new: true }
    );
    if (!updatedCategory) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }
    return res.status(200).json({ status: true, category: updatedCategory });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }
    return res.status(200).json({ status: true, message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Fetch All Categories
exports.fetchAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("blogs");
    return res.status(200).json({ status: true, categories });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Get Blogs by Category
exports.getBlogsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    // Find category by ID and populate the blogs within the category along with each blog's category details
    const category = await Category.findById(categoryId).populate({
      path: "blogs",
      populate: {
        path: "category", // Populate the category inside each blog as well
        select: "title",  // Optional: select specific fields if you don't want all category fields
      },
    });

    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    return res.status(200).json({ status: true, blogs: category.blogs });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// API to get the 6 most recently published blogs
exports.getRecentBlogs = async (req, res) => {
  try {
    const recentBlogs = await Blog.find()
      .sort({ date: -1 })       // Sort by date in descending order (newest first)
      .limit(6)                  // Limit to 6 items
      .populate('category');     // Populate category details

    return res.status(200).json({ status: true, blogs: recentBlogs });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};