"use client";

import React, { useState } from "react";
import { Megaphone, MailPlus, Send } from "lucide-react";

type MessageGuestsPanelProps = {
	eventId: string;
	confirmedCount: number;
	activeCount: number;
};

const cardStyle: React.CSSProperties = {
	background: "var(--bg-surface)",
	border: "1px solid var(--border-dim)",
	borderRadius: "var(--radius-lg)",
	padding: "24px",
};

const labelStyle: React.CSSProperties = {
	display: "block",
	fontSize: "13px",
	fontWeight: 500,
	color: "var(--text-secondary)",
	marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
	width: "100%",
	padding: "10px 14px",
	background: "var(--bg-base)",
	border: "1px solid var(--border-dim)",
	borderRadius: "var(--radius-md)",
	color: "var(--text-primary)",
	outline: "none",
	fontSize: "14px",
};

const buttonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: "8px",
	background: "var(--gold)",
	color: "#000",
	padding: "10px 20px",
	borderRadius: "var(--radius-md)",
	fontWeight: 600,
	border: "none",
	cursor: "pointer",
	fontSize: "14px",
};

function ResultNote({ result }: { result: { ok: boolean; text: string } | null }) {
	if (!result) return null;
	return (
		<p style={{ fontSize: "13px", marginTop: "10px", color: result.ok ? "var(--green)" : "var(--red)" }}>
			{result.text}
		</p>
	);
}

export default function MessageGuestsPanel({ eventId, confirmedCount, activeCount }: MessageGuestsPanelProps) {
	// Announcement state
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [audience, setAudience] = useState<"confirmed" | "all_active">("confirmed");
	const [sendingBlast, setSendingBlast] = useState(false);
	const [blastResult, setBlastResult] = useState<{ ok: boolean; text: string } | null>(null);

	// Invite state
	const [inviteEmails, setInviteEmails] = useState("");
	const [inviteMessage, setInviteMessage] = useState("");
	const [sendingInvites, setSendingInvites] = useState(false);
	const [inviteResult, setInviteResult] = useState<{ ok: boolean; text: string } | null>(null);

	const handleAnnouncement = async (e: React.FormEvent) => {
		e.preventDefault();
		setSendingBlast(true);
		setBlastResult(null);
		try {
			const res = await fetch(`/api/organizer/events/${eventId}/announcements`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ subject, message, audience }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to send announcement");
			setBlastResult({ ok: true, text: data.message });
			setSubject("");
			setMessage("");
		} catch (err: unknown) {
			setBlastResult({ ok: false, text: err instanceof Error ? err.message : "Failed to send" });
		} finally {
			setSendingBlast(false);
		}
	};

	const handleInvites = async (e: React.FormEvent) => {
		e.preventDefault();
		setSendingInvites(true);
		setInviteResult(null);
		try {
			const emails = inviteEmails
				.split(/[\s,;]+/)
				.map((s) => s.trim())
				.filter(Boolean);
			const res = await fetch(`/api/organizer/events/${eventId}/invites`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ emails, message: inviteMessage || undefined }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to send invitations");
			setInviteResult({ ok: true, text: data.message });
			setInviteEmails("");
			setInviteMessage("");
		} catch (err: unknown) {
			setInviteResult({ ok: false, text: err instanceof Error ? err.message : "Failed to send" });
		} finally {
			setSendingInvites(false);
		}
	};

	return (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
			{/* Announcement blast */}
			<form onSubmit={handleAnnouncement} style={cardStyle}>
				<h2 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 4px 0" }}>
					<Megaphone className="w-5 h-5" style={{ color: "var(--gold)" }} /> Send an Announcement
				</h2>
				<p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
					Email every guest at once — schedule changes, venue details, reminders.
				</p>

				<div style={{ marginBottom: "14px" }}>
					<label style={labelStyle}>Audience</label>
					<select value={audience} onChange={(e) => setAudience(e.target.value as "confirmed" | "all_active")} style={{ ...inputStyle, appearance: "none" }}>
						<option value="confirmed">Confirmed guests ({confirmedCount})</option>
						<option value="all_active">All guests incl. waitlist &amp; pending ({activeCount})</option>
					</select>
				</div>

				<div style={{ marginBottom: "14px" }}>
					<label style={labelStyle}>Subject</label>
					<input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required minLength={3} maxLength={150} placeholder="e.g. Venue changed to Hall B" style={inputStyle} />
				</div>

				<div style={{ marginBottom: "18px" }}>
					<label style={labelStyle}>Message</label>
					<textarea value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} maxLength={5000} rows={6} placeholder="Write your update to guests..." style={{ ...inputStyle, resize: "vertical" }} />
				</div>

				<button type="submit" disabled={sendingBlast} style={{ ...buttonStyle, opacity: sendingBlast ? 0.6 : 1 }}>
					<Send className="w-4 h-4" />
					{sendingBlast ? "Sending..." : "Send Announcement"}
				</button>
				<ResultNote result={blastResult} />
			</form>

			{/* Invite guests */}
			<form onSubmit={handleInvites} style={cardStyle}>
				<h2 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 4px 0" }}>
					<MailPlus className="w-5 h-5" style={{ color: "var(--gold)" }} /> Invite Guests
				</h2>
				<p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
					Send the event link to people by email — up to 20 addresses at a time.
				</p>

				<div style={{ marginBottom: "14px" }}>
					<label style={labelStyle}>Email addresses</label>
					<textarea value={inviteEmails} onChange={(e) => setInviteEmails(e.target.value)} required rows={4} placeholder={"one@example.com, two@example.com\nthree@example.com"} style={{ ...inputStyle, resize: "vertical" }} />
					<p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Separate with commas, spaces, or new lines.</p>
				</div>

				<div style={{ marginBottom: "18px" }}>
					<label style={labelStyle}>Personal message (optional)</label>
					<textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} maxLength={500} rows={3} placeholder="Hope to see you there!" style={{ ...inputStyle, resize: "vertical" }} />
				</div>

				<button type="submit" disabled={sendingInvites} style={{ ...buttonStyle, opacity: sendingInvites ? 0.6 : 1 }}>
					<Send className="w-4 h-4" />
					{sendingInvites ? "Sending..." : "Send Invitations"}
				</button>
				<ResultNote result={inviteResult} />
			</form>
		</div>
	);
}
