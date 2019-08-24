const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended:false}));

// const accountSid = 'XXXXXXX';
// const authToken = 'XXXXXXXXX';

const client = require('twilio')(accountSid, authToken);
const deep_cell = '+16477873102';
const whatsapp_num = '+14155238886';

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


http.createServer(app).listen(1337, ()=> {
    console.log('Express server listening on port 1337');
});

//sendToWhatsapp('HELLO ANDY JIANG');
