const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true },
  { collection: "conversations" }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
