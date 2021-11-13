const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtojm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('vintage_cars');
        const carsCollection = database.collection('cars');
        const bookingsCollection = database.collection('bookings');
        const eventsCollection = database.collection('events');
        const reviewCollection = database.collection('review');
        const usersCollection = database.collection('users');

        // Add Car
        app.post('/cars', async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            console.log(result);
            res.json(result)
        });

        //GET ALL CARS
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        })

        // GET ALL EVENTS
        app.get('/events', async (req, res) => {
            const cursor = eventsCollection.find({});
            const events = await cursor.toArray();
            res.send(events);
        })

        // Confirm Booking API
        app.post('/confirmBooking', async (req, res) => {
            const bookingDetails = req.body;
            const result = await bookingsCollection.insertOne(bookingDetails);
            res.json(result)
        })

        // Get Confirmed Bookings
        app.get('/confirmBooking', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })

        // Booking List
        app.get('/confirmBooking/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
        })

        // Delete from booking list
        app.delete('/confirmBooking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })

        // Review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        })

        // Get Review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })

        // Add user
        app.post("/users", async (req, res) => {
            const data = await usersCollection.insertOne(req.body);
            res.send(data);
        });

        // Get user
        app.get("/users/:email", async (req, res) => {
            const data = await usersCollection.find({ email: req.params.email }).toArray();
            res.send(data);
        });

        // Update new admin
        app.put("/users", async (req, res) => {
            const email = { email: req.body.email };
            const data = await usersCollection.find({ email });
            if (data) {
                const result = await usersCollection.updateOne(email, {
                    $set: { role: 'admin' },
                })
                res.send(result);
            }
            else {
                const result = await usersCollection.insertOne(req.body.email, {
                    role: 'admin'
                })
                res(result);
            }
        });

        // UPDATE ORDER BY STATUS
        app.patch('/confirmBooking/:id', async (req, res) => {
            const id = ObjectId(req.params.id);
            const result = await ordersCollection.updateOne({ _id: id },
                {
                    $set: { status: req.body.status }
                })
            res.send(result);
        })

        //Delete products 
        app.delete('/cars/:id', async (req, res) => {
            const data = await carsCollection.findOneAndDelete({ _id: ObjectId(req.params.id) });
            res.send(data);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`server is running at localhost:${PORT}`)
});

app.get('/', (req, res) => {
    res.send('server is running')
})