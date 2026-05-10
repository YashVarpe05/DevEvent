"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ApplicationData {
	status: "pending" | "under_review" | "approved" | "rejected";
	createdAt: string;
	adminNotes?: string;
}

export default function ApplicationStatusPage() {
	const router = useRouter();
	const { update } = useSession();
	const [application, setApplication] = useState<ApplicationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const res = await fetch("/api/organizer/application/me");
				if (res.status === 404) {
					router.push("/become-organizer");
					return;
				}
				if (!res.ok) {
					throw new Error("Failed to fetch application status");
				}
				const data = await res.json();
				
				if (data.application) {
					setApplication({
						status: data.application.status,
						createdAt: data.application.createdAt,
						adminNotes: data.application.rejectionReason,
					});
				} else if (data.status === "approved") {
					setApplication({
						status: "approved",
						createdAt: new Date().toISOString(),
					});
				} else {
					router.push("/become-organizer");
					return;
				}

				// If approved, trigger a session update to refresh organizerStatus in JWT
				if (data.status === "approved" || data.application?.status === "approved") {
					await update();
				}
			} catch (err) {
				setError("Could not load your application status.");
			} finally {
				setLoading(false);
			}
		};

		fetchStatus();
	}, [router, update]);

	if (loading) {
		return (
			<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
				<div style={{ width: "32px", height: "32px", border: "4px solid var(--border-dim)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
			</div>
		);
	}

	if (error || !application) {
		return (
			<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", padding: "24px" }}>
				<div style={{ background: "var(--bg-surface)", padding: "32px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", textAlign: "center", maxWidth: "400px", width: "100%" }}>
					<div style={{ color: "var(--red)", marginBottom: "16px" }}>
						<svg style={{ width: "48px", height: "48px", margin: "0 auto" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Error</h2>
					<p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "15px" }}>{error || "Application not found"}</p>
					<Link href="/become-organizer" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
						Return to Application Form
					</Link>
				</div>
			</div>
		);
	}

	const renderStatusCard = () => {
		switch (application.status) {
			case "approved":
				return (
					<div style={{ textAlign: "center" }}>
						<div style={{ width: "80px", height: "80px", background: "rgba(16, 185, 129, 0.1)", color: "var(--green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
							<svg style={{ width: "40px", height: "40px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>You're Approved!</h2>
						<p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "15px" }}>
							Welcome to the DevEvent Organizer community. You now have access to host and manage events.
						</p>
						<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
							<button
								onClick={() => router.push("/organizer/dashboard")}
								style={{ width: "100%", background: "var(--gold)", color: "#000", padding: "12px", borderRadius: "var(--radius-md)", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s" }}
							>
								Go to Organizer Dashboard
							</button>
							<p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
								Note: You may need to log out and log back in if you don't see your new dashboard right away.
							</p>
						</div>
					</div>
				);

			case "rejected":
				return (
					<div style={{ textAlign: "center" }}>
						<div style={{ width: "80px", height: "80px", background: "rgba(239, 68, 68, 0.1)", color: "var(--red)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
							<svg style={{ width: "40px", height: "40px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Application Not Approved</h2>
						<p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "15px" }}>
							Thank you for applying to be an organizer. Unfortunately, we cannot approve your application at this time.
						</p>
						{application.adminNotes && (
							<div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
								<span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", display: "block" }}>Reason provided</span>
								<p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>{application.adminNotes}</p>
							</div>
						)}
						<Link href="/" style={{ display: "inline-block", background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", color: "var(--text-primary)", padding: "10px 24px", borderRadius: "var(--radius-md)", fontWeight: 500, textDecoration: "none" }}>
							Return Home
						</Link>
					</div>
				);

			case "pending":
			case "under_review":
			default:
				return (
					<div style={{ textAlign: "center" }}>
						<div style={{ width: "80px", height: "80px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
							<svg style={{ width: "40px", height: "40px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Application Under Review</h2>
						<p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "15px" }}>
							We've received your application and our team is currently reviewing it. This usually takes 24-48 hours.
						</p>

						<div style={{ position: "relative", paddingTop: "16px", textAlign: "left" }}>
							<div style={{ overflow: "hidden", height: "8px", marginBottom: "16px", display: "flex", borderRadius: "4px", background: "var(--border-dim)" }}>
								<div 
									style={{ width: application.status === "under_review" ? "66%" : "33%", background: "#3b82f6", transition: "width 0.5s ease" }} 
								></div>
							</div>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>
								<span style={{ color: "#3b82f6" }}>Submitted</span>
								<span style={application.status === "under_review" ? { color: "#3b82f6" } : {}}>In Review</span>
								<span>Decision</span>
							</div>
						</div>
						
						<p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "32px" }}>
							Applied on {new Date(application.createdAt).toLocaleDateString()}
						</p>
					</div>
				);
		}
	};

	return (
		<main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "48px 16px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
			<div style={{ width: "100%", maxWidth: "440px", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", padding: "32px", marginTop: "48px" }}>
				{renderStatusCard()}
			</div>
		</main>
	);
}
