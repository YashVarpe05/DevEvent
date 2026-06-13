// RFC 5545 iCalendar generation for events.
// Used for the public .ics download and as an email attachment on confirmations.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev";

export type IcsEventInput = {
	id: string;
	slug: string;
	title: string;
	description?: string;
	startAt: Date | string;
	endAt: Date | string;
	location?: {
		venueName?: string;
		addressLine1?: string;
		addressLine2?: string;
		city?: string;
		state?: string;
		country?: string;
	};
	eventType?: "online" | "offline" | "hybrid";
	organizerName?: string;
};

// iCalendar requires escaping of backslash, semicolon, comma and newlines in text values
function escapeIcsText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\r?\n/g, "\\n");
}

// Lines longer than 75 octets must be folded with CRLF + space (RFC 5545 §3.1)
function foldIcsLine(line: string): string {
	if (line.length <= 75) return line;
	const chunks: string[] = [];
	let rest = line;
	chunks.push(rest.slice(0, 75));
	rest = rest.slice(75);
	while (rest.length > 0) {
		chunks.push(" " + rest.slice(0, 74));
		rest = rest.slice(74);
	}
	return chunks.join("\r\n");
}

function toIcsUtc(date: Date | string): string {
	return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildLocationString(event: IcsEventInput): string {
	if (event.eventType === "online") return "Online";
	const loc = event.location;
	if (!loc) return "";
	return [loc.venueName, loc.addressLine1, loc.addressLine2, loc.city, loc.state, loc.country]
		.filter(Boolean)
		.join(", ");
}

export function generateEventICS(event: IcsEventInput): string {
	const eventUrl = `${BASE_URL}/events/${event.slug}`;
	const description = [event.description || "", "", `Event page: ${eventUrl}`]
		.join("\n")
		.trim();

	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//DevEvent//Event Platform//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:event-${event.id}@devevents.dev`,
		`DTSTAMP:${toIcsUtc(new Date())}`,
		`DTSTART:${toIcsUtc(event.startAt)}`,
		`DTEND:${toIcsUtc(event.endAt)}`,
		`SUMMARY:${escapeIcsText(event.title)}`,
		`DESCRIPTION:${escapeIcsText(description)}`,
		`LOCATION:${escapeIcsText(buildLocationString(event))}`,
		`URL:${eventUrl}`,
		"STATUS:CONFIRMED",
		"END:VEVENT",
		"END:VCALENDAR",
	];

	return lines.map(foldIcsLine).join("\r\n");
}

// Multi-event feed for calendar subscriptions (webcal). X-WR-CALNAME names
// the calendar in Apple/Google/Outlook when users subscribe.
export function generateCalendarFeedICS(
	calendarName: string,
	events: IcsEventInput[],
): string {
	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//DevEvent//Event Platform//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${escapeIcsText(calendarName)}`,
		"X-PUBLISHED-TTL:PT1H",
	];

	for (const event of events) {
		const eventUrl = `${BASE_URL}/events/${event.slug}`;
		const description = [event.description || "", "", `Event page: ${eventUrl}`]
			.join("\n")
			.trim();
		lines.push(
			"BEGIN:VEVENT",
			`UID:event-${event.id}@devevents.dev`,
			`DTSTAMP:${toIcsUtc(new Date())}`,
			`DTSTART:${toIcsUtc(event.startAt)}`,
			`DTEND:${toIcsUtc(event.endAt)}`,
			`SUMMARY:${escapeIcsText(event.title)}`,
			`DESCRIPTION:${escapeIcsText(description)}`,
			`LOCATION:${escapeIcsText(buildLocationString(event))}`,
			`URL:${eventUrl}`,
			"STATUS:CONFIRMED",
			"END:VEVENT",
		);
	}

	lines.push("END:VCALENDAR");
	return lines.map(foldIcsLine).join("\r\n");
}

export function googleCalendarUrl(event: IcsEventInput): string {
	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: event.title,
		dates: `${toIcsUtc(event.startAt)}/${toIcsUtc(event.endAt)}`,
		details: `${event.description || ""}\n\n${BASE_URL}/events/${event.slug}`.trim(),
		location: buildLocationString(event),
	});
	return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(event: IcsEventInput): string {
	const params = new URLSearchParams({
		path: "/calendar/action/compose",
		rru: "addevent",
		subject: event.title,
		startdt: new Date(event.startAt).toISOString(),
		enddt: new Date(event.endAt).toISOString(),
		body: `${event.description || ""}\n\n${BASE_URL}/events/${event.slug}`.trim(),
		location: buildLocationString(event),
	});
	return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}
