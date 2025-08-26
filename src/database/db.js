// Note Mongo DataBase connection / configuration...!
const mongoose = require("mongoose")
require("dotenv").config();
const dataBaseName = "LearnMongo_Db"
const dbUrl = process.env.MONGO_URI


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