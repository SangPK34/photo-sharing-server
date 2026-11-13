const mongoose = require("mongoose");
require("dotenv").config();

const models = require("../modelData/models.js");
const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
    return;
  }

  await User.deleteMany({});
  await Photo.deleteMany({});
  await SchemaInfo.deleteMany({});

  const userModels = models.userListModel();
  const mapFakeId2RealId = {};

  for (const user of userModels) {
    const userObj = new User({
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
    try {
      await userObj.save();
      mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;
      console.log("Added user:", user.first_name, user.last_name, "with ID", user.objectID);
    } catch (error) {
      console.error("Error creating user", error);
    }
  }

  const photoModels = [];
  const userIDs = Object.keys(mapFakeId2RealId);
  userIDs.forEach((id) => {
    photoModels.push(...models.photoOfUserModel(id));
  });

  for (const photo of photoModels) {
    const photoObj = await Photo.create({
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: mapFakeId2RealId[photo.user_id],
    });
    photo.objectID = photoObj._id;

    if (photo.comments) {
      photo.comments.forEach((comment) => {
        photoObj.comments.push({
          comment: comment.comment,
          date_time: comment.date_time,
          user_id: comment.user.objectID,
        });
      });
    }

    try {
      await photoObj.save();
      console.log("Added photo:", photo.file_name, "for user", photoObj.user_id);
    } catch (error) {
      console.error("Error creating photo", error);
    }
  }

  try {
    const schemaInfo = await SchemaInfo.create({
      version: versionString,
    });
    console.log("SchemaInfo created with version", schemaInfo.version);
  } catch (error) {
    console.error("Error creating schemaInfo", error);
  }

  await mongoose.disconnect();
  console.log("Database loading completed.");
}

dbLoad();
