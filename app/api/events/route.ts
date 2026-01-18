import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

export async function POST(req: NextRequest) {
	try {
		await connectDB();

		let event: any;
		const contentType = req.headers.get("content-type") || "";

		if (contentType.includes("application/json")) {
			event = await req.json();
		} else {
			const formData = await req.formData();
			event = {};
			for (const [key, value] of formData.entries()) {
				event[key.trim()] = value;
			}
		}
		const image = event.image as File | undefined;
		if (!image) {
			return NextResponse.json(
				{ message: "Image file is required" },
				{ status: 400 },
			);
		}
		const arrayBuffer = await image.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const uploadResult = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "image",
						folder: "DevEvent",
					},
					(error, results) => {
						if (error) return reject(error);
						resolve(results);
					},
				)
				.end(buffer);
		});

		event.image = (uploadResult as { secure_url: string }).secure_url;

		console.log("Received keys:", Object.keys(event));

		// Parse array fields if they come as strings (common in FormData)
		if (typeof event.tags === "string") {
			try {
				event.tags = JSON.parse(event.tags);
			} catch {
				event.tags = event.tags.split(",").map((t: string) => t.trim());
			}
		}
		if (typeof event.agenda === "string") {
			try {
				event.agenda = JSON.parse(event.agenda);
			} catch {
				// Keep as is or handle error, validation will catch if it's not an array
			}
		}

		console.log("Received event data:", event);

		const createdEvent = await Event.create(event);

		return NextResponse.json(
			{ message: "Event created successfully", event: createdEvent },
			{ status: 201 },
		);
	} catch (e) {
		console.error(e);
		return NextResponse.json(
			{
				message: "Event Creation Failed",
				error: e instanceof Error ? e.message : "Unknown Error",
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		await connectDB();

		const events = await Event.find().sort({ createdAt: -1 });

		return NextResponse.json(
			{ message: "Events fetched successfully ", events },
			{ status: 200 },
		);
	} catch (e) {
		return NextResponse.json(
			{ message: "Event fetching failed", error: e },
			{ status: 500 },
		);
	}
}
