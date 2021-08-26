const Room = require("../models/Room");
const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const ObjectID = require("mongodb").ObjectId;

// create new room
router.post("/", async (req, res) => {
  const existingRoom = await Room.find({
    name: req.body.name,
    creator: req.body.creator,
  });

  const newRoom = new Room({
    name: req.body.name,
    creator: req.body.creator,
    members: req.body.members || [],
    messages: req.body.messages || [],
  });

  try {
    if (existingRoom.length == 1) {
      res.status(403).json({ msg: `${req.body.name} Already found!` });
    } else {
      const savedRoom = await newRoom.save();
      res.status(200).json(savedRoom);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get all rooms
router.get("/all", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({ total: rooms.length, rooms });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get all rooms by a specific user
router.get("/member/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ msg: "User Not Found" });
    return;
  }
  try {
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
    res.status(200).json({ rooms: rooms });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get specific room id
router.get("/:id", async (req, res) => {
  try {
    const rooms = await Room.findById(req.params.id);
    if (rooms) {
      res.status(200).json(rooms);
    } else {
      res.status(404).json({ msg: "Room not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete room
router.delete("/:id", async (req, res) => {
  const existingRoom = await Room.find({
    creator: req.body.userId,
  });

  if (existingRoom.length > 0) {
    try {
      await Room.findByIdAndDelete(req.params.id);
      res.status(204).json("Room has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can't delete room you did not create!");
  }
});

// edit room name
router.put("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
    });
    if (room) {
      res.status(200).json({ msg: "name changed successfully" });
    } else {
      res.status(200).json({ msg: "Room Not Found" });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// save new room message
router.put("/sendmessage/:id/:userId/", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ msg: "User Not Found" });
    return;
  }

  const existingRoom = await Room.findById(req.params.id);
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
  if (rooms.length < 1) {
    res.status(404).json({ msg: "Not a member of room" });
    return;
  }

  try {
    if (existingRoom) {
      const result = await Room.findByIdAndUpdate(req.params.id, {
        $push: {
          messages: {
            sender: req.params.userId,
            msg: req.body.message,
            sentAt: Date.now(),
          },
        },
      });
      res.status(200).json({ msg: `Message Sent Successfully` });
    } else {
      res.status(404).json({ msg: "Room Not Found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// add user in room
router.put("/adduser/:id/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ msg: "User Not Found" });
    return;
  }

  const existingRoom = await Room.find({
    _id: ObjectID(req.params.id),
  });
  try {
    if (
      existingRoom.length == 1 &&
      existingRoom[0].members.includes(req.params.userId)
    ) {
      res.status(403).json({ msg: "Member already exist" });
    } else if (
      existingRoom.length == 1 &&
      existingRoom[0].creator !== req.params.userId &&
      !existingRoom[0].members.includes(req.params.userId)
    ) {
      const result = await Room.findByIdAndUpdate(req.params.id, {
        $push: { members: req.params.userId },
      });
      res.status(200).json({ msg: `User Added Successfully` });
    } else if (
      existingRoom.length == 1 &&
      existingRoom[0].creator === req.params.userId
    ) {
      res.status(403).json({ msg: "Can not add again Room Owner" });
    } else {
      res.status(404).json({ msg: "Room Not Found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// remove user from room
router.put("/removeuser/:id/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ msg: "User Not Found" });
    return;
  }

  const existingRoom = await Room.find({
    _id: ObjectID(req.params.id),
  });
  try {
    if (
      existingRoom.length == 1 &&
      existingRoom[0].creator !== req.params.userId
    ) {
      const result = await Room.findByIdAndUpdate(req.params.id, {
        $pull: { members: req.params.userId },
      });
      res.status(200).json({ msg: `User Removed Successfully` });
    } else if (
      existingRoom.length == 1 &&
      existingRoom[0].creator === req.params.userId
    ) {
      res.status(403).json({ msg: "Can not remove Room Owner" });
    } else {
      res.status(404).json({ msg: "Room Not Found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// search rooms by name
router.route("/search/").post((req, res, next) => {
  Room.find(
    {
      $and: [
        { name: { $regex: `^${req.body.search}`, $options: "i" } },
        {
          $or: [
            { creator: req.body.sender },
            {
              members: {
                $in: [req.body.sender],
              },
            },
          ],
        },
      ],
    },
    (err, data) => {
      if (err) {
        return next(err);
      } else {
        res.json(data);
      }
    }
  );
});
module.exports = router;
