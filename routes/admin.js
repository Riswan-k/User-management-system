var express = require('express');
var router = express.Router();
const db = require("../config/connectiondb");
const collection = require("../config/constants");
const helper = require("../helpers/adminhelper");
const { response } = require('../app');
const bcrypt = require('bcrypt');
const objectId = require("mongodb").ObjectId




let createuser = false;

router.get('/', function(req, res, next) {
  if(req.session.adminuser){
    res.redirect('/admin/dashboard');
  }else{
    res.render("adminlogin",{ title: 'Bro-Talk Admin'});
  }

});

/* GET users listing. */
// dashboard

router.get('/dashboard',async (req,res)=>{
  if(req.session.adminuser){
    const userdata = await db.get().collection(collection.USERCOLLECTION).find().sort({firstname:1}).toArray();
    if(createuser){
      createuser=false;
      res.render('admindashboard',{ title:"Bro-Talk Admin", admin:true, userdata:userdata, create: "Created an user account Succesfully" });
    }else{    
    res.render('admindashboard',{ title:"Bro-Talk Admin", admin:true, userdata:userdata});
    }
  }else{
    res.redirect('/admin');
  }
  
});

//Login validation

router.post('/login', async (req,res)=>{
  
  const validAdmin = await db.get().collection(collection.ADCOLLECTION).find({email : req.body.email, password: req.body.password});

  if(validAdmin){
    req.session.adminLoggedIn = true;   
    req.session.adminuser=req.body;
    res.redirect("/admin/dashboard");
  }else{
    res.render("adminlogin",{ title: "Bro-Talk Admin", incorrectCredentials:true });
  }  

});

router.get('/login', (req,res)=>{
  if(req.session.adminuser){
    res.redirect('/admin/dashboard');
  }else{
    res.redirect('/admin');
  }
});

//Delete User

router.get('/delete-user/:id',async (req,res)=>{

  if(req.session.adminLoggedIn){
    let userId = new objectId(req.params.id);

    const userDetails = await db.get().collection(collection.USERCOLLECTION).findOne({"_id":userId})
    //console.log(userDetails);
    //console.log(req.session.user);

    helper.delete(req.params.id).then((response)=>{
    res.redirect('/admin/dashboard');
    });
  }else{
    res.redirect('/admin');
  }
  
});

//Edit User

router.post('/edit-user/:id',async (req,res)=>{

  let editedData = req.body;
  let userid = req.params.id;  
  let userdata = await helper.getuser(userid)
  if(editedData.email == userdata.email){
    helper.updatedata(editedData,userid).then((response)=>{      
      res.redirect("/admin/dashboard");
    });
  }else{
    const emailExist = await db.get().collection(collection.USERCOLLECTION).findOne({email: editedData.email});
      if(emailExist){
        Data = { _id: userid, ...editedData}
        res.render('editform',{ title:"Bro-Talk Admin", admin:true, wrongemail:true, userdata:Data});
      }else{  
        helper.updatedata(editedData,userid).then((response)=>{
          console.log(response);
          res.redirect("/admin/dashboard");
        });
      }
  }
});

router.get('/edit-user/:id',async (req,res)=>{
  if(req.session.adminLoggedIn){    
    let userId = req.params.id;
    let userdetails = await helper.getuser(userId);
    res.render('editform',{ title:"Bro-Talk Admin", admin: true, userdata: userdetails });
  }else{
    res.redirect('/admin');
  }  
});


//create user

router.get('/create-user',(req,res)=>{
  if(req.session.adminuser){
    res.render('createform',{ title: "Bro-Talk Admin" })
  }
});


router.post('/create-user',async (req,res)=>{
  let userdata= req.body;
  let emailcheck = await db.get().collection(collection.USERCOLLECTION).findOne({email: userdata.email});
  if(emailcheck){
    res.render("createform",{title: "Bro-Talk Admin", admin: true, wrongemail:true, data:userdata });
  }else{
    helper.createuser(userdata).then((response)=>{
      
      if(response){
        createuser = true;
        res.redirect('/admin/dashboard');
      }else{
        res.render('error');
      }
    });
  }
});


//logout 

router.post('/logout', (req,res)=>{
  req.session.adminLoggedIn = false;
  req.session.adminuser = false;
  res.render( "adminlogin", { title:"Bro-Talk Admin", logout:true });
})


module.exports = router;
