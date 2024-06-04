const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"]
    },
    description: {
      type: String,
      required: [true, "Please provide product description"]
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"]
    },
    category: {
      type: String,
      required: [true, "Please provide product category"]
    },
    company: {
      type: String,
      required: [true, "Please provide product company"],
      enum: {
        values: ["ikea", "liddy", "caressa", "marcos"],
        message: "{VALUE} is not supported"
      }
    },
    colors: {
      type: [String],
      required: [true, "Please provide product colors"],
      default: ["black"] // Set default value for colors
    },
    image: {
      type: String,
      default: "/uploads/example.jpg"
    },
    featured: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
