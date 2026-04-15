require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@menu-card.zoxv5bc.mongodb.net/?appName=menu-card`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let foodData, reviewData, addFoods;

async function run() {
  try {
    await client.connect();
    const db = client.db('foodCollection');
    foodData = db.collection("foodName");
    reviewData = client.db('reviewCollection').collection("review");
    addFoods = client.db('addFoodCollection').collection("addCart");
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}
run().catch(err => {
  console.log("DB failed:", err);
});

// Routes
app.get('/', (req, res) => {
  res.send('Green Restaurant Server is Running!');
});

app.get("/foodList", async (req, res) => {
  try {
    if (!foodData) return res.status(500).send({ error: "Database not connected" });
    const result = await foodData.find().toArray();
    res.send(result);
  } catch (err) { res.status(500).send(err); }
});

app.get("/topfood", async (req, res) => {
  try {
    const result = await foodData.find().sort({ rating: -1 }).limit(12).toArray();
    res.send(result);
  } catch (err) { res.status(500).send(err); }
});

app.get("/foodList/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await foodData.findOne(query);
    res.send(result);
  } catch (error) { res.status(500).send(error); }
});

app.get("/feedback", async (req, res) => {
  const result = await reviewData.find().sort({ _id: -1 }).toArray();
  res.send(result);
});

app.post('/feedback', async (req, res) => {
  const result = await reviewData.insertOne(req.body);
  res.send(result);
});

app.get("/postFood", async (req, res) => {
  const result = await addFoods.find().toArray();
  res.send(result);
});

app.post('/postFood', async (req, res) => {
  const result = await addFoods.insertOne(req.body);
  res.send(result);
});

app.delete('/postFood/:id', async (req, res) => {
  const id = req.params.id;
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
  const result = await addFoods.deleteOne(query);
  res.send(result);
});

// app.listen(port, () => {
//   console.log(`Server is running`);
// });
module.exports = app;