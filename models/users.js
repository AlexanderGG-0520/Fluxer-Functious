const { Schema, model } = require("mongoose");

const reminderSchema = new Schema({
  id: { type: String, required: true },
  timestamp: { type: Number, required: true },
  message: { type: String, required: true },
  channelId: { type: String },
  createdAt: { type: Number, required: true },
  type: { type: String, enum: ["guild", "dm"], required: true },
});

const userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  timezone: { type: String, default: null },
  reminders: { type: [reminderSchema], default: [] },
});

module.exports = model("users", userSchema);
