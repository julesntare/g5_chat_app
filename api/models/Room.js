const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: {
      type: Array,
      default: [],
    },
    creator: {
      type: String,
      required: true,
    },
    messages: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
  { collection: "rooms" }
);

module.exports = mongoose.model("Room", RoomSchema);
