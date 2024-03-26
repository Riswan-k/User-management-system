const db = require('../config/connectiondb');
const collection = require('../config/constants');
const bcrypt = require('bcrypt');


module.exports={
    checkusername: (data)=>{
        return new Promise(async (resolve,reject)=>{
            const userdata = await db.get().collection(collection.USERCOLLECTION).findOne({email: data.email})
            
            if(userdata){
                resolve( uservalid = userdata );
            }else{
                resolve( uservalid = false );
            }
        })
    },


}