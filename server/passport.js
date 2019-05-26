const localStrategy = require('passport-local').Strategy;

const {Users} = require('./models/users.js');

module.exports = function(passport){    
    passport.use(new localStrategy({
       usernameField: 'email',
       passwordField: 'password' 
    },function(email, password, done) {
        Users.findOne({email}).then((user)=>{
            if(!user){
               return done(null,false,{message: 'Unknown User'});
            }
        
            user.bcryptPass(password).then((user)=>{
                if(user){
                    
                    if(!user.active){
                        console.log(user.active);
                        return done(null,false,{message: 'You need to verify your email'});
                    }
                    
                    done(null,user);
                }
            }).catch((err)=>{
                return done(null,false,{message: 'Invalid Password'});
            });
        });
    }));

    passport.serializeUser(function(user, done) {
      done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
            Users.findUserById(id).then((user)=>{
                if(user){
                   done(null,user);
                }
            }).catch((err)=>{
                done('Unable to deserialize User',null);
            });
    });

};