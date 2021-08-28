const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//new conv

router.post("/", async (req, res) => {
  try {
    if (req.body.senderId === req.body.receiverId) {
      res.status(403).json({ msg: "Can't add same user in one convo" });
      return;
    }
    const senderId = await User.findById(req.body.senderId);
    const receiverId = await User.findById(req.body.receiverId);
    if (!senderId || !receiverId) {
      res.status(403).json({ msg: "One or both Users not found" });
      return;
    }
    const existingConvo = await Conversation.find({
      members: { $all: [req.body.senderId, req.body.receiverId] },
    });

    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    try {
      if (existingConvo.length == 1) {
        res.status(403).json({ msg: "Conversation already exists" });
      } else {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } catch (err) {
    res.status(500).json({ msg: "bad formatted id" });
  }
});

//get conv of a user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    const rooms = await Room.find({
      $or: [
        { creator: req.params.userId },
        {
          members: {
            $in: [req.params.userId],
          },
        },
      ],
    });
    res.status(200).json({ privateConvo: conversation, rooms: rooms });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get total msg of convo
router.get("/totalMsgsConvo/:convoId", async (req, res) => {
  try {
    let convoData = await Conversation.findById(req.params.convoId);
    const convoMsgs = await Message.find({
      conversationId: req.params.convoId,
    });
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
