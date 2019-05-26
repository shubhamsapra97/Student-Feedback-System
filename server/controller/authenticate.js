//const Joi = require('joi');
//
//module.exports = {
//    validateBody: (schema)=>{
//        return (req,res,next)=>{
//            const result = Joi.validate(req.body,schema);
//            if(result.error){
//                res.locals.error = result.error;
//            }
//            next();
//        }
//    },
//    schemas: {
//        authSchema: Joi.object().keys({
//            username: Joi.string().alphanum().min(6).max(30).required(),
//            password: Joi.string().min(6).required(),
//            email: Joi.string().email().required(),
//            rollno: Joi.string().required(),
//            branch: Joi.string().required()
//        })
//    }
//}

module.exports = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('login1');
    }
}