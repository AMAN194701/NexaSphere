const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamRoom"
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  text: String
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);