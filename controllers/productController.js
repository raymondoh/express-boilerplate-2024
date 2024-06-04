// Import required modules
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const path = require("path");

// Import Mongoose models
const Product = require("../models/ProductModel");
//const User = require("../models/UserModel");

// Controller functions

// @desc Get all products static
// @route GET /api/v1/products/static
// @access Public
const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

// @desc Get all products
// @route GET /api/v1/products
// @access Public
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

// @desc Get a single product
// @route GET /api/v1/products/:id
// @access Public
const getProduct = async (req, res) => {
  const { id: productId } = req.params;

  // Validate the productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid product ID format" });
  }

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No product with id: ${productId}` });
  }

  res.status(StatusCodes.OK).json({ product });
};

// @desc Create a new product
// @route POST /api/v1/products
// @access Private/Admin
const createProduct = async (req, res) => {
  const { name, description, price, category, company, colors, image, featured } = req.body;
  const userId = req.user.userId;

  console.log("Request Body:", req.body);
  console.log("User ID:", userId);
  console.log("User Role:", req.user.role);

  // Validate the input
  if (!name || !description || !price || !category || !company) {
    console.log("Validation Failed: Missing required fields");
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Please provide all required fields" });
  }

  if (typeof price !== "number" || price <= 0) {
    console.log("Validation Failed: Invalid price");
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Price must be a positive number" });
  }

  // Ensure the user is authorized to create a product
  if (req.user.role !== "admin") {
    console.log("Authorization Failed: User is not an admin");
    return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not authorized to create a product" });
  }

  const productData = {
    name,
    description,
    price,
    category,
    company,
    colors: colors || ["black"], // Use provided colors or default to ["black"]
    image,
    featured,
    createdBy: userId // Ensure createdBy field is set correctly
  };

  console.log("Product Data to Create:", productData);

  const product = await Product.create(productData);

  console.log("Product Created:", product);

  res.status(StatusCodes.CREATED).json({ product });
};

// @desc Update a product
// @route PATCH /api/v1/products/:id
// @access Private/Admin
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  // Validate the productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid product ID format" });
  }

  // Ensure the user is authorized to update the product
  if (req.user.role !== "admin") {
    console.log("Authorization Failed: User is not an admin");
    return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not authorized to update this product" });
  }

  // Define allowed fields to update
  const allowedUpdates = ["name", "description", "price", "category", "company", "colors", "image", "featured"];
  const updates = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const product = await Product.findOneAndUpdate({ _id: productId }, updates, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No product with id: ${productId}` });
  }

  res.status(StatusCodes.OK).json({ product });
};

// @desc Delete a product
// @route DELETE /api/v1/products/:id
// @access Private/Admin
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  // Validate the productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid product ID format" });
  }

  // Ensure the user is authorized to delete the product
  if (req.user.role !== "admin") {
    console.log("Authorization Failed: User is not an admin");
    return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not authorized to delete this product" });
  }

  const product = await Product.findOneAndDelete({ _id: productId });

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No product with id: ${productId}` });
  }

  res.status(StatusCodes.OK).json({ msg: `Product with id: ${productId} has been deleted` });
};
// @desc Upload a product image
// @route PUT /api/v1/products/upload-image
// @access Private/Admin
const uploadProductImage = async (req, res) => {
  if (!req.files) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "No file uploaded" });
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please upload an image file" });
  }
  const maxSize = process.env.MAX_FILE_UPLOAD;
  if (productImage.size > maxSize) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: `Please upload an image less than ${maxSize}` });
  }

  const imagePath = path.join(__dirname, `../public/uploads/${productImage.name}`);

  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: productImage.name });
};

module.exports = {
  getAllProductsStatic,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
