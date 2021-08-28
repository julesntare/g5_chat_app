const router = require("express").Router();
const Message = require("../models/Message");

//add
router.post("/", async (req, res) => {
  try {
    const existingConvo = await Conversation.findById(req.body.conversationId);
    if (!existingConvo || !existingConvo.members.includes(req.body.sender)) {
      res
        .status(404)
        .json({ msg: "conversation not found or user not in participation" });
      return;
    }
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      isVisible: true,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get last message

router.get("/lastOne/:conversationId/", async (req, res) => {
  try {
    const lastMsg = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort({ _id: -1 })
      .limit(1);
    res.status(200).json(lastMsg);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete message

router.put("/deleteMsg", async (req, res) => {
  try {
    const delResult = await Message.findByIdAndUpdate(
      { _id: req.body.contextId },
      {
        isVisible: false,
      }
    );
    res.status(200).json(delResult);
  } catch (err) {
    res.status(500).json(err);
  }
});

// edit message
router.put("/:msgId", async (req, res) => {
  try {
    const result = await Message.findByIdAndUpdate(req.params.msgId, {
      text: req.body.message,
    });
    if (result) {
      res.status(200).json({ msg: "message modified successfully" });
    } else {
      res.status(404).json({ msg: "Message Not Found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get messages on specific date
router.get("/sentOn/:conversationId", async (req, res) => {
  try {
    const existingConvo = await Conversation.findById(
      req.params.conversationId
    );
    if (existingConvo) {
      const today = moment().startOf("day");
      const messages = await Message.find({
        conversationId: req.params.conversationId,
        createdAt: {
          $gte: today.toDate(),
          $lte: moment(today).endOf("day").toDate(),
        },
      });
      if (messages) {
        res.status(200).json({ messages });
      } else {
        res.status(404).json({ msg: "Message Not Found" });
      }
    } else {
      res.status(404).json({ msg: "Conversation not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
