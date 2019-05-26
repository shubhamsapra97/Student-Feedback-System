const mongoose = require('mongoose');
const _ = require('lodash');

var countFeedbackSchema = new mongoose.Schema({
    typo: {
        type: String,
        required: true,
        trim: true,
    },
    county: {
        type: Number,
        required: true,
        default: 0
    }
});

countFeedbackSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id','typo','county']);
}

countFeedbackSchema.statics.findByType = function(type){

       countFeedback.findOne({
           typo: type
       }).then((docs)=>{
           if (docs) {
               countFeedback.updateOne({
                   typo: type,
                   county: docs.county + 1
               }).then((docs) => {
                   console.log("count feedback updated");
               });
           } else {
                countFb = new countFeedback({
                    typo: type,
                    county: 1
                });  
               countFb.save().then(() => {
                   console.log("count feedback saved");
               })
                
           }
       });
    
}

//Creating Mongoose Model
var countFeedback = mongoose.model('countFeedback', countFeedbackSchema);

//Exporting Users 
module.exports = {
    countFeedback
};