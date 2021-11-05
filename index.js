const express=require('express');
const app=express();
const { MongoClient } = require('mongodb');
const cors=require('cors')
const ObjectId=require('mongodb').ObjectId
require('dotenv').config()

const port=process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ffgwy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db('TravisitTour');
      const tourCollection = database.collection("tour");
      const bookingCollection=database.collection('booking')
    //   get all data api
      app.get('/tours', async(req,res)=>{

          const cursor= tourCollection.find({});
          const tours=await cursor.toArray();
          res.send(tours)
      })

      app.post('/tours', async(req,res)=>{
        const tour=req.body;
        const result =  await tourCollection.insertOne(tour);

        res.json(result);
    })


    //   get a single tour data
    app.get("/tours/:id",async(req,res)=>{
        const id =req.params.id;
        const query={_id:ObjectId(id)}
        const result=await tourCollection.findOne(query);
        res.send(result);
        
    })
    // get all booking
    app.get('/booking', async(req,res)=>{

      const cursor= bookingCollection.find({});
      const booking=await cursor.toArray();
      res.send(booking)
  })

    //posting the booking

    app.post('/booking', async(req,res)=>{
        const booking=req.body;
        const result =  await bookingCollection.insertOne(booking);

        res.json(result);
    })
    // update booking
    app.put('/booking/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:ObjectId(id)};
      const doc=req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status:doc.status
        },
      };

      const result = await bookingCollection.updateOne(filter, updateDoc, options);
      console.log(result)
    })
    // getting booking data by mail
      app.post('/booking/byMail',async(req,res)=>{
        let email=req.body;
        const query={email:email.email};
        const cursor=bookingCollection.find(query);
        const booking=await cursor.toArray();
        res.json(booking)
      })

      //getting tour by id
      app.post('/tour/byKey', async(req,res)=>{
        const tourKeys=req.body;
        
        
        const query={key: {$in: tourKeys}}
        
        const tours= await tourCollection.find(query).toArray();
        res.json(tours)
       
      })


      // delete a tour
      app.delete('/booking/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result =await bookingCollection.deleteOne(query);
        res.json(result);
      })
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send('start the travel server')
})

app.listen(port,()=>{
    console.log('server running on',port)
})