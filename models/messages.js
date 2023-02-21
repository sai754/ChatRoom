const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  room: {
    type: String,
  },
  text: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now(),
  },
});

const Msg = mongoose.model('msg', msgSchema);

module.exports = Msg;
