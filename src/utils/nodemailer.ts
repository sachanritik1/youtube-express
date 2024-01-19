import nodemailer from "nodemailer"
import { Options } from "nodemailer/lib/mailer"
import { ENV } from "../constants"

const config = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
}

const sendMail = (data: Options) => {
    if (ENV === "dev") return console.log("Mail sent successfully")
    const transporter = nodemailer.createTransport(config)
    transporter.sendMail(data, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log(info.response)
            return info.response
        }
    })
}

export { sendMail }
