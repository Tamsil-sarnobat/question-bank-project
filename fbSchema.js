const Joi = require("joi");

module.exports.feedbackSchema = Joi.object({
  name: Joi.string().required(),
  semester: Joi.number().required().min(1).max(6),
  feedbackText: Joi.string().required(),
  rating: Joi.number().required().min(1).max(5),
  helpful: Joi.boolean().truthy("true", "yes").falsy("false", "no").required(),
});
