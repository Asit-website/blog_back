const Blog = require("../models/Blog");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../util/Upload");
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating tokens
const User = require("../models/User"); // Assuming you have a User model

const JWT_SECRET = process.env.JWT_SECRET 


exports.CreateBlog = async (req, res) => {
  try {
    const { title, description, categoryId , subdescription , author } = req.body;
    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images]; 
    const imageUrls = [];

    const banners = Array.isArray(req.files.banner)
      ? req.files.banner
      : [req.files.banner]; 
    const imageUrls2 = [];

    console.log("bammer",banners);



    for (const image of images) {
      const result = await uploadImageToCloudinary(image, "blog_images");
      imageUrls.push(result.secure_url);
    }

    for (const image of banners) {
      const result = await uploadImageToCloudinary(image, "blog_images");
      imageUrls2.push(result.secure_url);
    }

    const blogDetail = await Blog.create({
      title,
      description,
      category: categoryId,
      images: imageUrls,
      subdescription,
      banner: imageUrls2   , 
      author
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
  const { title, description, categoryId , subdescription , author } = req.body;
  const images = req.files?.images; 
  const banners = req.files?.banner; 


  try {
    const imageUrls = [];
    const imageUrls2 = [];

    if (images) {
      const imageArray = Array.isArray(images) ? images : [images];
      for (const image of imageArray) {
        const result = await uploadImageToCloudinary(image, "blog_images");
        imageUrls.push(result.secure_url);
      }
    }

    if (banners) {
      const imageArray = Array.isArray(banners) ? banners : [banners];
      for (const image of imageArray) {
        const result = await uploadImageToCloudinary(image, "blog_images");
        imageUrls2.push(result.secure_url);
      }
    }

    const updateData = {
      title,
      description,
      category: categoryId,
      subdescription,
      author
    };
    if (imageUrls.length > 0) updateData.images = imageUrls; 
    if (imageUrls2.length > 0) updateData.banner = imageUrls2; 

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ status: false, message: "Blog not found" });
    }

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

exports.GetAllBlogAdmin = async(req ,res)=>{

   const blogs = await Blog.find({});
   return res.status(200).json({
    status: true,
    blogs,
  });
  
}


exports.getAllBlogs = async (req, res) => {
  try {
    const featuredCategory = await Category.findOne({ title: "Featured" });

    const query = featuredCategory ? { category: { $ne: featuredCategory._id } } : {};

    const blogs = await Blog.find(query)
      .populate("category") 
      .sort({ date: -1 });

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


exports.login = async (req, res) => {


  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "3d" } 
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.FetchCategorySingleDetail = async (req, res) => {
  try {
    const { id } = req.params; 

    console.log("id",id);

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.AllCatBlogs = async (req, res) => {
  try {
    const category = await Category.find({  $and: [ { title: { $ne: "Featured" } },  { title: { $ne: "All" } } ] }).populate("blogs");
  
    return res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      data: category ,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


exports.recentBlogs = async (req, res) => {
  try {

    const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(6); 

    return res.status(200).json({
      status: true,
      message: "Category fetched successfully",
      data: recentBlogs,
    });
  } catch (error) {
    console.error("Error fetching category:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.FeaturedCategoryBlogs = async (req, res) => {
  try {

    const featuredCategory = await Category.findOne({ title: "Featured" }).populate("blogs").limit(6);

    if (!featuredCategory) {
      return res.status(404).json({
        status: false,
        message: "No category with title 'Featured' found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Featured category fetched successfully",
      data: featuredCategory, 
    });
  } catch (error) {
    console.error("Error fetching featured category:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.SingleBlog = async (req, res) => {
  try {

    const {id} = req.params;
    
    const blogdetail = await Blog.findById(id);

    if(!blogdetail){
      return res.status(400).json({
        status: false,
        message: "Featured category fetched unsuccssful",
      });
    }

  
    return res.status(200).json({
      status: true,
      message: "Featured category fetched successfully",
      data: blogdetail, 
    });
  } catch (error) {
    console.error("Error fetching featured category:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
