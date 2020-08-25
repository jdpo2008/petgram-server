const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      default: "USER_ROLE",
    },
    petname: {
      type: String,
      required: true,
    },
    isEmailVerified: Boolean,
    profilePic: {
      type: String,
    },
    followers: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

userSchema.method("toJSON", function () {
  const { __v, _id, password, ...object } = this.toObject();
  object._id = _id;
  return object;
});

// hash user password before saving into database
userSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync();
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
