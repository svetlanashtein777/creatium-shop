require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Настройка Multer для загрузки файлов
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: "products", format: async () => "jpeg" },
});
const upload = multer({ storage });

// Модель товара
const Product = mongoose.model("Product", {
  images: [String],
  name: String,
  description: String,
  link: String,
  price: Number,
  available: { type: Boolean, default: true },
});

// API: Добавить товар
app.post("/products", upload.array("images", 10), async (req, res) => {
  try {
    const images = req.files.map((file) => file.path);
    const { name, description, link, price, available } = req.body;

    const newProduct = new Product({
      images, name, description, link, price,
      available: available === "true"
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Получить товары (только те, что в наличии)
app.get("/products", async (req, res) => {
  const products = await Product.find({ available: true });
  res.json(products);
});

// API: Редактировать товар
app.put("/products/:id", async (req, res) => {
  const { name, description, price } = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price },
    { new: true }
  );
  res.json(updatedProduct);
});

// API: Скрыть/Показать товар
app.patch("/products/:id/toggle", async (req, res) => {
  const product = await Product.findById(req.params.id);
  product.available = !product.available;
  await product.save();
  res.json(product);
});

// API: Удалить товар
app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Товар удален" });
});

// Запуск сервера
app.listen(5000, () => console.log("Server running on port 5000"));
