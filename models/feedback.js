const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 6,
    },

    feedbackText: {
        type: String,
        required: true,
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;