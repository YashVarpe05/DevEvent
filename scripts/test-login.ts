import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import User from "../database/user.model";

function loadEnv(file: string) {
	try {
		const lines = readFileSync(file, "utf8").split("\n");
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eqIdx = trimmed.indexOf("=");
			if (eqIdx === -1) continue;
			const key = trimmed.slice(0, eqIdx).trim();
			const val = trimmed.slice(eqIdx + 1).trim();
			if (!process.env[key]) process.env[key] = val;
		}
	} catch {}
}
loadEnv(".env.local");

async function checkLogin(email: string, pass: string) {
	await mongoose.connect(process.env.MONGODB_URI as string);
	console.log("Connected to DB");
	
	const user = await User.findOne({ email: email.toLowerCase().trim() });
	if (!user) {
		console.log("User not found by email");
		process.exit(1);
	}
	console.log("User found:", user.email, "isActive:", user.isActive, "deletedAt:", user.deletedAt, "hasPasswordHash:", !!user.passwordHash);
	
	const activeUser = await User.findOne({
		email: email.toLowerCase().trim(),
		isActive: true,
		deletedAt: null,
	});
	
	if (!activeUser) {
		console.log("User not found with isActive: true and deletedAt: null");
	} else {
		console.log("Active user found.");
		if (activeUser.passwordHash) {
			const isValid = await bcrypt.compare(pass, activeUser.passwordHash);
			console.log("Password valid:", isValid);
		}
	}
	
	await mongoose.disconnect();
}

const args = process.argv.slice(2);
if (args.length >= 2) {
    checkLogin(args[0], args[1]);
} else {
    checkLogin("admin@devevent.com", "Demo@1234");
}
