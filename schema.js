const joi = require("joi");

const userSchema = joi.object({
        username:joi.string().required(),
        email:joi.string().required(),
        password:joi.string().required(),
        role:joi.string().required(),
        semester:joi.string().required()
    })

module.exports = {userSchema};