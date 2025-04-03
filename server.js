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
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

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
  images: [String], // массив строк для URL изображений
  name: { type: String, required: true },
  description: String,
  link: String,
  price: { type: Number, required: true },
});

// API: Добавить товар
app.post("/products", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ error: "Название и цена обязательны" });
    }

    const images = req.files.map((file) => file.path);
    const { name, description, link, price } = req.body;

    const newProduct = new Product({ images, name, description, link, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Ошибка при добавлении товара:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// API: Получить все товары
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Ошибка при получении товаров:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// API: Редактировать товар
app.put("/products/:id", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    console.error("Ошибка при обновлении товара:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// API: Удалить товар (если понадобится)
app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Товар удален" });
  } catch (err) {
    console.error("Ошибка при удалении товара:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
