const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzomg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    tls: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db('coffeeDB').collection('coffee');

        const userCollection = client.db('coffeeUserDB').collection('user');

        // get

        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray()
            res.send(result);
        })

        // get single data

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        // get all user data 
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })



        // post 

        app.post('/coffee', async (req, res) => {
            const coffeeData = req.body;
            const result = await coffeeCollection.insertOne(coffeeData);
            res.send(result);
        })

        // user post operation 
        app.post('/user', async (req, res) => {
            const userData = req.body;
            console.log(userData);
            const result = await userCollection.insertOne(userData);
            res.send(result);
        })

        // user last login update api

        app.patch('/users', async (req, res) => {
            const id = req.body.email;
            const filter = { email: id };
            const updateUser = {
                $set: {
                    lastSignInTime: req.body?.lastCreated,
                }
            }
            const result = await userCollection.updateOne(filter, updateUser);
            res.send(result);
        })

        // put 
        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const coffee = req.body;
            const updatedCoffee = {
                $set: {
                    name: coffee.name,
                    chef: coffee.chef,
                    supplier: coffee.supplier,
                    taste: coffee.taste,
                    category: coffee.category,
                    details: coffee.details,
                    photo: coffee.photo
                },
            };
            const result = await coffeeCollection.updateOne(filter, updatedCoffee, option);
            res.send(result);
        })

        // delete
        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        // user delete 
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('coffee server running');
})

app.listen(port, () => {
    console.log('server is running on port', { port });
})