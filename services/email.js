const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { 
        user: process.env.SEND_MAIL_FROM, 
        pass: process.env.MAIL_PASSWORD
    } 
});

exports.sendAnEmail = (receiver, subject, msg)=>{
    transporter.sendMail({
        from: process.env.SEND_MAIL_FROM,
        to: receiver,
        subject: subject,
        html: msg
    }, (err, info) => {
        // console.log(info);
        if(!err){
            console.log("Mail sent successfully");
        }
    });
}