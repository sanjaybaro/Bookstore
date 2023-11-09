const mongoose = require("mongoose");
const bookSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Author: { type: String, required: true },
  ISBN: { type: Number, required: true },
  Description: { type: String, required: true },
  PublishedDate: { type: String, required: true },
});

const BookModel = mongoose.model("Book", bookSchema);

module.exports = { BookModel };
