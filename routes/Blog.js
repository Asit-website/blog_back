const express = require("express");
const router = express.Router();
const { CreateBlog, EditBlog, DeleteBlog, getAllBlogs, GetBlog, createCategory, updateCategory, deleteCategory, fetchAllCategories, getBlogsByCategory , getRecentBlogs, register, login  , FetchCategorySingleDetail , AllCatBlogs , recentBlogs , FeaturedCategoryBlogs , SingleBlog , GetAllBlogAdmin} = require("../controllers/Blog");

// Route for creating a blog
router.post("/createBlog", CreateBlog);

router.post("/editBlog/:blogId", EditBlog);

// Route for deleting a blog
router.post("/deleteBlog", DeleteBlog);

// Route for getting all blogs

router.get("/getAllBlog", getAllBlogs);
router.get("/getAllBlogAdmin", GetAllBlogAdmin);

router.get("/getBlog/:blogId", GetBlog);

// Create Category
router.post("/categories", createCategory);

// Update Category
router.put("/categories/:categoryId", updateCategory);

// Delete Category
router.delete("/categories/:categoryId", deleteCategory);

// Fetch All Categories
router.get("/categories", fetchAllCategories);

// Get Blogs by Category
router.get("/categories/:categoryId/blogs", getBlogsByCategory);

router.get("/singlecat/:id" , FetchCategorySingleDetail )

router.get("/getRecentBlog" , getRecentBlogs)

router.post("/login" , login);
router.post("/register" , register);

// new apis

router.get("/allcatBlogs" , AllCatBlogs);
router.get("/recentBlogs" , recentBlogs);


router.get("/featured" , FeaturedCategoryBlogs);

router.get("/singleblog/:id" , SingleBlog);

module.exports = router;
