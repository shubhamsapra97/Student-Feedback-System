const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: "shubhamsapra@sandboxfe6971d73458438db6dc93df1d672272.mailgun.org",
        pass: 'Shubham@25'
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
