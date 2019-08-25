const accountSid = 'ACdb49f8fe1df9e277ae501524340acb24';
const authToken = '395391fa5003d69dbbf8757ab5e11618';

const client = require('twilio')(accountSid, authToken);
const deep_cell = '+16477873102';
const whatsapp_num = '+14155238886';


function sendToWhatsapp(message){
    client.messages.create({
        to: "whatsapp:" + deep_cell,
        from: "whatsapp:" + whatsapp_num,
        body: message,
        mediaUrl: "https://i.cbc.ca/1.3463873.1456419440!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_780/trufa-meme.jpg"
    }).then(message => {
        callback(null, message.sid);
    }).catch(err => callback(err));
}

sendToWhatsapp('HELLO ANDY JIANG');