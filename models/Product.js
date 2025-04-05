const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  images: [{ type: String, required: true }],      // Массив ссылок на фото (Cloudinary)
  name: { type: String, required: true },          // Название товара
  description: { type: String },                   // Описание
  link: { type: String },                          // Ссылка на товар
  price: { type: Number, required: true },         // Цена
  visible: { type: Boolean, default: true }        // 👈 Видимость товара
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
