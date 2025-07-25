const joi = require("joi");

const userSchema = joi.object({
        username:joi.string().required(),
        email:joi.string().required(),
        password:joi.string().required(),
        role:joi.string().required(),
        semester: joi.when("role", {
                  is: "student",
                  then: joi.string().required(),
                  otherwise: joi.string().optional().allow("")
                 })
    })


const feedbackSchema = joi.object({
  name: joi.string().optional(),
  feedbackText: joi.string().required(),
  rating: joi.number().required().min(1).max(5),
});

module.exports = {userSchema, feedbackSchema};