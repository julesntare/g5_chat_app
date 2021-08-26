const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//new conv

router.post("/", async (req, res) => {
  const existingConvo = await Conversation.find({ members: { $all: [req.body.senderId, req.body.receiverId] } });

  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    if (existingConvo.length == 1) {
      res.status(200).json(existingConvo);
    } else {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get total msg of convo

router.post("/totalMsgsConvo", async (req, res) => {
  try {
    let convoData = await Conversation.findById(req.body.convoId);
    const convoMsgs = await Message.find({ conversationId: req.body.convoId });
    convoData = { ...convoData._doc, length: convoMsgs.length };
    res.status(200).json(convoData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
