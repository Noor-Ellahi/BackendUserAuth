// Note Mongo DataBase connection / configuration...!
const mongoose = require("mongoose")
const dataBaseName = "LearnMongo_Db"
const dbUrl = "mongodb+srv://Learn-MongoDb:MongoDb123@back-end-development.7dtygns.mongodb.net/?retryWrites=true&w=majority&appName=back-End-Development"


const connectMongoDb = async () =>{

    try {
        const isDbConnected = await mongoose.connect(
            dbUrl,
            {dbName : dataBaseName}
        );
    
        isDbConnected && console.log("Mongo DB connected successfully")
    } 
    catch (err) {
        console.log("Something went wrong while connecting to DB " , err)
    }

}


module.exports = connectMongoDb