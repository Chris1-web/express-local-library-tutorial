const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});

// virtual for genre's URL
GenreSchema.virtual("url").get(function () {
  return $`/catalog/genre/${this._id}`;
});

// export module
module.exports = mongoose.model("Genre", GenreSchema);
