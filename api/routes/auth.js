const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

//REGISTER
router.post(
  "/register",
  [
    check("firstname", "Please Enter firstname").not().isEmpty(),
    check("lastname", "Please Enter lastname").not().isEmpty(),
    check("username", "Please Enter username").not().isEmpty(),
    check("email", "Please Enter email").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check(
      "password",
      "Please enter a valid password(with at least 6 characters)"
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    await User.findOne({ email: req.body.email }, async (err, data) => {
      if (!data) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = await new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
        });
        //save user and respond
        await newUser
          .save()
          .then(() => {
            const payload = {
              user: {
                id: newUser.id,
              },
            };

            jwt.sign(
              payload,
              "randomString",
              {
                expiresIn: 10000,
              },
              (err, token) => {
                if (err) throw err;
                res.status(200).json({
                  token,
                  msg: "User created successfully",
                });
              }
            );
          })
          .catch((err) => {
            res.status(500).json({ error: "something went wrong!!!" });
          });
      } else {
        res.status(400).json({ error: "user already exists!!!" });
      }
    });
  }
);

//LOGIN
router.post(
  "/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const user = await User.findOne({ email: req.body.email });
      !user && res.status(404).json("User not found");

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      !validPassword && res.status(404).json("wrong password");
      const { password, updatedAt, ...others } = user._doc;
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
            others,
          });
        }
      );
    } catch (err) {
      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

module.exports = router;
