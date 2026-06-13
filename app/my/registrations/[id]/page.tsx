export const dynamic = 'force-dynamic';
import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/database/registration.model";
import { ArrowLeft, MapPin, CalendarDays, Ticket, ExternalLink, Video } from "lucide-react";
import CancelRegistrationButton from "@/components/CancelRegistrationButton";
import FeedbackForm from "@/components/FeedbackForm";
import TicketQR from "@/components/TicketQR";

async function getRegistrationDetails(id: string, userId: string) {
  await connectDB();
  require("@/database/event.model");

  const reg = await Registration.findOne({ _id: id, attendeeUserId: userId })
    .populate("eventId")
    .lean();
    
  return reg;
}

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/my/registrations/${id}`);
  }

  const registration = await getRegistrationDetails(id, session.user.id) as any;

  if (!registration || !registration.eventId) {
    notFound();
  }

  const event = registration.eventId;
  const startDate = new Date(event.startAt);
  const isCancelled = typeof registration.status === "string" && registration.status.startsWith("cancelled");

  const formatLabel = (label: string) => (
    <span style={{
      fontFamily: "var(--font-body)",
      fontSize: "10px",
      fontWeight: 500,
      letterSpacing: "0.14em",
      textTransform: "uppercase" as const,
      color: "var(--text-muted)",
    }}>
      {label}
    </span>
  );

  const formatValue = (value: string) => (
    <p style={{
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      color: "var(--text-primary)",
      marginTop: "3px",
    }}>
      {value}
    </p>
  );

  const statusConfig = isCancelled
    ? { bg: "rgba(204,70,70,0.08)", border: "rgba(204,70,70,0.3)", color: "var(--red)", icon: "✕", label: "CANCELLED" }
    : registration.status === "confirmed"
    ? { bg: "var(--gold-subtle)", border: "var(--border-gold)", color: "var(--gold)", icon: "✓", label: "CONFIRMED" }
    : registration.status === "waitlisted"
    ? { bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.3)", color: "#94a3b8", icon: "⏳", label: "WAITLISTED" }
    : registration.status === "pending_approval"
    ? { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", color: "#f59e0b", icon: "⏳", label: "PENDING APPROVAL" }
    : { bg: "var(--bg-elevated)", border: "var(--border-dim)", color: "var(--text-muted)", icon: "⏳", label: registration.status?.toUpperCase() || "PENDING" };

  const locationText = event.eventType === "online"
    ? "Online"
    : event.location?.venueName || "Venue TBA";

  const formatType = event.eventType === "online"
    ? "Online"
    : event.eventType === "hybrid"
    ? "Hybrid"
    : "In-Person";

  return (
    <main style={{ background: "var(--bg-void)", minHeight: "100dvh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>

        {/* Back link */}
        <Link
          href="/my/registrations"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "32px",
            transition: "color 160ms ease",
          }}
          className="hover:!text-text-primary"
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} /> My Tickets
        </Link>

        {/* Ticket Card — outer wrapper with gold glow */}
        <div style={{ position: "relative" }}>
          {/* Gold glow behind card */}
          {!isCancelled && (
            <div
              style={{
                position: "absolute",
                inset: "-1px",
                background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05), transparent 60%)",
                borderRadius: "calc(var(--radius-xl) + 1px)",
                filter: "blur(8px)",
                zIndex: 0,
              }}
            />
          )}

          {/* Card */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: "var(--bg-surface)",
              border: `1px solid ${isCancelled ? "var(--border-dim)" : "rgba(255,107,53,0.2)"}`,
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            {/* CARD TOP SECTION */}
            <div
              style={{
                background: isCancelled
                  ? "var(--bg-elevated)"
                  : "linear-gradient(135deg, var(--bg-elevated) 0%, var(--gold-subtle) 100%)",
                padding: "24px 24px 20px",
                borderBottom: "1px dashed rgba(255,107,53,0.2)",
                position: "relative",
              }}
            >
              {/* Decorative pattern */}
              {!isCancelled && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "120px",
                    height: "120px",
                    background: "radial-gradient(circle at top right, rgba(255,107,53,0.06), transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Status badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: statusConfig.bg,
                  border: `1px solid ${statusConfig.border}`,
                  color: statusConfig.color,
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {statusConfig.icon} {statusConfig.label}
              </span>

              {/* Event title */}
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: "12px",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }}
              >
                {event.title}
              </h1>

              {/* Registered on */}
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                Registered on {new Date(registration.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            {/* CARD DETAILS SECTION */}
            <div
              style={{
                padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                position: "relative",
              }}
            >
              <div>
                {formatLabel("DATE")}
                {formatValue(startDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).toUpperCase())}
              </div>
              <div>
                {formatLabel("TIME")}
                {formatValue(startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }))}
              </div>
              <div>
                {formatLabel("LOCATION")}
                {formatValue(locationText)}
              </div>
              <div>
                {formatLabel("FORMAT")}
                {formatValue(formatType)}
              </div>
              <div>
                {formatLabel("TICKET")}
                {formatValue("General Admission")}
              </div>
              <div>
                {formatLabel("ATTENDEE")}
                {formatValue(session.user.name || "Attendee")}
              </div>
            </div>

            {/* Perforated edge divider */}
            <div style={{ position: "relative", height: "1px", borderTop: "1px dashed rgba(255,107,53,0.15)" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-12px",
                  top: "-12px",
                  width: "24px",
                  height: "24px",
                  background: "var(--bg-void)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: "-12px",
                  top: "-12px",
                  width: "24px",
                  height: "24px",
                  background: "var(--bg-void)",
                  borderRadius: "50%",
                }}
              />
            </div>

            {/* QR CODE SECTION */}
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {!isCancelled ? (
                <>
                  <div
                    style={{
                      background: "#EDEAE1",
                      padding: "16px",
                      borderRadius: "var(--radius-md)",
                      width: "fit-content",
                    }}
                  >
                    <TicketQR ticketCode={registration.ticketCode} size={180} />
                  </div>

                  {/* Ticket code below QR */}
                  <p style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    letterSpacing: "0.12em",
                  }}>
                    {registration.ticketCode}
                  </p>

                  <p style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    maxWidth: "200px",
                  }}>
                    Show this QR at the venue for check-in
                  </p>

                  {registration.checkedInAt && (
                    <div style={{
                      background: "rgba(42,157,111,0.08)",
                      border: "1px solid rgba(42,157,111,0.25)",
                      color: "var(--green)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      padding: "4px 14px",
                      borderRadius: "var(--radius-sm)",
                      marginTop: "4px",
                    }}>
                      ✓ Checked In
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "var(--bg-elevated)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <Ticket style={{ width: "28px", height: "28px", color: "var(--text-muted)" }} />
                  </div>
                  <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                    Ticket Voided
                  </p>
                </div>
              )}
            </div>

            {/* CARD BOTTOM — Actions */}
            <div
              style={{
                padding: "16px 24px",
                background: "var(--bg-elevated)",
                borderTop: "1px solid var(--border-dim)",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={`/events/${event.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  background: "transparent",
                  height: "38px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13px",
                  padding: "0 16px",
                  textDecoration: "none",
                  transition: "all 160ms ease",
                }}
              >
                View Event <ExternalLink style={{ width: "13px", height: "13px" }} />
              </Link>

              {!isCancelled && !registration.checkedInAt && (
                <CancelRegistrationButton registrationId={registration._id.toString()} />
              )}
            </div>
          </div>
        </div>

        {/* Post-event feedback — confirmed guests only, after the event ends */}
        {!isCancelled &&
          registration.status !== "waitlisted" &&
          registration.status !== "pending_approval" &&
          new Date(event.endAt) < new Date() && (
            <FeedbackForm
              eventId={event._id.toString()}
              eventTitle={event.title}
            />
          )}
      </div>
    </main>
  );
}
