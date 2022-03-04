
import  nodemailer from  "nodemailer";



const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 80,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    }
});
class SendMail {
    static async sendEmail(toWhomSend:string, messageSubject:string, messageText:string, messageHtml:string)  {
        try {
            const info = await gmailTransporter.sendMail({
                from: 'Admin', 
                to: toWhomSend,
                subject: messageSubject,
                text: messageText, 
                html: messageHtml,
            });
            console.log(info)

        } catch(err) {
            console.log(err);
            throw err;
        }
    }
}
export {SendMail}