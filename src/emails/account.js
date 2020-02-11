const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

// const msg = {
//     to: 'huzainimhd@gmail.com',
//     from: 'zen96ev@gmail.com',
//     subject: 'Sending with Twilio SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }

// sgMail.send(msg);

const welcomeEmail = (mail, name) => {
    const message = {
        to: mail,
        from: 'huzainimhd@gmail.com',
        subject: 'Welcome to Task App',
        text: `Hi ${name}, Thank you so much for joining us today!`
    }
    sgMail.send(message)
}


const goodbyeEmail = (mail, name) => {
    sgMail.send({
        to: mail,
        from: 'huzainimhd@gmail.com',
        subject: 'We are sad you leave..',
        text: `Hi ${name}, We are really sad that you leave Task App.. Could you provide us with mail why you exit?`
    })
}

module.exports = {
    welcomeEmail, goodbyeEmail
}