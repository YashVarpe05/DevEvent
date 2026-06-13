import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

const FROM_NAME = process.env.RESEND_FROM_NAME || "DevEvent";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM_EMAIL = `${FROM_NAME} <${FROM_ADDRESS}>`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev";

function logEmailFallback(kind: string): void {
	// [FIXED]: Do not log recipient addresses, tokens, reset URLs, or ticket codes.
	console.log(`[Email] ${kind} email skipped; RESEND_API_KEY is not configured`);
}

function logEmailSent(kind: string): void {
	console.log(`[Email] ${kind} email sent`);
}

// ─── Email Templates ─────────────────────────────────────────────────────────

function verificationEmailHtml(verifyUrl: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;">DevEvent</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Verify your email address to get started.</p>
    <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 32px;background:#59deca;color:#030708;font-weight:600;text-decoration:none;border-radius:6px;font-size:16px;">Verify Email</a>
    <p style="color:#bdbdbd;font-size:13px;line-height:1.5;">Or copy this link:<br/><a href="${verifyUrl}" style="color:#94eaff;word-break:break-all;">${verifyUrl}</a></p>
    <p style="color:#bdbdbd;font-size:12px;margin-top:24px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
  </div>
</body>
</html>`;
}

function resetPasswordEmailHtml(resetUrl: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;">DevEvent</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">We received a request to reset your password.</p>
    <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 32px;background:#59deca;color:#030708;font-weight:600;text-decoration:none;border-radius:6px;font-size:16px;">Reset Password</a>
    <p style="color:#bdbdbd;font-size:13px;line-height:1.5;">Or copy this link:<br/><a href="${resetUrl}" style="color:#94eaff;word-break:break-all;">${resetUrl}</a></p>
    <p style="color:#bdbdbd;font-size:12px;margin-top:24px;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
  </div>
</body>
</html>`;
}

function registrationConfirmedHtml(userName: string, eventTitle: string, ticketCode: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(145deg, #0d161a 0%, #080c0f 100%);border-radius:12px;border:1px solid #182830;box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#59deca;font-size:28px;margin:0 0 8px;font-weight:800;letter-spacing:-0.5px;">You're In! 🎉</h1>
      <p style="color:#e7f2ff;font-size:16px;line-height:1.6;margin:0;">Your registration for <strong>${eventTitle}</strong> is confirmed.</p>
    </div>
    
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#bdbdbd;font-size:15px;line-height:1.6;">Get ready for an amazing experience. We've reserved your spot and your ticket is below.</p>
    
    <div style="margin:32px 0;padding:24px;background:#030708;border-radius:12px;border:1px solid #182830;text-align:center;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg, #59deca, #3b82f6);"></div>
      <p style="color:#8b9eb0;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your Official Ticket Code</p>
      <h2 style="color:#ffffff;font-size:32px;margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:2px;">${ticketCode}</h2>
    </div>

    <p style="color:#8b9eb0;font-size:14px;line-height:1.6;text-align:center;margin-bottom:24px;">Please have this code ready at the entrance for check-in. You can also view your digital ticket anytime in your dashboard.</p>
    
    <div style="text-align:center;">
      <a href="${BASE_URL}/my/registrations" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #59deca 0%, #38bdf8 100%);color:#030708;font-weight:700;text-decoration:none;border-radius:8px;font-size:16px;box-shadow:0 4px 12px rgba(89,222,202,0.3);">View My Ticket</a>
    </div>
  </div>
</body>
</html>`;
}

function registrationCanceledHtml(userName: string, eventTitle: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#ff6b6b;font-size:24px;margin:0 0 8px;">Registration Canceled</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Your registration for <strong>${eventTitle}</strong> has been successfully canceled as per your request.</p>
    <p style="color:#bdbdbd;font-size:14px;line-height:1.5;">We're sorry you can't make it! If this was a mistake, you can re-register on the event page if spots are still available.</p>
    <a href="${BASE_URL}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#182830;color:#e7f2ff;border:1px solid #314a57;text-decoration:none;border-radius:6px;font-size:15px;">Browse Other Events</a>
  </div>
</body>
</html>`;
}

function eventReminderHtml(userName: string, eventTitle: string, eventDate: string, locationStr: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(145deg, #0d161a 0%, #080c0f 100%);border-radius:12px;border:1px solid #182830;box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;font-weight:800;">Upcoming Event Reminder 📅</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">This is a friendly reminder that <strong>${eventTitle}</strong> is happening soon!</p>
    
    <div style="margin:24px 0;padding:20px;background:#030708;border-radius:8px;border:1px solid #182830;border-left:4px solid #59deca;">
      <p style="color:#bdbdbd;font-size:14px;margin:0 0 12px;"><strong>Time:</strong> <span style="color:#e7f2ff">${eventDate}</span></p>
      <p style="color:#bdbdbd;font-size:14px;margin:0;"><strong>Location/Link:</strong> <span style="color:#e7f2ff">${locationStr}</span></p>
    </div>

    <p style="color:#8b9eb0;font-size:14px;line-height:1.5;">Don't forget to have your ticket QR code ready for check-in if it's an offline event.</p>
    
    <a href="${BASE_URL}/my/registrations" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#182830;color:#e7f2ff;border:1px solid #314a57;text-decoration:none;border-radius:6px;font-size:15px;">View My Tickets</a>
  </div>
</body>
</html>`;
}

function organizerPayoutSummaryHtml(organizerName: string, eventTitle: string, ticketCount: number, revenue: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(145deg, #0d161a 0%, #080c0f 100%);border-radius:12px;border:1px solid #182830;box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;font-weight:800;">Event Concluded 🚀</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${organizerName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Congratulations on completing <strong>${eventTitle}</strong>! Here is your quick payout summary.</p>
    
    <div style="margin:24px 0;padding:24px;background:#030708;border-radius:8px;border:1px solid #182830;text-align:center;">
      <div style="display:inline-block;margin:0 20px;">
        <p style="color:#8b9eb0;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Tickets Sold</p>
        <p style="color:#ffffff;font-size:28px;margin:0;font-weight:700;">${ticketCount}</p>
      </div>
      <div style="display:inline-block;margin:0 20px;">
        <p style="color:#8b9eb0;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Net Revenue Estimate</p>
        <p style="color:#59deca;font-size:28px;margin:0;font-weight:700;">${revenue}</p>
      </div>
    </div>

    <p style="color:#8b9eb0;font-size:14px;line-height:1.5;">Payouts are processed according to the platform schedule (typically 3-5 days). Check your Organizer Dashboard for detailed analytics and payout status.</p>
    
    <a href="${BASE_URL}/organizer/events" style="display:inline-block;margin:20px 0;padding:12px 24px;background:linear-gradient(135deg, #59deca 0%, #38bdf8 100%);color:#030708;font-weight:700;text-decoration:none;border-radius:6px;font-size:15px;">Go to Dashboard</a>
  </div>
</body>
</html>`;
}

function waitlistJoinedHtml(userName: string, eventTitle: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;">You're on the Waitlist</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;"><strong>${eventTitle}</strong> is currently full, so we've added you to the waitlist.</p>
    <p style="color:#bdbdbd;font-size:14px;line-height:1.5;">If a spot opens up, you'll be confirmed automatically and we'll email you your ticket right away. No action needed.</p>
    <a href="${BASE_URL}/my/registrations" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#182830;color:#e7f2ff;border:1px solid #314a57;text-decoration:none;border-radius:6px;font-size:15px;">View My Registrations</a>
  </div>
</body>
</html>`;
}

function waitlistPromotedHtml(userName: string, eventTitle: string, ticketCode: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(145deg, #0d161a 0%, #080c0f 100%);border-radius:12px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:26px;margin:0 0 8px;font-weight:800;">A Spot Opened Up! 🎉</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Great news — you've been moved off the waitlist and your spot at <strong>${eventTitle}</strong> is confirmed.</p>
    <div style="margin:28px 0;padding:24px;background:#030708;border-radius:12px;border:1px solid #182830;text-align:center;">
      <p style="color:#8b9eb0;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your Official Ticket Code</p>
      <h2 style="color:#ffffff;font-size:30px;margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:2px;">${ticketCode}</h2>
    </div>
    <div style="text-align:center;">
      <a href="${BASE_URL}/my/registrations" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #59deca 0%, #38bdf8 100%);color:#030708;font-weight:700;text-decoration:none;border-radius:8px;font-size:16px;">View My Ticket</a>
    </div>
  </div>
</body>
</html>`;
}

function registrationPendingHtml(userName: string, eventTitle: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;">Registration Received</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Your request to attend <strong>${eventTitle}</strong> has been sent to the host for approval.</p>
    <p style="color:#bdbdbd;font-size:14px;line-height:1.5;">You'll get another email with your ticket as soon as the host approves your registration.</p>
    <a href="${BASE_URL}/my/registrations" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#182830;color:#e7f2ff;border:1px solid #314a57;text-decoration:none;border-radius:6px;font-size:15px;">View My Registrations</a>
  </div>
</body>
</html>`;
}

function registrationDeclinedHtml(userName: string, eventTitle: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#ff6b6b;font-size:24px;margin:0 0 8px;">Registration Update</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Unfortunately, the host wasn't able to approve your registration for <strong>${eventTitle}</strong>.</p>
    <p style="color:#bdbdbd;font-size:14px;line-height:1.5;">This can happen when an event is invite-only or reaches capacity. There are plenty of other great events to explore.</p>
    <a href="${BASE_URL}/events" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#182830;color:#e7f2ff;border:1px solid #314a57;text-decoration:none;border-radius:6px;font-size:15px;">Browse Other Events</a>
  </div>
</body>
</html>`;
}

// Organizer-provided content is interpolated into HTML emails — escape it.
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function eventAnnouncementHtml(
	userName: string,
	eventTitle: string,
	organizerName: string,
	message: string,
): string {
	const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br/>");
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <p style="color:#8b9eb0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Update from ${escapeHtml(organizerName)}</p>
    <h1 style="color:#59deca;font-size:22px;margin:0 0 16px;">${escapeHtml(eventTitle)}</h1>
    <p style="color:#e7f2ff;font-size:15px;line-height:1.6;">Hi ${escapeHtml(userName)},</p>
    <div style="color:#e7f2ff;font-size:15px;line-height:1.7;margin:16px 0;padding:20px;background:#030708;border-radius:8px;border-left:3px solid #59deca;">${safeMessage}</div>
    <a href="${BASE_URL}/my/registrations" style="display:inline-block;margin:12px 0;padding:12px 24px;background:#182830;color:#e7f2ff;border:1px solid #314a57;text-decoration:none;border-radius:6px;font-size:14px;">View My Ticket</a>
    <p style="color:#8b9eb0;font-size:12px;margin-top:20px;">You're receiving this because you're registered for this event.</p>
  </div>
</body>
</html>`;
}

function eventInviteHtml(
	eventTitle: string,
	eventUrl: string,
	organizerName: string,
	personalMessage?: string,
): string {
	const messageBlock = personalMessage
		? `<div style="color:#e7f2ff;font-size:15px;line-height:1.7;margin:16px 0;padding:20px;background:#030708;border-radius:8px;border-left:3px solid #59deca;">${escapeHtml(personalMessage).replace(/\r?\n/g, "<br/>")}</div>`
		: "";
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(145deg, #0d161a 0%, #080c0f 100%);border-radius:12px;border:1px solid #182830;">
    <p style="color:#8b9eb0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">You're Invited</p>
    <h1 style="color:#59deca;font-size:24px;margin:0 0 12px;font-weight:800;">${escapeHtml(eventTitle)}</h1>
    <p style="color:#e7f2ff;font-size:15px;line-height:1.6;"><strong>${escapeHtml(organizerName)}</strong> has invited you to their event on DevEvent.</p>
    ${messageBlock}
    <div style="text-align:center;margin-top:24px;">
      <a href="${eventUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #59deca 0%, #38bdf8 100%);color:#030708;font-weight:700;text-decoration:none;border-radius:8px;font-size:16px;">View Event &amp; Register</a>
    </div>
    <p style="color:#8b9eb0;font-size:12px;margin-top:24px;">If you weren't expecting this invitation, you can safely ignore this email.</p>
  </div>
</body>
</html>`;
}

function newEventHtml(
	followerName: string,
	organizerName: string,
	eventTitle: string,
	dateStr: string,
	locationStr: string,
	eventUrl: string,
	unsubscribeUrl: string,
): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(145deg, #0d161a 0%, #080c0f 100%);border-radius:12px;border:1px solid #182830;">
    <p style="color:#8b9eb0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">New event from ${escapeHtml(organizerName)}</p>
    <h1 style="color:#59deca;font-size:24px;margin:0 0 16px;font-weight:800;">${escapeHtml(eventTitle)}</h1>
    <p style="color:#e7f2ff;font-size:15px;line-height:1.6;">Hi ${escapeHtml(followerName)},</p>
    <p style="color:#e7f2ff;font-size:15px;line-height:1.6;"><strong>${escapeHtml(organizerName)}</strong> just announced a new event.</p>
    <div style="margin:20px 0;padding:20px;background:#030708;border-radius:8px;border:1px solid #182830;border-left:4px solid #59deca;">
      <p style="color:#bdbdbd;font-size:14px;margin:0 0 10px;"><strong>When:</strong> <span style="color:#e7f2ff">${escapeHtml(dateStr)}</span></p>
      <p style="color:#bdbdbd;font-size:14px;margin:0;"><strong>Where:</strong> <span style="color:#e7f2ff">${escapeHtml(locationStr)}</span></p>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${eventUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #59deca 0%, #38bdf8 100%);color:#030708;font-weight:700;text-decoration:none;border-radius:8px;font-size:16px;">View Event &amp; Register</a>
    </div>
    <p style="color:#8b9eb0;font-size:12px;margin-top:28px;text-align:center;">You follow ${escapeHtml(organizerName)} on DevEvent.<br/><a href="${unsubscribeUrl}" style="color:#94eaff;">Stop emails from this organizer</a></p>
  </div>
</body>
</html>`;
}

// ─── Email Sending Functions ─────────────────────────────────────────────────

type IcsAttachment = { filename: string; content: Buffer }[] | undefined;

function icsAttachment(icsContent?: string): IcsAttachment {
	if (!icsContent) return undefined;
	return [{ filename: "event.ics", content: Buffer.from(icsContent, "utf-8") }];
}

export async function sendVerificationEmail(
	email: string,
	token: string,
): Promise<boolean> {
	const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;

	if (!resend) {
		logEmailFallback("verification");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: "Verify your DevEvent account",
			html: verificationEmailHtml(verifyUrl),
		});
		logEmailSent("verification");
		return true;
	} catch (error) {
		console.error("❌ Failed to send verification email:", error);
		return false;
	}
}

export async function sendPasswordResetEmail(
	email: string,
	token: string,
): Promise<boolean> {
	const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

	if (!resend) {
		logEmailFallback("password reset");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: "Reset your DevEvent password",
			html: resetPasswordEmailHtml(resetUrl),
		});
		logEmailSent("password reset");
		return true;
	} catch (error) {
		console.error("❌ Failed to send password reset email:", error);
		return false;
	}
}

export async function sendApplicationSubmittedEmail(
	email: string,
	name: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("organizer application submitted");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: "Your DevEvent Organizer Application is Under Review",
			html: `<p>Hi ${name},</p><p>We have received your application to become an organizer on DevEvent. Our team will review it within 1-2 business days and notify you of our decision.</p>`,
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send application submitted email:", error);
		return false;
	}
}

export async function sendApplicationApprovedEmail(
	email: string,
	name: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("organizer application approved");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: "Welcome to DevEvent Organizers!",
			html: `<p>Hi ${name},</p><p>Congratulations! Your application has been approved. You now have access to the Organizer Dashboard and can start hosting events.</p>`,
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send application approved email:", error);
		return false;
	}
}

export async function sendApplicationRejectedEmail(
	email: string,
	name: string,
	reason?: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("organizer application rejected");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: "Update on your DevEvent Organizer Application",
			html: `<p>Hi ${name},</p><p>Thank you for applying. Unfortunately, your application to become an organizer has been declined at this time.</p>${reason ? `<p>Reason: ${reason}</p>` : ""}`,
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send application rejected email:", error);
		return false;
	}
}

export async function sendRegistrationEmail(
	email: string,
	userName: string,
	eventTitle: string,
	ticketCode: string,
	icsContent?: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("registration confirmation");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Confirmed: Your Ticket for ${eventTitle}`,
			html: registrationConfirmedHtml(userName, eventTitle, ticketCode),
			attachments: icsAttachment(icsContent),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send registration email:", error);
		return false;
	}
}

export async function sendWaitlistJoinedEmail(
	email: string,
	userName: string,
	eventTitle: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("waitlist joined");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Waitlisted: ${eventTitle}`,
			html: waitlistJoinedHtml(userName, eventTitle),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send waitlist joined email:", error);
		return false;
	}
}

export async function sendWaitlistPromotedEmail(
	email: string,
	userName: string,
	eventTitle: string,
	ticketCode: string,
	icsContent?: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("waitlist promoted");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `You're In: A Spot Opened Up for ${eventTitle}`,
			html: waitlistPromotedHtml(userName, eventTitle, ticketCode),
			attachments: icsAttachment(icsContent),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send waitlist promoted email:", error);
		return false;
	}
}

export async function sendRegistrationPendingEmail(
	email: string,
	userName: string,
	eventTitle: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("registration pending approval");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Pending Approval: ${eventTitle}`,
			html: registrationPendingHtml(userName, eventTitle),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send registration pending email:", error);
		return false;
	}
}

export async function sendRegistrationDeclinedEmail(
	email: string,
	userName: string,
	eventTitle: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("registration declined");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Update on Your Registration for ${eventTitle}`,
			html: registrationDeclinedHtml(userName, eventTitle),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send registration declined email:", error);
		return false;
	}
}

export async function sendCancellationEmail(
	email: string,
	userName: string,
	eventTitle: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("registration cancellation");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Canceled: Your Registration for ${eventTitle}`,
			html: registrationCanceledHtml(userName, eventTitle),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send cancellation email:", error);
		return false;
	}
}

export async function sendEventReminderEmail(
	email: string,
	userName: string,
	eventTitle: string,
	eventDate: string,
	locationStr: string
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("event reminder");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Reminder: ${eventTitle} is coming up!`,
			html: eventReminderHtml(userName, eventTitle, eventDate, locationStr),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send event reminder email:", error);
		return false;
	}
}

export async function sendEventAnnouncementEmail(
	email: string,
	userName: string,
	eventTitle: string,
	organizerName: string,
	subject: string,
	message: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("event announcement");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `[${eventTitle}] ${subject}`,
			html: eventAnnouncementHtml(userName, eventTitle, organizerName, message),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send event announcement email:", error);
		return false;
	}
}

export async function sendEventInviteEmail(
	email: string,
	eventTitle: string,
	eventUrl: string,
	organizerName: string,
	personalMessage?: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("event invite");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `You're invited: ${eventTitle}`,
			html: eventInviteHtml(eventTitle, eventUrl, organizerName, personalMessage),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send event invite email:", error);
		return false;
	}
}

export async function sendEventStartingSoonEmail(
	email: string,
	userName: string,
	eventTitle: string,
	timeStr: string,
	joinInfo: string,
	isOnline: boolean,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("event starting soon");
		return true;
	}

	const joinBlock = isOnline
		? `<div style="text-align:center;margin:24px 0;"><a href="${joinInfo}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #59deca 0%, #38bdf8 100%);color:#030708;font-weight:700;text-decoration:none;border-radius:8px;font-size:16px;">Join Now</a></div>`
		: `<p style="color:#bdbdbd;font-size:14px;line-height:1.6;"><strong>Where:</strong> <span style="color:#e7f2ff">${escapeHtml(joinInfo)}</span></p>`;

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Starting soon: ${eventTitle}`,
			html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;">Starting Soon ⏰</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${escapeHtml(userName)},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;"><strong>${escapeHtml(eventTitle)}</strong> starts at ${escapeHtml(timeStr)}.</p>
    ${joinBlock}
    <p style="color:#8b9eb0;font-size:13px;line-height:1.5;">Have your ticket QR ready if you're attending in person.</p>
  </div>
</body>
</html>`,
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send starting soon email:", error);
		return false;
	}
}

export async function sendFeedbackRequestEmail(
	email: string,
	userName: string,
	eventTitle: string,
	ticketUrl: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("feedback request");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `How was ${eventTitle}?`,
			html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030708;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;">How was it?</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${escapeHtml(userName)},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Thanks for attending <strong>${escapeHtml(eventTitle)}</strong>. A quick rating helps the host make the next one even better.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${ticketUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #59deca 0%, #38bdf8 100%);color:#030708;font-weight:700;text-decoration:none;border-radius:8px;font-size:16px;">Rate This Event</a>
    </div>
    <p style="color:#8b9eb0;font-size:13px;line-height:1.5;">Takes 20 seconds — star rating plus an optional note to the host.</p>
  </div>
</body>
</html>`,
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send feedback request email:", error);
		return false;
	}
}

export async function sendNewEventEmail(
	email: string,
	followerName: string,
	organizerName: string,
	eventTitle: string,
	dateStr: string,
	locationStr: string,
	eventUrl: string,
	unsubscribeUrl: string,
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("new event notification");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `${organizerName} announced: ${eventTitle}`,
			html: newEventHtml(followerName, organizerName, eventTitle, dateStr, locationStr, eventUrl, unsubscribeUrl),
			headers: {
				"List-Unsubscribe": `<${unsubscribeUrl}>`,
			},
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send new event email:", error);
		return false;
	}
}

export async function sendOrganizerPayoutSummaryEmail(
	email: string,
	organizerName: string,
	eventTitle: string,
	ticketCount: number,
	revenue: string
): Promise<boolean> {
	if (!resend) {
		logEmailFallback("organizer payout summary");
		return true;
	}

	try {
		await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: `Event Summary: ${eventTitle}`,
			html: organizerPayoutSummaryHtml(organizerName, eventTitle, ticketCount, revenue),
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send organizer payout summary email:", error);
		return false;
	}
}
