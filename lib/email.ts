import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

const FROM_EMAIL = "DevEvent <onboarding@resend.dev>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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
  <div style="max-width:520px;margin:40px auto;padding:32px;background:#0d161a;border-radius:10px;border:1px solid #182830;">
    <h1 style="color:#59deca;font-size:24px;margin:0 0 8px;">Registration Confirmed!</h1>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">Hi ${userName},</p>
    <p style="color:#e7f2ff;font-size:16px;line-height:1.6;">You're all set! Your registration for <strong>${eventTitle}</strong> is confirmed.</p>
    
    <div style="margin:24px 0;padding:20px;background:#182830;border-radius:8px;border:1px dashed #59deca;text-align:center;">
      <p style="color:#bdbdbd;font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Ticket Code</p>
      <h2 style="color:#59deca;font-size:28px;margin:0;font-family:monospace;">${ticketCode}</h2>
    </div>

    <p style="color:#bdbdbd;font-size:14px;line-height:1.5;">Please have this code ready at the entrance for check-in. You can also view your digital ticket in your dashboard.</p>
    
    <a href="${BASE_URL}/my/registrations" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#59deca;color:#030708;font-weight:600;text-decoration:none;border-radius:6px;font-size:15px;">View My Tickets</a>
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

// ─── Email Sending Functions ─────────────────────────────────────────────────

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
		});
		return true;
	} catch (error) {
		console.error("❌ Failed to send registration email:", error);
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
