const express = require('express');
const http = require('http');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var configs = require("../customer-dashboard/config.json");
const accountSid = configs.twilioSid;
const authToken = configs.twilioAuthToken;
const client = require('twilio')(accountSid, authToken);
const deep_cell = configs.deepCellNumber;
const whatsapp_num = configs.whatsappNumber;
const mongoUri = configs.mongoURI;

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    next();
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

// Routing
const dashboard = require('./routes/dashboard.js');
app.use('/', dashboard);

// Connect to mongoDB
mongoose.connect(mongoUri, {useNewUrlParser: true});

// Endpoint hit by IOT sensor to start flow
app.post('/startClaimFlow', (req, res) => {
    res.send('true');
    sendToWhatsapp("Our system has detected that your basement may be flooding, you may want to check. Please response \
    to this message with '1' if your basement is flooded or '0' if this is a false alarm.");
});


// Endpoint to get back all data from the given collection
// Body must include: collectionName
app.post('/api/getAllInfo', (req,res) =>{
    if(!req.body){
        return res.status(400).send({
            success:'false',
            message: 'body is missing'
        });
    }
    var collectionName = req.body.collectionName
    console.log(collectionName);
    var connection = mongoose.connection;
    connection.db.collection(collectionName, (err, collection) =>{ 
        if(err){
                console.log(err);
        }
            collection.find({}).toArray((err,data) => {
                if(err){
                    console.log(err);
                }
                console.log(data);
                return res.status(201).send({
                    data
                });
            })
        });

});

// Endpoint hit for all incoming messages
app.post('/sms', (req, res)=>{
    const message = req.body.Body;
    const numImg = req.body.NumMedia;
    console.log('Incoming message: ' + message);
    console.log('Number of images: ' + numImg);
    // If image was attached, insert into mongo
    if(numImg !== '0'){
        // URL of image
        const mediaUrl = req.body.MediaUrl0;
        console.log('MediaURL: ' + mediaUrl);
    }
    // TODO: DO SOMETHING WITH RESPONSE

    // Response
    const twiml = new MessagingResponse();
    twiml.message('Twilio has received your message');
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

// Start server on post 4201
http.createServer(app).listen(4201, () => {
    console.log('server listening on 4201');
});


// Function used to send message to deep_cell through whatsapp
function sendToWhatsapp(message){
    client.messages.create({
        to: "whatsapp:" + deep_cell,
        from: "whatsapp:" + whatsapp_num,
        body: message,
        //mediaUrl: "https://i.cbc.ca/1.3463873.1456419440!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_780/trufa-meme.jpg"
    }).then(message => {
        callback(null, message.sid);
    }).catch(err => callback(err));
}


// Mongo DB
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
  // we're connected!
  console.log('Connected');
});



//-------------------------------------------------------
// Given a collection name, return all documents NOT USED
function getAllInfo(collectionName){
    connection.once('open', ()=>{
        connection.db.collection(collectionName, (err, collection) =>{ 
            if(err){
                  console.log(err);
              }
              collection.find({}).toArray((err,data) => {
                  if(err){
                      console.log(err);
                  }
                  console.log(data);
                  return Promise.resolve(data);
              })
          });
    });
}

// Test
// getAllInfo('CustomerInformation', function(res){
//     console.log(res);
// });



