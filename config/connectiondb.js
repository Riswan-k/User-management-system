const { MongoClient } = require("mongodb");

let database;

module.exports = {
    connect: ()=>{
        const url = "mongodb://localhost:27017";
        const Client = new MongoClient(url);
        database = Client.db("Project")
        console.log("database connected");
    },
    
    get: ()=>{
        return database;
    }
}