var express = require('express');
var router = express.Router();
const db = require('../config/connectiondb');
const collection = require('../config/constants');
const helpers = require('../helpers/userhelpers');
const bcrypt = require('bcrypt');


let incorectCredential;
let signup;

/* GET home page. */

router.get('/', async function(req, res, next) {

  if(req.session.user){
    let userData= req.session.user;  
    //console.log(userData);     
    const userValid = await helpers.checkusername(userData);
    
    if(userValid){
      res.render("index",{ title:"Bro-talk", user:true , firstName: userValid.firstname });
    }else{
      res.render("userlogin",{ title: "Bro-Talk" })
    }
  }else if(incorectCredential){
    if(incorectCredential==="Incorrect Password"){
      res.render("userlogin", {title: "Bro-Talk", incorrectCredentials: incorectCredential });
      incorectCredential=null;
    }else if(incorectCredential==="Invalid Email"){
      res.render("userlogin", {title: "Bro-Talk", incorrectCredentials: incorectCredential });
      incorectCredential=null;
    }
  }else if(signup){
    signup = false;
    res.render("userlogin",{ title: "Bro-Talk", signUpSuccesfull:true });
  }else{
    res.render("userlogin",{ title: "Bro-Talk" });
  }  

});



//Login page (get method)

router.get('/login', async(req,res)=>{  
    res.redirect("/");  
});


//Login Page (Post method)

router.post('/login',async (req,res)=>{

  let userData = req.body;
  let userMatch = await db.get().collection(collection.USERCOLLECTION).findOne({email: userData.email});

  if(userMatch){
    let status = await bcrypt.compare(userData.password,userMatch.password);
    if(status){
      req.session.LoggedIn = true;
      req.session.user = userMatch;
      res.redirect('/');
      //res.render("index",{ title:"Bro-talk", user:true , firstName: userMatch.firstname });
    }else{
     // res.render("userlogin", {title: "Bro-Talk", incorrectCredentials: "Incorrect Password" });
     incorectCredential = "Incorrect Password";
     res.redirect("/");
    }
  }else{
    incorectCredential = "Invalid Email";
     res.redirect("/");
   // res.render("userlogin", {title: "Bro-Talk", incorrectCredentials: "Invalid Email" });
  }

});

//signup page

router.get('/signup', (req,res)=>{
  if(req.session.user){
    res.redirect('/');
  }else{
    res.render('usersignup');
  }
})


//signup data to database(post method)

router.post('/signup',async (req,res)=>{

  const userdata = req.body;

  const validuser = await db.get().collection(collection.USERCOLLECTION).findOne({ email : userdata.email });
  console.log(validuser);

  if(validuser){
    res.render("usersignup",{wrongemail: true });

  }else{     
    const passCrypt = await bcrypt.hash(userdata.password,10);

    data={
      "firstname": userdata.firstname,
      "lastname": userdata.lastname,
      "email": userdata.email,
      "gender": userdata.gender,
      "password": passCrypt
    };

    db.get().collection(collection.USERCOLLECTION).insertOne(data).then((data)=>{
    //res.render("userlogin",{ signUpSuccesfull:true });
    signup=true;
    res.redirect("/");
    });
  }

});


//Logout page

router.post("/logout",(req,res)=>{

  req.session.LoggedIn = false;
  req.session.user = false;
  // req.sessionStore.destroy(userDetails, (err)=>{
  //   if(err){
  //     console.log("error");
  //   }else{
  //     console.log("session destroyed");
  //   }
  // })
  res.render("userlogin",{title: "Bro-Talk" , logout: true });
});


module.exports = router;


