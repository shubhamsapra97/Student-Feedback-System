const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: "MAILGUN_USERNAME",
        pass: 'MAILGUN_PASSWORD'
    },
    secure: false,
    port: 25,
    tls: {
        rejectUnauthorized: false
    }
});

module.exports= {
    sendEmail(from,to,subject,html){
        return new Promise((resolve,reject)=>{
            transport.sendMail({from,subject,to,html},(err,info)=>{
                if(err){
                    reject(err);
                }
                resolve(info);
            });
        });
    }
}