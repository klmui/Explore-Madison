var mongoose = require("mongoose");

// Schema setup
var eventSchema = new mongoose.Schema({
  name: String,
  image: {type: String, default: "https://via.placeholder.com/150"},
  description: String,
  location: String,
  startDate: Date,
  endDate: {type: String, default: startDate},
  numberPeopleInterested: {type: Number, default: 0},
  numberPeopleGoing: {type: Number, default: 0}
});

var Event = mongoose.model("Event", eventSchema);

module.exports = Event;
