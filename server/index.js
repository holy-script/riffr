import express from "express";
import cors from "cors";
import history from "connect-history-api-fallback";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import User from "./models/user.js";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { jwtAuth } from "./middleware/jwtAuth.js";
import fileUpload from "express-fileupload";
import path from "path";
import url from "url";
import fs from "fs/promises";
import "@tensorflow/tfjs-node";
import canvas from "canvas";
import faceapi from "@vladmandic/face-api";
import { Storage } from "@google-cloud/storage";

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, "model"));

dotenv.config();

const app = express();
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
	username: "api",
	key: process.env.MAILGUN_API_KEY,
});
const secret = process.env.JWT_SECRET;
const storage = new Storage({
	keyFilename: path.join(__dirname, process.env.KEY_FILE),
	projectId: process.env.PROJECT_ID,
});
const bucketName = process.env.BUCKET_NAME;
await storage.bucket(bucketName).setCorsConfiguration([
	{
		maxAgeSeconds: 3600,
		method: ["PUT"],
		origin: ["http://localhost:9000"],
		responseHeader: ["content-type"],
	},
]);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	cors({
		origin: ["http://localhost:9000"],
		optionsSuccessStatus: 200,
		credentials: true,
	})
);
app.use((req, res, next) => {
	res.header(
		"Access-Control-Allow-Headers",
		"x-access-token, Origin, Content-Type, Accept"
	);
	next();
});
app.use(history());
app.use(cookieParser());
app.use(
	fileUpload({
		useTempFiles: true,
	})
);

mongoose.connect(process.env.MONGODB_CONNECTION_URI, {
	ssl: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	maxPoolSize: 100,
});

app.post("/auth/signup", async (req, res) => {
	const preRegistered = await User.findOne({
		email: req.body.email,
	});
	if (preRegistered) {
		res.status(409).send({
			message: "User already exists, please Log In!",
		});
	} else {
		const rand = Math.floor(100000 + Math.random() * 900000);
		const msg = {
			from: `Riffr Mail <no-reply@${process.env.DOMAIN}>`,
			to: [req.body.email],
			subject: "Account Verification 👋",
			text: `Welcome to the Riffr community! Please enter this code to verify your account - ${rand}`,
		};
		try {
			await mg.messages.create(process.env.DOMAIN, msg);
			try {
				await User.create({
					email: req.body.email,
					password: bcrypt.hashSync(req.body.password, 8),
					otp: rand,
				});
				res.status(200).send({
					message: "User was registered successfully!",
				});
			} catch (err) {
				res.status(500).send({ message: err.message });
			}
		} catch (err) {
			res.status(500).send({ message: `Email Error: ${err.message}` });
		}
	}
});

app.post("/auth/login", async (req, res) => {
	const userProfile = await User.findOne({
		email: req.body.email,
	});
	if (!userProfile) {
		res.status(404).send({
			message: "User does not exist, please Sign Up!",
		});
	} else {
		const passwordIsValid = bcrypt.compareSync(
			req.body.password,
			userProfile.password
		);

		passwordIsValid
			? res
					.status(200)
					.cookie(
						"accessToken",
						jwt.sign({ email: userProfile.email }, secret, {
							expiresIn: 86400, // 24 hours
						}),
						{
							httpOnly: true,
							maxAge: 86400 * 1000,
						}
					)
					.send({
						email: userProfile.email,
						message: "Successfully Logged in for 24 hours!",
						verified: userProfile.verified,
						onboarded: userProfile.onboarded,
					})
			: res.status(401).send({
					message: "Invalid Password!",
			  });
	}
});

app.post("/auth/logout", async (req, res) => {
	res.clearCookie("accessToken");
	res.send({
		message: "Logged Out Successfully!",
	});
});

app.get("/api/validate", [jwtAuth.verifyToken], async (req, res) => {
	const userProfile = await User.findOne({
		email: req.userEmail,
	});
	res.status(200).send({
		verified: userProfile.verified,
		onboarded: userProfile.onboarded,
	});
});

app.post("/api/verify", [jwtAuth.verifyToken], async (req, res) => {
	const userProfile = await User.findOne({
		email: req.userEmail,
	});
	if (userProfile.otp == req.body.otp) {
		await User.findOneAndUpdate(
			{
				email: req.userEmail,
			},
			{
				verified: true,
			}
		);
		res.status(200).send({ message: "Verified!" });
	} else {
		return res.status(401).send({ message: "Wrong Code - Please Retry" });
	}
});

app.post("/api/onboard", [jwtAuth.verifyToken], async (req, res) => {
	User.findOneAndUpdate(
		{
			email: req.userEmail,
		},
		{
			onboarded: true,
			name: req.body.name,
			age: req.body.age,
			profile: req.body.profile,
		}
	)
		.then(() => {
			res.status(200).send({
				message: "Profile completed, going to dashboard...",
			});
		})
		.catch((err) => {
			return res.status(404).send({
				message: err.message,
			});
		});
});

app.get("/api/dash", [jwtAuth.verifyToken], async (req, res) => {
	const userProfile = await User.findOne({
		email: req.userEmail,
	});
	res.status(200).send({
		name: userProfile.name,
		age: userProfile.age,
		email: userProfile.email,
		profile: userProfile.profile,
	});
});

app.post("/api/reset", [jwtAuth.verifyToken], async (req, res) => {
	const userProfile = await User.findOne({
		email: req.userEmail,
	});
	if (!userProfile) {
		res.status(404).send({
			message: "User does not exist, please Sign Up!",
		});
	} else {
		const passwordIsValid = bcrypt.compareSync(
			req.body.password,
			userProfile.password
		);

		if (passwordIsValid) {
			await User.findOneAndUpdate(
				{
					email: req.userEmail,
				},
				{
					password: bcrypt.hashSync(req.body.newPassword, 8),
				}
			);
			res.send({
				message: "Password Reset Successfully!",
			});
		} else {
			res.status(401).send({
				message: "Invalid Password!",
			});
		}
	}
});

app.delete("/api/delete", [jwtAuth.verifyToken], async (req, res) => {
	User.deleteOne({
		email: req.userEmail,
	})
		.then(() => {
			res.status(200).send({
				message: "Account Deleted - We're sorry to see you go 😢",
			});
		})
		.catch((err) => {
			res.status(404).send({
				message: err.message,
			});
		});
});

app.post("/api/detect", [jwtAuth.verifyToken], async (req, res) => {
	const file = req.files.image;
	const img = await canvas.loadImage(file.tempFilePath);
	const detections = await faceapi.detectAllFaces(img);
	fs.unlink(file.tempFilePath);
	res.status(200).send({
		detections,
	});
});

app.post("/api/upload", [jwtAuth.verifyToken], async (req, res) => {
	const options = {
		version: "v4",
		action: "write",
		expires: Date.now() + 15 * 60 * 1000, // 15 minutes
		contentType: "application/octet-stream",
	};
	const [url] = await storage
		.bucket(bucketName)
		.file(req.body.fileName)
		.getSignedUrl(options);
	res.status(200).send({
		message: "Starting Upload...",
		url,
	});
});

app.use("/", async (req, res) => {
	res.send("Hello, world!");
});

app.listen(8000);
console.log("Listening at http://localhost:8000");
