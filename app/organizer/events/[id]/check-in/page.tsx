"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, QrCode, CheckCircle2, XCircle, Loader2, User, Ticket } from "lucide-react";
import { useParams } from "next/navigation";

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [ticketCode, setTicketCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus on input for fast scanning if possible
    inputRef.current?.focus();
  }, []);

  const handleCheckIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ticketCode || status === "loading") return;

    setStatus("loading");
    setMessage("");
    
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/check-in/code`, {
        method: "POST",
        body: JSON.stringify({ ticketCode: ticketCode.toUpperCase() }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Failed to check in");
        if (data.registration) setLastCheckIn(data.registration);
        return;
      }
      
      setStatus("success");
      setMessage("Check-in successful");
      setLastCheckIn(data.registration);
      setTicketCode(""); // Clear for next scan
      inputRef.current?.focus();
      
      // Reset success state after 3 seconds but keep the lastCheckIn info
      setTimeout(() => {
        if (status === "success") setStatus("idle");
      }, 3000);

    } catch (error) {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  };

  return (
		<div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-dim)", padding: "16px", position: "sticky", top: 0, zIndex: 10 }}>
				<div style={{ maxWidth: "448px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
					<Link 
						href={`/organizer/events/${eventId}/attendees`}
						style={{ padding: "8px", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", transition: "all 0.2s" }}
						onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
						onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
					>
						<ArrowLeft className="w-5 h-5" />
					</Link>
					<h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-display)" }}>Event Check-in</h1>
				</div>
			</div>

			<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 48px" }}>
				<div style={{ width: "100%", maxWidth: "448px", display: "flex", flexDirection: "column", gap: "32px" }}>
					
					{/* Main Input Component */}
					<div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", padding: "32px", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
						<div style={{ width: "80px", height: "80px", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", transition: "background-color 0.3s", background: status === "success" ? "rgba(34, 197, 94, 0.1)" : status === "error" ? "rgba(239, 68, 68, 0.1)" : "var(--gold-dim)", color: status === "success" ? "var(--green)" : status === "error" ? "var(--red)" : "var(--gold)" }}>
							{status === "loading" ? <Loader2 className="w-10 h-10 animate-spin" /> : <QrCode className="w-10 h-10" />}
						</div>

						<h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Scan or Enter Code</h2>
						<p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "15px" }}>Enter the attendee's ticket code manually or use a scanner.</p>

						<form onSubmit={handleCheckIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
							<input
								ref={inputRef}
								type="text"
								placeholder="DEV-XXXX-YYYY"
								value={ticketCode}
								onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
								autoFocus
								autoComplete="off"
								style={{ width: "100%", textAlign: "center", fontSize: "24px", fontFamily: "monospace", letterSpacing: "4px", textTransform: "uppercase", padding: "16px", background: "var(--bg-base)", border: "2px solid var(--border-dim)", borderRadius: "var(--radius-lg)", color: "var(--text-primary)", outline: "none", transition: "all 0.2s" }}
								onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
								onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
							/>
							<button
								type="submit"
								disabled={!ticketCode || status === "loading"}
								style={{ width: "100%", background: "var(--gold)", color: "#000", fontWeight: 700, padding: "16px", borderRadius: "var(--radius-lg)", border: "none", fontSize: "18px", transition: "all 0.2s", opacity: (!ticketCode || status === "loading") ? 0.5 : 1, cursor: (!ticketCode || status === "loading") ? "not-allowed" : "pointer", boxShadow: "0 0 16px var(--gold-dim)" }}
								onMouseEnter={(e) => { if (ticketCode && status !== "loading") { e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 175, 55, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; } }}
								onMouseLeave={(e) => { if (ticketCode && status !== "loading") { e.currentTarget.style.boxShadow = "0 0 16px var(--gold-dim)"; e.currentTarget.style.transform = "scale(1)"; } }}
							>
								{status === "loading" ? "Validating..." : "Check In"}
							</button>
						</form>
					</div>

					{/* Feedback Area */}
					{(status === "success" || status === "error") && (
						<div style={{ borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", alignItems: "flex-start", gap: "16px", background: status === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${status === "success" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`, color: status === "success" ? "var(--green)" : "var(--red)" }}>
							{status === "success" ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
							<div style={{ flex: 1 }}>
								<p style={{ fontWeight: 700, fontSize: "18px", margin: "0 0 4px 0" }}>{status === "success" ? "Confirmed!" : "Verification Failed"}</p>
								<p style={{ fontWeight: 500, opacity: 0.9, margin: 0, fontSize: "15px" }}>{message}</p>
							</div>
						</div>
					)}

					{/* Last Result Card */}
					{lastCheckIn && (
						<div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", padding: "24px", position: "relative", overflow: "hidden" }}>
							<div style={{ position: "absolute", top: 0, right: 0, padding: "12px" }}>
								 <Ticket style={{ width: "48px", height: "48px", color: "var(--border-dim)", opacity: 0.3 }} />
							</div>
							<h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px 0" }}>Last Result</h3>
							<div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
								<div style={{ width: "48px", height: "48px", background: "var(--bg-elevated)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
									<User className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
								</div>
								<div>
									<p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "18px", margin: "0 0 4px 0", lineHeight: 1 }}>
										{lastCheckIn.attendeeUserId?.name || "Unknown Attendee"}
									</p>
									<p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>{lastCheckIn.attendeeUserId?.email}</p>
								</div>
							</div>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px", paddingTop: "16px", borderTop: "1px solid var(--border-dim)" }}>
								<span style={{ color: "var(--text-secondary)" }}>Ticket Code</span>
								<span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)", fontSize: "15px" }}>{lastCheckIn.ticketCode}</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Helpful Hint (Mobile Only) */}
			<div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
				<p style={{ margin: 0 }}>Pro Tip: Use a Bluetooth barcode scanner for rapid entry.</p>
			</div>
		</div>
  );
}
