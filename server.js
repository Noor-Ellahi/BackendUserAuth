
// Req: importing Libraries
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")


const connectMongoDb = require("./src/database/db")
const UserModal = require("./src/modal/user-modal/user-modal")
// Email sender
const cridentials = require("./src/cridential/cridential")


// Static variables:
const app = express()
const port = 1234;
let verificationCode = null;
let verifyEmail = null;
let expiresAt = null

// API Methods:
// 1. POST:
// 2. GET:
// 3. DELETE:
// 4. PUT:


// Note Mongo DataBase connection / configuration...!
connectMongoDb()

// Express malwares.....!
app.use(express.json());
app.use(morgan('dev'))
app.use(cors())

// Note : API route to get data ....!
// app.get(
//     "/user",
//     async (req, res) => {

//         // return res.send("Server running")
//         try {

//             const users = await UserModal.find(); 
//             console.log(users)

//             // 400:
//             // if (count < 1) {
//             //     return res.status(400).send({
//             //         status: false,
//             //         message: "No data found"
//             //     })

//             // }

//             // 200:
//             return res.status(200).send({
//                 status: true,
//                 message: "Data fetched successfully",
//                 data: users
//             });
//         }

//         catch (err) {
//             console.log("Err occurred :", err)
//         }
//     }
// )

// Note : API route to Get user by id :
app.post(
    "/user/userId",
    async (req, res) => {
        const { userId } = req.body


        const isUserExist = await UserModal.findById({ _id: userId })

        if (!isUserExist) {
            return res.status(400).send({
                status: true,
                message: "User not found"

            })
        }

        if (isUserExist) {
            return res.status(200).send({
                status: true,
                message: "User found",
                data: isUserExist
            })
        }
    }
)

// Note : API ROUTE TO CREATE AND SAVE User ....!

app.post(
    "/user/register",
    async (req, res) => {
        const {
            userName,
            userNum,
            userEmail,
            userPass
        } = req.body
        // console.log("User Info", JSON.stringify(req.body))


        try {
            // 400:
            if (!userName || !userNum || !userEmail || !userPass) {
                return res.status(400).send({
                    status: false,
                    message: "All fields are required"
                })
            }

            // 404:
            const isUserExist = await UserModal.findOne({ email: userEmail })

            if (isUserExist) {
                return res.status(404).send({
                    status: false,
                    message: "User Already exist"
                })
            }

            // Note : Encoding password :
            const encodePassword = btoa(userPass)

            // 200:
            const newUser = new UserModal({
                userName, // Done this cuz it gets it when u have username both in modal and obj destruct
                contactNum: userNum,
                email: userEmail,
                password: encodePassword
            })

            const saveUser = await newUser.save()

            if (saveUser) {
                return res.status(200).send({
                    status: true,
                    message: "User Saved successfully",
                    data: newUser
                })
            }
        }



        catch (err) {
            console.log("Something went wrong while connecting to DB", err)

            // 500:
            return res.status(500).send({
                status: false,
                message: "Something went wrong while connecting to DB"
            })
        }







    }
)

// Note : TO check Email and Password : ...!

app.post(
    "/user/login",
    async (req, res) => {

        const { userEmail, userPassword } = req.body


        try {
            // 400
            if (!userEmail || !userPassword) {
                return res.status(400).send({
                    status: false,
                    message: "Both email and password are required"
                })
            }

            // 401:
            const isUserExist = await UserModal.findOne({ email: userEmail })
            console.log("User :", isUserExist)

            if (!isUserExist) {
                return res.status(401).send({
                    status: false,
                    message: "User not Found"
                })
            }

            // 402:

            const userPassw = isUserExist.password
            const decodePassword = atob(userPassw)
            console.log("Decoded Pass :", decodePassword)

            if (userPassword != decodePassword) {
                return res.status(402).send({
                    status: false,
                    message: "Password Incorrect"
                })
            }

            // 200:
            return res.status(200).send({
                status: true,
                message: "You have Logged In successfully",
                data: isUserExist
            })

        }
        catch (err) {
            console.log("Something went wrong while logging in")

            // 500:
            return res.status(500).send({
                status: false,
                message: "Something went wrong while logging in"
            })
        }
    }
)



const sentEmailToUser = (email, code) => {
    // console.log("Email :" , email)

    let isMailSent = true

    // const encryptedId = btoa(uid)

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: cridentials.email,
            pass: cridentials.password
        }
    })

    const recieverDetails = {
        from: cridentials.email,
        to: email,
        subject: "Email Verification",
        text: `Verification Code ${code}`
        // text: `
        // Please click the link and Forget password: ${url}
        // User id : ${encryptedId}
        // `
    }

    transporter.sendMail(
        recieverDetails,
        (err, emailInfo) => {
            if (!err) {
                // console.log("Email send successfully" , emailInfo)

            }
            else {
                console.log("Something went wrong while sending Email ", err)
                isMailSent = false;
            }
        }
    )

    return isMailSent
}


// Note : API route to verify email and send code : .....!
app.post(
    "/user/verify",
    async (req, res) => {
        const { userEmail } = req.body
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        expiresAt = Date.now() + 5 * 60 * 1000;
        console.log("verify :", verificationCode)
        // console.log("User email is :" , userEmail)

        try {
            // 400:
            if (!userEmail) {
                return res.status(400).send({
                    status: false,
                    message: "Email is required"
                })
            }
            // 401:
            const isUserExist = await UserModal.findOne({ email: userEmail })

            if (!isUserExist) {
                return res.status(401).send({
                    status: false,
                    message: "User doesnot exist"
                })
            }

            // 200:

            // const redirectUrl = `http://localhost:1234/user/forgetPassword/portal`
            // const isEmailSent = sentEmailToUser(userEmail, redirectUrl, isUserExist._id)
            const isEmailSent = sentEmailToUser(userEmail, verificationCode)

            // console.log("User email Status :" , isEmailSent);

            if (isEmailSent) {
                verifyEmail = userEmail;
                return res.status(200).send({
                    status: true,
                    message: "Verification code send to your email"
                })
            }

        }
        catch (error) {
            console.log("Something went wrong while verifying the user", error)

            // 500:
            return res.status(500).send({
                status: false,
                message: "Something went wrong while verifying the user"
            })
        }
    }
)







// Note : API route to check Verification code...!
app.post(
    "/user/verify/code",
    (req, res) => {
        const { code } = req.body
        console.log("Verification Code : ", code)

        try {
            // 400
            if (!code) {
                return res.status(400).send({
                    status: false,
                    message: "Verification code Required"
                })
            }

            // 401:
            if (code != verificationCode) {
                return res.status(401).send({
                    status: false,
                    message: "Invalid Code"
                })
            }

            // 405:
            if (Date.now() > expiresAt) {
                return res.status(405).send({ status: false, message: 'Code expired' });
            }

            // 200:
            return res.status(200).send({
                status: true,
                message: "Code verified successfully"
            })
            verificationCode = null;

        }

        catch (err) {
            console.log("Something went wrong with Verification code")
            if (err) {
                return res.status(500).send({
                    status: false,
                    message: "Something went wrong with Verification code"
                })
            }
        }
    }
)


// Note : API route to update password ....!
app.put(
    "/user/update/password",
    async (req, res) => {
        const { newPassword } = req.body
        console.log("New password :", newPassword)

        try {
            // 400:
            if (!newPassword) {
                return res.status(400).send({
                    status: false,
                    message: "New password Required"
                })
            }

            const encodePassword = btoa(newPassword)

            const updatedUser = await UserModal.findOneAndUpdate(
                { email: verifyEmail },
                { password: encodePassword },
                { new: true }
            )

            // 200: 
            if (updatedUser) {
                return res.status(200).send({
                    status : true,
                    message : "Password changed successfully",
                    data : updatedUser
                })
            }

        }
        catch (err) {
            console.log("Something went wrong while updating password")

            if (err) {
                return res.status(500).send({
                    status: false,
                    message: "Something went wrong while updating password"
                })
            }
        }
    }
)









// server run:

app.listen(
    port,
    console.log(`Server running on port ${port}`)
)