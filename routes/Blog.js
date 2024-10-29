const express = require("express");
const router = express.Router();
const { CreateBlog, EditBlog, DeleteBlog, getAllBlogs, GetBlog } = require("../controllers/Blog");

// Route for creating a blog
router.post("/createBlog", CreateBlog);

// Route for editing a blog - changed to PUT and include blogId in URL
router.post("/editBlog/:blogId", EditBlog);

// Route for deleting a blog
router.post("/deleteBlog", DeleteBlog);

// Route for getting all blogs
router.get("/getAllBlog", getAllBlogs);

// Route for getting a single blog by ID
router.get("/getBlog/:blogId", GetBlog);

module.exports = router;
