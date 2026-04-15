require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@menu-card.zoxv5bc.mongodb.net/?appName=menu-card`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Database Connection
    await client.connect();
    const foodData = client.db('foodCollection').collection("foodName");
    const reviewData = client.db('reviewCollection').collection("review");
    const addFoods = client.db('addFoodCollection').collection("addCart");

    console.log("Successfully connected to MongoDB!");

    // --- Routes Start ---

    // Root route
    app.get('/', (req, res) => {
      res.send('Green Restaurant Server is Running!');
    });

    // Get all food
    app.get("/foodList", async (req, res) => {
      const result = await foodData.find().toArray();
      res.send(result);
    });

    // Get top 12 food
    app.get("/topfood", async (req, res) => {
      const result = await foodData.find().sort({ rating: -1 }).limit(12).toArray();
      res.send(result);
    });

    // Get single food by ID
    app.get("/foodList/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid ID" });
        const query = { _id: new ObjectId(id) };
        const result = await foodData.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Server error" });
      }
    });

    // Feedback routes
    app.get("/feedback", async (req, res) => {
      const result = await reviewData.find().sort({ _id: -1 }).toArray();
      res.send(result);
    });

    app.post('/feedback', async (req, res) => {
      const result = await reviewData.insertOne(req.body);
      res.send(result);
    });

    app.delete('/feedback/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await reviewData.deleteOne(query);
      res.send(result);
    });

    // Cart / postFood routes
    app.get("/postFood", async (req, res) => {
      const result = await addFoods.find().toArray();
      res.send(result);
    });

    app.post('/postFood', async (req, res) => {
      const result = await addFoods.insertOne(req.body);
      res.send(result);
    });

    app.delete('/postFood/:id', async (req, res) => {
      try {
        const id = req.params.id;
       
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        const result = await addFoods.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Delete failed" });
      }
    });

    // --- Routes End ---

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);


// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Local Server: http://localhost:${port}`);
    });
}