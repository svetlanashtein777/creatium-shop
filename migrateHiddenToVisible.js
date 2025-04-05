// migrateHiddenToVisible.js
const mongoose = require("mongoose");
const Product = require("./models/Product"); // путь может отличаться

const MONGO_URI = "mongodb://localhost:27017/your_database_name"; // замени на свою строку подключения

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("Подключено к MongoDB");

  const result = await Product.updateMany(
    { hidden: { $exists: true } },
    [
      { $set: { visible: { $not: ["$hidden"] } } },
      { $unset: "hidden" }
    ]
  );

  console.log("Миграция завершена:", result.modifiedCount, "документов обновлено");
  mongoose.disconnect();
}

migrate().catch(console.error);
