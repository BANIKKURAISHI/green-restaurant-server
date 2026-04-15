const express=require('express')
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app =express()
var cors = require('cors');
const { asyncWrapProviders } = require('node:async_hooks');
const port=process.env.PORT || 3000

app.use(cors())
app.use(express.json())
// ! admin : green-restaurant 
// ! pass :I0Fdn65pES0x7X7D

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@menu-card.zoxv5bc.mongodb.net/?appName=menu-card`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  await client.connect();
  const foodData=client.db('foodCollection').collection("foodName")
  const reviewData=client.db('reviewCollection').collection("review")
  const addFoods=client.db('addFoodCollection').collection("addCart")
  // await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
app.get("/foodList",async(req,res)=>{
  const foodItem=await foodData.find().toArray()
  res.send(foodItem)
})
// *** top 12 sort list 
app.get("/topfood",async(req,res)=>{
  const foodItem=await foodData.find().sort({ rating: -1 }).limit(12).toArray()
  res.send(foodItem)
})
app.get("/feedback",async(req,res)=>{
  try {
    const result=await reviewData.find().sort({ _id: -1 }).toArray()
     res.send(result)
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "Failed to fetch feedback" })
  }
})
app.get("/postFood",async(req,res)=>{
  try {
    const result=await addFoods.find().sort({ _id: -1 }).toArray()
     res.send(result)
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "Failed to fetch feedback" })
  }
})




// *** Single product details 
app.get("/foodList/:id",async(req,res)=>{
  try {
    const id=req.params.id
     if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ID" });
    }

  const query={_id: new ObjectId(id)}
  const foodItem=await foodData.findOne(query)
    if (!foodItem) {
      return res.status(404).send({ message: "Food not found" });
    }
  res.send(foodItem)
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "Server error" });
  }
  
})
// *****Feed Back Post and DELETE and UPDATE is START  **//////
app.post('/feedback',async(req,res)=>{
  const review=req.body
  const result =await reviewData.insertOne(review)
  res.status(201).send(result)

})
app.delete('/feedback/:id',async(req,res)=>{
  const id=req.params.id
  console.log(id)
  const query={ _id : new ObjectId(id)}
  // const query={ _id: id}
  console.log(query)
  const result=await reviewData.deleteOne(query)
  console.log(result)
  res.send(result)
})

// *****Feed Back Post and DELETE and UPDATE is END  **//////
app.post('/postFood',async(req,res)=>{
  const review=req.body
 
  const result =await addFoods.insertOne(review)
  res.status(201).send(result)
 console.log(result)
})
app.get("/postFood",async(req,res)=>{
  const result= await addFoods.find().toArray()
  res.send(result)
})


// *** deleted operation

app.delete('/postFood/:id', async (req,res) => {
  try {
    const id = req.params.id;
    // console.log("params id", id)
    //  const item ={ _id : new ObjectId(id)}
     const item = { _id: id}
    // console.log("query",item)
    const result = await addFoods.deleteOne(item);
    res.send(result); 
    console.log(result)
  } catch (error) {
    console.error(error);
    res.send({ message: "Delete failed", error: error.message });
  }
});










  } finally {
    
  
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})