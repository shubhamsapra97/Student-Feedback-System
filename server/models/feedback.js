const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var FeedbackSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        minlength: 2,
        trim: true
    },
    rollno: {
        type: Number,
        required: true,
        minlength: 10,
        trim: true
    },
    feedbacktype : {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    email: {
        type: String,
        required: true,
        minlength: 10,
        trim: true
    },
    feedback: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        required: true
    }
});

FeedbackSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id','username','branch','rollno','feedbacktype','email','feedback','read']);
}

FeedbackSchema.statics.fetchFeedbacks = function(){
    var Feedback = this;
    return Feedback.find({}).sort({
        _id: -1
    }).then((feedbacks)=>{
        
           if(feedbacks){
               console.log("Feedbacks Found");
               return Promise.resolve(feedbacks);
           }       
           else{
               console.log("Feedbacks Not Found");
               return Promise.reject(err);
           }
    });
}

//Creating Mongoose Model
var Feedback = mongoose.model('Feedback', FeedbackSchema);

//Exporting Users 
module.exports = {
    Feedback
};