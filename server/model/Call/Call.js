const mongoose = require("mongoose");

// Create schema
const CallSchema = mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  callMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  callDuration: { type: Number, default: 0 },  // seconds or milliseconds.
  callStates: {
    isOutGoingCall: { type: Boolean, default: false },
    isIncomingCall: { type: Boolean, default: false },
    isCallAccepted: { type: Boolean, default: false },
  },
}, { timestamps: true });

// Compile the call model
const Call = mongoose.model("Call", CallSchema);

module.exports = Call;
