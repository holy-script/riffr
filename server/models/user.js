import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: false,
		trim: true,
		minLength: 1,
		maxLength: 20,
		default: "User",
	},
	email: {
		type: String,
		required: true,
		trim: true,
		minLength: 3,
		maxLength: 254,
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 60,
		maxLength: 60,
	},
	verified: {
		type: Boolean,
		required: false,
		default: false,
	},
	onboarded: {
		type: Boolean,
		required: false,
		default: false,
	},
	otp: {
		type: Number,
		required: true,
		minLength: 6,
		maxLength: 6,
		default: 999999,
	},
	age: {
		type: Number,
		required: false,
		default: 0,
		minLength: 1,
		maxLength: 200,
	},
	profile: {
		type: Object,
		required: false,
		default: {},
	},
	montages: {
		type: Array,
		required: false,
		default: [],
	},
});

export default mongoose.model("User", userSchema);
