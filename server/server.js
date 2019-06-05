const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');
const http = require('http');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const randomString = require('randomstring');
const expressValidator = require('express-validator');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const ensureAuth = require('./controller/authenticate.js');
const mailer = require('./controller/mailer.js');

const passport = require('passport');
const passportConf = require('./passport.js');

var {Users} = require('./models/users.js');
var {Feedback} = require('./models/feedback.js');
var {countFeedback} = require('./models/countFeedback.js');

mongoose.Promise = global.Promise;
var uri = '*****'; 
mongoose.connect(uri,   
    { useNewUrlParser: true },
    function(error) {
        console.log(`ERRORS in connecting to DB: ${error}`);
    }
);

const port = process.env.PORT || 5000;
var app = express();
var server = http.createServer(app);

const publicPath = path.join(__dirname,'../public');
app.use(express.static(publicPath));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('views',path.join(__dirname,'../views'));
app.engine('handlebars',exphbs({defaultLayout: 'main'}));
app.set('view engine','handlebars');

//Session Config
var sessionMiddleware = session({
    secret: "1234",
    resave:false,
    saveUninitialized: false,
    cookie:{
        maxAge: 100000000000000
    }
});

//Session Middleware
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/register',(req,res)=>{
   res.render('register'); 
});

app.get('/login1',(req,res)=>{
   res.render('login');
});

app.get('/feedback',ensureAuth,(req,res)=>{
    res.render('feedback',req.user); 
});

app.get('/forgotPassword',(req,res)=>{
   res.render('forgotPass'); 
});

app.get('/changePassEmail',(req,res)=>{
   res.render('changePass'); 
});

app.get('/adminFeedback',ensureAuth,(req,res)=>{
   res.render('feedbackLog',{
       comments: req.session.comments,
       countInfo: req.session.count
   });
    
   Feedback.updateMany(
   {
       read: true
   }, 
   {
       read: false
   },
   ((err,docs)=>{
       if(err){
           console.log('New Feedbacks not read.');
       }
       console.log('New Feedbacks read');
   }));
});

app.post('/preUserRegister',[
  
    check('password', 'passwords must be at least 5 chars long and contain one number')
      .isLength({ min: 5 }).withMessage('Min length for Password is 5'),
    
    check('email')
      .isEmail().withMessage('must be an email')
      .custom(value => {
          return Users.findByEmail(value).catch((err)=>{
                throw new Error('this email is already in use');
          });
    })    
  ],(req,res)=>{
    var body = _.pick(req.body,['password','email']);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register',{ 
            errors: errors.mapped() 
        });
    }
    else{
    
        var user = new Users(body);
        var secrettoken = randomString.generate();
        user.secretToken = secrettoken;
        user.category = 'student';
        user.active = false;
        
        user.save();
        
        const link = "http://localhost:5000/verify/"+secrettoken;
        
        const html = `Hi there,
        <br/><br/>
        Thank you for registering!<br/>
        <br/>
        We stongly want your account verification to be successfull so, here are some
        <br><br/>
        <h4>Tips!</h4>
        <ul>
            <li><b>Username</b> should have a min length of 5 characters</li>
            <li><b>Branch</b> should have a min length of 3 characters</li>
            <li><b>Roll No</b> should be of 10 digits.</li>
        </ul>
        Click on this One time Activation link to verify your account <a href=${link}>iFeed</a>
        <br><br/>
        Have a pleasant day!`;
            
        mailer.sendEmail('admin@iFeed.com',user.email,'Please verify your email!',html);
        req.flash('success_msg','We sent you an verification email. Please do verify your account!');
        
        res.redirect('/register');
    }
});

app.post('/postUserRegister',[
    
    check('username')
    .isLength({ min: 5 }).withMessage('Min length for Username is 5')
    .exists()
    .isString().withMessage('Username must be a String')
    .custom(value => {
      return Users.findByUsername(value).catch((err)=>{
          throw new Error('this username is already in use');
      });
    }),
    
    check('branch')
      .isLength({min: 3}).withMessage('Min length for branch is 3')
      .exists()
      .isString().withMessage('Branch must be a String'),
    
    check('rollno')
      .isInt().withMessage('RollNo must be an Integer')
      .isLength({min: 10}).withMessage('RollNo must be 10 digits long')
      .custom(value => {
        return Users.findByRollno(value).catch((err)=>{
                throw new Error('An Account is already linked with this Rollno');
        });
    }),
    
],(req,res)=>{
    var body = _.pick(req.body,['username','branch','rollno','email']);
    
    Users.findOne({
        email: body.email
    }).then((user)=>{
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            
            Users.remove({
                email: body.email
            }).then((err,user)=>{
                if(err){
                    console.log("Error deleting User");
                }
                console.log("User Successfully deleted"); 
            });
            
            res.render('register',{ 
                errors: errors.mapped() 
            });
        }
        else{
            user.username = body.username;
            user.branch = body.branch;
            user.rollno = body.rollno;
            user.save().then((user)=>{
                console.log("Profile successfully Updated");
                req.flash('success_msg','We have set up your account. Please login');
                res.redirect('/login1');
            });
        }        
        
    });
    
});

passportConf(passport);

app.post('/login',
  passport.authenticate('local',{
    failureRedirect: '/login1',
    failureFlash: true    
  }),(req,res)=>{
    
    if(req.body.radio === 'student'){
        
        if(req.user.category == 'admin'){
            req.flash('error','Login with a student email');
            res.redirect('/login1');
            return;
        }
        
        res.redirect('/feedback');
    }
    else if(req.body.radio === 'admin'){ 
        
        if(req.user.category == 'student'){
            req.flash('error','Login with an admin email');
            res.redirect('/login1');
            return;
        }
        
        Feedback.fetchFeedbacks().then((comments)=>{
            req.session.comments = comments;
            countFeedback.find({}).then((docs)=>{
               req.session.count = docs;
               res.redirect('/adminFeedback');
            });
        }).catch((err)=>{
            console.log(err);
        });
    }
});

app.post('/verifyForgotEmail',[
    
    check('email')
      .isEmail().withMessage('must be an email')
      .custom(value => {
          return Users.findByForgotEmail(value).catch((err)=>{
              if(err){
                throw new Error('No account linked with this email');
              }
          });
    }) 
    
],(req,res)=>{
    
    var body = _.pick(req.body,['email']);
        
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('forgotPass',{ 
            errors: errors.mapped() 
        });
    }
    else{
        
        var secrettoken = randomString.generate();
        
        Users.findOne({
            email: body.email
        }).then((user)=>{
            user.forgotPassSecret = secrettoken;
            user.save();
            
            const link = "http://localhost:5000/forgotPassword/"+secrettoken;
        
            const html = `Hi there,
            <br/><br/>
            Click on this link to change your Password <a href=${link}>iFeed</a>
            <br><br/>
            Have a pleasant day!`;

            mailer.sendEmail('admin@iFeed.com',user.email,'Change your iFeed Password!',html);
            req.flash('success_msg','We have sent you a change password link on your mail.');

            res.redirect('/forgotPassword');
            
        });
        
    }
    
});

app.post('/feedback',ensureAuth,(req,res)=>{
   var body = _.pick(req.body,['email','username','rollno','branch','feedbacktype','feedback']);
   var feedback = new Feedback(body);
   feedback.read = true;
   feedback.save().then((feedback)=>{
       res.render('feedback',body);
   }).catch((e)=>{
        console.log(e);
        res.render('feedback');
   });
    
   // Increase the count of specific feedbackType by 1.
   countFeedback.findByType(body.feedbacktype);
    
});

app.get('/verify/:secretToken',(req,res)=>{
    Users.findOne({
        secretToken: req.params.secretToken
    }).then((user)=>{
        
       if(!user){
           req.flash('error','Verification Failed');
           res.redirect('/register');
           return;
       }
        
       user.active = true;
       user.secretToken = '';
       user.save().then((user)=>{
           res.render('profile',user);
       });
        
       
    });
});

app.get('/forgotPassword/:secretToken',(req,res)=>{
    Users.findOne({
       forgotPassSecret: req.params.secretToken
    }).then((user)=>{
        
        if(!user){
           req.flash('error','Process Failed');
           res.redirect('/login1');
           return;
       }
       res.render('changePass',user);
        
    });
});

app.post('/changePassword',(req,res)=>{
    var body = _.pick(req.body,['email','newPassword','confirmPassword']);
    
    if(body.newPassword === body.confirmPassword){
    
        Users.findByForgotEmail(body.email).then((user)=>{
            
            user.password = body.confirmPassword;
            user.forgotPassSecret = '';
            user.save();
            req.flash('success_msg','Password Changed Successfully');
            res.redirect('/login1');
            
        });
    
    }
    
});

app.get('/comments/:type',(req,res)=>{
    
    if(req.params.type === 'All Feedback'){
        Feedback.find({}).sort({
            _id: -1
        }).then((comments)=>{
            req.session.comments = comments;
            res.redirect('/adminFeedback');
        }); 
    }
    else{
        Feedback.find({
            feedbacktype: req.params.type,
        }).sort({
            _id: -1
        }).then((comments)=>{
            req.session.comments = comments;
            res.redirect('/adminFeedback');
        }); 
    }
    
});

app.post('/logOut',(req,res)=>{
    req.logout();
    
    req.flash('success_msg','You are logged out!');
    
    res.redirect('/');
});

server.listen(port,()=>{
   console.log(`Server is up on port ${port}`); 
});

