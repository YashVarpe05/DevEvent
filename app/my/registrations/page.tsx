export const dynamic = 'force-dynamic';
import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/database/registration.model";
import Event from "@/database/event.model";
import { CalendarDays, MapPin, Ticket, Video } from "lucide-react";

async function getMyRegistrations(userId: string) {
  await connectDB();
  // Ensure Event model is loaded
  require("@/database/event.model");

  const registrations = await Registration.find({ attendeeUserId: userId })
    .populate({
      path: "eventId",
      select: "title slug startAt endAt coverImageUrl eventType location online",
    })
    .sort({ createdAt: -1 })
    .lean();

  return registrations;
}

export const metadata = {
  title: "My Registrations | DevEvent",
};

function formatDateCompact(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${weekday} · ${day} ${month} · ${time}`;
}

export default async function MyRegistrationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/my/registrations");
  }

  const registrations = await getMyRegistrations(session.user.id) as any[];

  const now = new Date();

  // Split into upcoming and past based on event's end time
  const upcoming = registrations.filter((reg) => {
    if (!reg.eventId) return false;
    return new Date(reg.eventId.endAt) >= now;
  });

  const past = registrations.filter((reg) => {
    if (!reg.eventId) return false;
    return new Date(reg.eventId.endAt) < now;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, { bg: string; border: string; color: string; label: string }> = {
      confirmed: {
        bg: "rgba(42,157,111,0.08)",
        border: "rgba(42,157,111,0.25)",
        color: "var(--green)",
        label: "Confirmed",
      },
      waitlisted: {
        bg: "rgba(148,163,184,0.08)",
        border: "rgba(148,163,184,0.25)",
        color: "#94a3b8",
        label: "Waitlisted",
      },
      pending_approval: {
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.25)",
        color: "#f59e0b",
        label: "Pending Approval",
      },
      cancelled_by_user: {
        bg: "rgba(204,70,70,0.08)",
        border: "rgba(204,70,70,0.25)",
        color: "var(--red)",
        label: "Cancelled",
      },
      cancelled_by_organizer: {
        bg: "rgba(204,70,70,0.08)",
        border: "rgba(204,70,70,0.25)",
        color: "var(--red)",
        label: "Cancelled by Host",
      },
    };
    const s = styles[status] || {
      bg: "var(--bg-elevated)",
      border: "var(--border-dim)",
      color: "var(--text-muted)",
      label: status,
    };
    return (
      <span
        style={{
          background: s.bg,
          border: `1px solid ${s.border}`,
          color: s.color,
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          padding: "2px 10px",
          borderRadius: "var(--radius-sm)",
          whiteSpace: "nowrap",
        }}
      >
        {s.label}
      </span>
    );
  };

  const RegistrationCard = ({ reg }: { reg: any }) => {
    const event = reg.eventId;
    if (!event) return null;

    const startDate = new Date(event.startAt);
    const isCancelled = typeof reg.status === "string" && reg.status.startsWith("cancelled");
    const locationText =
      event.eventType === "online"
        ? "Online"
        : event.location?.venueName || event.location?.city || "In-Person";

    return (
      <Link
        href={`/my/registrations/${reg._id}`}
        style={{
          display: "block",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-dim)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          marginBottom: "12px",
          cursor: "pointer",
          transition: "all 200ms ease",
          opacity: isCancelled ? 0.6 : 1,
          textDecoration: "none",
        }}
        className="group hover:translate-y-[-1px]"
        onMouseEnter={undefined}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
          {/* Left side */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Row 1 — Status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <StatusBadge status={reg.status} />
              {event.eventType && (
                <span
                  style={{
                    border: "1px solid var(--border-dim)",
                    color: "var(--text-muted)",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {event.eventType}
                </span>
              )}
            </div>

            {/* Row 2 — Event title */}
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginTop: "6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {event.title}
            </h3>

            {/* Row 3 — Date and location */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CalendarDays style={{ width: "13px", height: "13px", color: "var(--text-muted)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
                  {formatDateCompact(startDate)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {event.eventType === "online" ? (
                  <Video style={{ width: "13px", height: "13px", color: "var(--text-muted)" }} />
                ) : (
                  <MapPin style={{ width: "13px", height: "13px", color: "var(--text-muted)" }} />
                )}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
                  {locationText}
                </span>
              </div>
            </div>

            {/* Row 4 — Ticket code */}
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
              {reg.ticketCode}
            </p>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "16px",
                color: "var(--gold)",
              }}
            >
              Free
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--gold)",
                textAlign: "right",
                transition: "color 160ms ease",
              }}
              className="group-hover:underline"
            >
              View Ticket →
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main
      style={{
        background: "var(--bg-base)",
        minHeight: "100dvh",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Page Header */}
        <div>
          <span className="text-label">My Account</span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginTop: "6px",
              marginBottom: "4px",
            }}
          >
            My{" "}
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Registrations
            </em>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Your event bookings and tickets
          </p>
        </div>

        {registrations.length === 0 ? (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-dim)",
              borderRadius: "var(--radius-lg)",
              padding: "48px 24px",
              textAlign: "center",
              marginTop: "32px",
            }}
          >
            <Ticket
              style={{ width: "32px", height: "32px", color: "var(--text-muted)", margin: "0 auto" }}
            />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: "var(--text-primary)",
                marginTop: "12px",
              }}
            >
              No registrations yet
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>
              Events you register for will appear here.
            </p>
            <Link
              href="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "var(--gold)",
                color: "var(--text-inverse)",
                fontWeight: 600,
                fontSize: "14px",
                padding: "10px 24px",
                borderRadius: "var(--radius-md)",
                marginTop: "20px",
                textDecoration: "none",
                transition: "background 160ms ease",
              }}
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: "32px" }}>
            {upcoming.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--green)",
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-label" style={{ color: "var(--text-secondary)" }}>
                    Upcoming
                  </span>
                </div>
                <div>
                  {upcoming.map((reg) => (
                    <RegistrationCard key={reg._id.toString()} reg={reg} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section style={{ marginTop: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span className="text-label" style={{ color: "var(--text-muted)" }}>
                    Past Events
                  </span>
                </div>
                <div style={{ opacity: 0.7 }}>
                  {past.map((reg) => (
                    <RegistrationCard key={reg._id.toString()} reg={reg} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
