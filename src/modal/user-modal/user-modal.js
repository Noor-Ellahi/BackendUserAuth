// User Modal :
const mongoose = require("mongoose")



const userSchema = new mongoose.Schema(
    {
        userName: String,
        contactNum : String,
        email : String,
        password : String,
        createdAt : {
            type : Date,
            default : Date.now()
        }
    }
    ,
    {
        collection: "users"
    }
);


const UserModal = mongoose.model("users", userSchema)


module.exports = UserModal;