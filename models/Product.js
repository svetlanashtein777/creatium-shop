// ✅ Обновление видимости товара
router.patch("/:id", async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});
