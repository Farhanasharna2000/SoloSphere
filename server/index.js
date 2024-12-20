const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()

const port = process.env.PORT || 9000
const app = express()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zlou2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const jobsCollection = client.db('soloDB').collection('jobs');
    const bidsCollection = client.db('soloDB').collection('bids');


    //save a job data in db
    app.post('/add-job', async (req, res) => {
      const jobData = req.body;
      const result = await jobsCollection.insertOne(jobData)
      res.send(result)
    })
    //get all jobs data from db
    app.get('/jobs', async (req, res) => {
      const result = await jobsCollection.find().toArray()
      res.send(result)
    })
    //get all jobs posted by a specific user
    app.get('/jobs/:email', async (req, res) => {
      const email = req.params.email;
      const query = { 'buyer.email': email }
      const result = await jobsCollection.find(query).toArray()
      res.send(result)
    })
    //delete a job from db
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.deleteOne(query)
      res.send(result)
    })

    //get a single job data by id from db
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.findOne(query)
      res.send(result)
    })

    //update a job data in db
    app.put('/update-job/:id', async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const updated = {
        $set: jobData,
      }
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const result = await jobsCollection.updateOne(query, updated, options)
      res.send(result)
    })

    //save a bid data in db
    app.post('/add-bid', async (req, res) => {
      const bidData = req.body;

      //if a user already placed a bid in the job
      const query = { email: bidData.email, jobId: bidData.jobId }
      const alreadyExist = await bidsCollection.findOne(query)
      console.log('exist', alreadyExist);

      if (alreadyExist) {
        return res
          .status(400)
          .send('you have already placed a bid on this job')
      }

      //save data in bid collection

      const result = await bidsCollection.insertOne(bidData)
      //increase bid count in job collection
      const filter = { _id: new ObjectId(bidData.jobId) };
      const update = {
        $inc: {
          bid_count: 1
        }
      }
      const updateCount = await jobsCollection.updateOne(filter, update)
      res.send(result)
    })

    //get all bids for a specific user
    app.get('/my-bids/:email', async (req, res) => {
      const isBuyer = req.query.buyer;
      console.log(isBuyer);
      const email = req.params.email;
      let query = {}
      if (isBuyer) {
        query.buyer = email
      }
      else {
        query.email = email

      }
      const result = await bidsCollection.find(query).toArray()
      res.send(result)
    })


    // update bid status
    app.patch('/bid-status-update/:id', async (req, res) => {
      const id = req.params.id
      const { status } = req.body

      const filter = { _id: new ObjectId(id) }
      const updated = {
        $set: { status },
      }
      const result = await bidsCollection.updateOne(filter, updated)
      res.send(result)
    })

    //get all jobs 

    app.get('/all-jobs', async (req, res) => {

      const filter = req.query.filter;
      const search = req.query.search;
      const sort = req.query.sort;
      let options = {}
      if(sort){
        options={sort:{deadline:sort==='asc'?1:-1}}
      }
      let query = {
        title: {
          $regex: search,
          $options: 'i'
        }
      }
      if (filter) {
        query.category = filter;
      }
      const result = await jobsCollection.find(query,options).toArray()
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
