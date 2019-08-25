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
const justin_cell = configs.justinCellNumber;
const whatsapp_num = configs.whatsappNumber;
const mongoUri = configs.mongoURI;

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    next();
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

// Connect to mongoDB
mongoose.connect(mongoUri, {useNewUrlParser: true});

// Endpoint hit by IOT sensor to start flow
app.post('/startClaimFlow', (req, res) => {
    res.send('true');
    sendToWhatsapp("Our system has detected that your basement may be flooding, you may want to check. Please response \
    to this message with '1' if your basement has water damage or '0' if this is a false alarm.");
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

// assume only one user being processed at a time
let claimsState = 0; // add this to datastore later
let claimsObj;

// Endpoint hit for all incoming messages
app.post('/sms', (req, res) => {
    const message = req.body.Body;
    console.log('Incoming message: ' + message);

    if (claimsState >= 1) {
        getAllClaimsInformation(req);
    } else {
        // User indicated there is an issue
        if (message === '1') {
            claimsState = 1;
            /*
            * phoneNumber,
            * damageImage,
            * addressOfIncident,
            */
            claimsObj = {
                phoneNumber: req.body.From,
                damageImage: '',
                addressOfIncident: '40 St George St, Toronto, ON',
            };
            getAllClaimsInformation(req);
        }
    }
});

// Start server on post 4201
http.createServer(app).listen(4201, () => {
    console.log('server listening on 4201');
});


// Function used to send message to deep_cell through whatsapp
function sendToWhatsapp(message){
    client.messages.create({
        to: "whatsapp:" + justin_cell,
        from: "whatsapp:" + whatsapp_num,
        body: message,
        //mediaUrl: "https://i.cbc.ca/1.3463873.1456419440!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_780/trufa-meme.jpg"
    }).then(message => {
        callback(null, message.sid);
    }).catch(err => callback(err));
}

const uuid = require('uuid/v4');
function getAllClaimsInformation(req) {
    if (claimsState == 1) { // ask for damage image
        claimsState++;
        sendToWhatsapp('Could you please send a picture of the damages?');
    } else if (claimsState == 2) {
        if (req.body.NumMedia != '0') { // image sent
            claimsState++;
            claimsObj.damageImage = req.body.MediaUrl0;
            console.log('MediaURL: ' + claimsObj.damageImage);
            sendToWhatsapp(`Is ${claimsObj.addressOfIncident} the address of this incident? Please respond to this message with '1' if the correct address was listed, or the corrected address if it has changed`);
        } else { // image not sent
            sendToWhatsapp('Could you please send a picture of the damages?');
        }
    } else if (claimsState == 3) {
        claimsState = 0;
        if (req.body.Body == '1') {
            storeClaimsObj(claimsObj);
        } else {
            claimsObj.addressOfIncident = req.body.Body;
            storeClaimsObj(claimsObj);
        }
        console.log('WE MADE IT');
        sendToWhatsapp('Thank you, you can view the status of your claim at the following URL: http://localhost:4200/');
    }
}


// Mongo DB
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
  // we're connected!
  console.log('Connected');
});

function storeClaimsObj(claimsData) { // TODO store in collection
    console.log(claimsData);
    claimsObj = undefined;
}



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
