const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product'); // подключаем модель товара

const router = express.Router();

// Обработчик для создания нового товара
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, link, images, visible } = req.body;
    
    // Создаем новый продукт
    const newProduct = new Product({
      name,
      description,
      price,
      link,
      images,
      visible: visible || true // если не указано, то товар будет видим по умолчанию
    });
    
    await newProduct.save(); // Сохраняем продукт в базе данных
    res.status(201).json(newProduct); // Отправляем новый продукт в ответ
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обработчик для получения всех товаров
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products); // Отправляем список всех товаров
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обработчик для получения конкретного товара по ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    res.status(200).json(product); // Отправляем товар по ID
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Обработчик для обновления видимости товара (PATCH запрос)
router.patch('/products/:id/visibility', async (req, res) => {
  try {
    const { visible } = req.body;  // Получаем новое значение для visible
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { visible },  // Обновляем поле visible
      { new: true }  // Возвращаем обновленный продукт
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.json(updatedProduct);  // Отправляем обновленный товар обратно
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обработчик для обновления товара (PUT запрос)
router.put('/products/:id', async (req, res) => {
  try {
    const { name, description, price, link, images, visible } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, link, images, visible },
      { new: true }  // Возвращаем обновленный товар
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.status(200).json(updatedProduct); // Отправляем обновленный товар
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обработчик для удаления товара (DELETE запрос)
router.delete('/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.status(200).json({ message: 'Товар успешно удален' }); // Ответ на удаление
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

