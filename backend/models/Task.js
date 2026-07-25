const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["todo", "in-progress", "completed"],
    default: "todo"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamRoom"
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);