const router = require("express").Router();
const Message = require("../models/Message");

//add

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
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

module.exports = router;
