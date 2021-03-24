const Joi = require("joi");

//Campground JOI validator
module.exports.campgroundSchema = Joi.object({
   campground: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      img: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
   }).required(),
});

//Review JOI validator
module.exports.reviewSchema = Joi.object({
   review: Joi.object({
      rating: Joi.number().required().min(1).max(5),
      body: Joi.string().required(),
   }).required(),
});
