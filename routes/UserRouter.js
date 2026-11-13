const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");

const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name").lean();
    const photos = await Photo.find({}, "user_id comments.user_id").lean();

    const result = users.map((u) => {
      const uId = u._id.toString();
      const photo_count = photos.filter((p) => p.user_id && p.user_id.toString() === uId).length;
      let comment_count = 0;
      photos.forEach((p) => {
        if (p.comments) {
          p.comments.forEach((c) => {
            if (c.user_id && c.user_id.toString() === uId) {
              comment_count += 1;
            }
          });
        }
      });
      return {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
        photo_count,
        comment_count,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).send("Error fetching user list");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid user ID format");
  }
  try {
    const user = await User.findById(id, "_id first_name last_name location description occupation").lean();
    if (!user) {
      return res.status(400).send("User not found");
    }
    res.json(user);
  } catch (err) {
    res.status(400).send("Error fetching user");
  }
});

module.exports = router;
