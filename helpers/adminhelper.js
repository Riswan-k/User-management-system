const { ObjectId } = require('mongodb');
const { response } = require('../app');
const db = require('../config/connectiondb');
const collection = require('../config/constants');
const objectId = require("mongodb").ObjectId
const bcrypt = require('bcrypt');


module.exports={

    search: (data)=>{
        return new Promise(async (resolve,reject)=>{
            const match = await db.get().collection(collection.USERCOLLECTION).find({email: data});
            if(match){
                resolve(match);
            }else{
                resolve(null);
            }
        });
        
    },

    delete: (data)=>{
        return new Promise(async (resolve,reject)=>{
            //console.log(new objectId(data));
            db.get().collection(collection.USERCOLLECTION).deleteOne({ _id: new objectId(data) }).then((response)=>{               
                    resolve(response);
                });
        });           
    },

    getuser: (userId)=>{
        return new Promise(async (resolve,reject)=>{
            //console.log(new objectId(userId));
            let data = await db.get().collection(collection.USERCOLLECTION).findOne({ _id: new objectId(userId)})
            //console.log(data);
            if(data){
                resolve(data);
            }else{
                reject(err);
            }
        });
    },

    updatedata: (data,userid)=>{
        return new Promise((resolve,reject)=>{
        db.get().collection(collection.USERCOLLECTION).updateOne({_id: new ObjectId(userid)},{$set: { firstname:data.firstname, lastname:data.lastname, email: data.email, gender: data.gender }}).then((response)=>{
            resolve(response);
        })
    })
    },

    createuser: async (userdata)=>{
        
        console.log(userdata);
        const passCrypt= await bcrypt.hash(userdata.password,10);

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USERCOLLECTION).insertOne({
                firstname: userdata.firstname,
                lastname: userdata.lastname, 
                email: userdata.email,
                gender:userdata.gender, 
                password: passCrypt})
                .then((data)=>{
                if(data){
                    resolve(true);
                }else{
                    reject(err);
                }
            });
        });        
    }   
}

 