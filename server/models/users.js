const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../configuration/index.js');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
//        unique: true,
//        trim: true,
//        required: true
    },
    category: {
        type: String,
    },
    email: {
        type: String,
//        unique: true,
//        trim: true,
//        required: true,
//        lowercase: true
    },
    branch: {
        type: String,
//        minlength: 2,
//        trim: true,
//        required: true
    },
    rollno: {
        type: Number,
//        required: true,
//        minlength: 10,
//        unique: true,
//        trim: true,
//        required: true
    },
    password: {
        type: String,
//        required: true,
//        minlength: 6,
//        unique: true,
//        trim: true,
//        required: true
    },
    active: {
        type: Boolean
    },
    secretToken: {
        type: String
    },
    forgotPassSecret: {
        type: String
    }
});

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id','username','branch','rollno','email']);
}

//UserSchema.methods.generateAuthToken = (()=>{
//    var user = this;
//    return jwt.sign({
//        sub: user._id,
//        exp: new Date().setDate(new Date().getDate() + 12) // current Date + 12 days ahead
//    },JWT_SECRET);
//});

UserSchema.statics.findByUsername = function(username){
    var User = this;
    return new Promise((resolve, reject) => {

        User.findOne({username}).then((user)=>{
           if(user){
               return reject('User Exists');
           } 
           else{
               return resolve('User donot Exists');
           }
        });

    });
};

UserSchema.statics.findUserById = function(id){
    var User = this;
    return new Promise((resolve, reject) => {

        User.findOne({_id: id}).then((user)=>{
           if(user){
               return resolve(user);
           } 
           else{
               return reject('User do not Exists');
           }
        });

    });
};

UserSchema.statics.findByRollno = function(rollno){
    var User = this;
    return new Promise((resolve, reject) => {

        User.findOne({rollno}).then((user)=>{
           if(user){
               return reject('User Exists');
           } 
           else{
               return resolve('User donot Exists');
           }
        });

    });
};

UserSchema.statics.findByEmail = function(email){
    var User = this;
    return new Promise((resolve, reject) => {

        User.findOne({email}).then((user)=>{
           if(user){
               return reject('User Exists');
           } 
           else{
               return resolve('User donot Exists');
           }
        });

    });
};

UserSchema.statics.findByForgotEmail = function(email){
    var User = this;
    return new Promise((resolve, reject) => {

        User.findOne({email}).then((user)=>{
           if(user){
               return resolve(user);
           } 
           else{
               return reject('User donot Exists');
           }
        });

    });
};

UserSchema.methods.bcryptPass = function(password) {
    var user = this;
    
    return new Promise((resolve, reject) => {

        //Matching Hashed Password with Input Password
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                return resolve(user);
            } else {
                return reject('User does not Exist');
            }
        });

    });

};

// Called every time save methos is used..
UserSchema.pre('save', function(next) {

    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }

});

//Creating Mongoose Model
var Users = mongoose.model('Users', UserSchema);

//Exporting Users 
module.exports = {
    Users
};