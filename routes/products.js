const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");

const router = express.Router();

// 🔹 Настройки Cloudinary
cloudinary.config({
  cloud_name: "dxnunucop",
  api_key: "492397956353742",
  api_secret: "YZLSWp2wBE4MqXZqYt0MILXkkJk"
});

// 🔹 Настройки Multer для загрузки файлов в Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});
const upload = multer({ storage });

// ✅ Получение всех товаров
router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query.search
      ? { name: { $regex: req.query.search, $options: "i" } }
      : {};
    const products = await Product.find(searchQuery);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Добавление нового товара
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const { name, description, link, price } = req.body;
    const images = req.files?.map(file => file.path) || [];

    const newProduct = new Product({
      images,
      name,
      description,
      link,
      price,
      visible: true // 👈 используем visible вместо hidden
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Обновление товара
router.put("/:id", async (req, res) => {
  try {
    const { name, description, price, link } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, link },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Удаление товара
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Товар удален" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Обновление видимости (универсально)
router.patch("/:id", async (req, res) => {
  try {
    const { visible } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { visible },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
