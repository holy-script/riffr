import mongoose from "mongoose";

const montageSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	shortName: {
		type: String,
		required: true,
		trim: true,
		minLength: 1,
		maxLength: 20,
	},
	userId: {
		type: String,
		required: true,
		trim: true,
		minLength: 3,
		maxLength: 254,
	},
	link: {
		type: String,
		required: true,
		trim: true,
	},
	ext: {
		type: String,
		required: true,
		trim: true,
	},
	createdAt: {
		type: Number,
		required: true,
	},
	imageCount: {
		type: Number,
		required: true,
	},
});

export default mongoose.model("Montage", montageSchema);
