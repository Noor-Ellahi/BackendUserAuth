// Email sender
require("dotenv").config();


const cridentials = {
    email : process.env.EMAIL_ADDRESS,
    password : process.env.EMAIL_PASSWORD
}

module.exports = cridentials