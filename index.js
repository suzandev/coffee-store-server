const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.on5po.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let coffeeCollection;
let usersCollection;

async function connectDB() {
  if (!coffeeCollection) {
    await client.connect();
    const db = client.db("coffeeDB");
    coffeeCollection = db.collection("coffees");
    usersCollection = db.collection("users");
    console.log("Connected to MongoDB");
  }
}

/* =========================
   Coffee Routes
========================= */

app.get("/coffees", async (req, res) => {
  await connectDB();
  const result = await coffeeCollection.find().toArray();
  res.send(result);
});

app.get("/coffees/:id", async (req, res) => {
  await connectDB();
  const id = req.params.id;
  const result = await coffeeCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});

app.post("/coffees", async (req, res) => {
  await connectDB();
  const newCoffee = req.body;
  const result = await coffeeCollection.insertOne(newCoffee);
  res.send(result);
});

// ✅ FIXED (was /coffee/:id)
app.put("/coffees/:id", async (req, res) => {
  await connectDB();
  const id = req.params.id;
  const updatedCoffee = req.body;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: updatedCoffee,
  };

  const result = await coffeeCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.delete("/coffees/:id", async (req, res) => {
  await connectDB();
  const id = req.params.id;
  const result = await coffeeCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});

/* =========================
   User Routes
========================= */

app.get("/users", async (req, res) => {
  await connectDB();
  const result = await usersCollection.find().toArray();
  res.send(result);
});

app.post("/users", async (req, res) => {
  await connectDB();
  const newUser = req.body;
  const result = await usersCollection.insertOne(newUser);
  res.send(result);
});

app.patch("/users", async (req, res) => {
  await connectDB();
  const { email, lastSignInTime } = req.body;

  const filter = { email: email };
  const updateDoc = {
    $set: {
      lastSignInTime: lastSignInTime,
    },
  };

  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.delete("/users/:id", async (req, res) => {
  await connectDB();
  const id = req.params.id;
  const result = await usersCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});

/* =========================
   Root Route
========================= */

app.get("/", (req, res) => {
  res.send("Server is running successfully 🚀");
});

module.exports = app;
