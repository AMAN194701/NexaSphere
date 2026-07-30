const TeamRoom = require("../models/TeamRoom");

exports.createRoom = async (req, res) => {
  try {
    const room = await TeamRoom.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await TeamRoom.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};