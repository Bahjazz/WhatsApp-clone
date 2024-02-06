// importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1685663",
  key: "33195423b27c4be261cb",
  secret: "5aa7d4a52f789bd1f408",
  cluster: "eu",
  useTLS: true,
});

// middleware
app.use(express.json());
app.use(cors());
/*
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    next()

})
*/
// DB config
const connrction_url =
  "mongodb+srv://Admin:CEN1p2gIaytMLOFN@cluster0.vfw0jmo.mongodb.net/";
mongoose.connect(connrction_url),
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

const db = mongoose.connection;
db.once("open", () => {
  console.log("Db is connected");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      console.log("messageDetails:", messageDetails);
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

// api routes
app.get("/messages/sync", (req, res) => {
  Messages.find()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// listen

app.listen(port, () => console.log(`listening on localhost:${port}`));
