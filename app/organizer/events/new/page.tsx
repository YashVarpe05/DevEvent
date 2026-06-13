"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Globe, MapPin, Video } from "lucide-react";

// Minimal schema to initialize a draft
const newEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(250),
  eventType: z.enum(["online", "offline", "hybrid"]),
  timezone: z.string().min(1, "Timezone is required"),
  startAt: z.string().min(1, "Start time is required"),
  endAt: z.string().min(1, "End time is required"),
  repeat: z.enum(["none", "weekly", "biweekly", "monthly"]).default("none"),
  occurrences: z.coerce.number().int().min(2).max(12).default(4),
}).refine((data) => new Date(data.startAt) < new Date(data.endAt), {
  message: "End time must be after start time",
  path: ["endAt"],
});

type NewEventFormValues = z.infer<typeof newEventSchema>;
type NewEventFormInput = z.input<typeof newEventSchema>;

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewEventFormInput, unknown, NewEventFormValues>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      eventType: "offline",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startAt: "",
      endAt: "",
      repeat: "none",
      occurrences: 4,
    },
  });

  const eventType = watch("eventType");
  const repeat = watch("repeat");

  const onSubmit = async (data: NewEventFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startAt: new Date(data.startAt).toISOString(),
          endAt: new Date(data.endAt).toISOString(),
          recurrence:
            data.repeat !== "none"
              ? { frequency: data.repeat, count: data.occurrences }
              : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create event");
      }

      // Redirect to the full editor
      router.push(`/organizer/events/${result.event._id}/edit`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "48px 0" }}>
      <div style={{ maxWidth: "672px", margin: "0 auto", padding: "0 16px" }}>
        <Link 
          href="/organizer/events" 
          style={{ display: "inline-flex", alignItems: "center", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "24px", transition: "color 0.2s", textDecoration: "none" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
        >
          <ArrowLeft style={{ width: "16px", height: "16px", marginRight: "4px" }} />
          Back to Events
        </Link>
        
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", overflow: "hidden" }}>
          <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border-dim)", background: "var(--bg-elevated)" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 4px 0" }}>Create New Event</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
              Let's start with the basics. You can add more details later.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {error && (
              <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "rgba(239, 68, 68, 0.1)", color: "var(--red)", fontSize: "14px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Event Type Options */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>Event Type <span style={{color: "var(--gold)"}}>*</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
                  <div 
                    onClick={() => setValue("eventType", "offline")}
                    style={{
                      cursor: "pointer", border: `1px solid ${eventType === 'offline' ? 'var(--gold)' : 'var(--border-dim)'}`, borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "all 0.2s",
                      background: eventType === 'offline' ? 'rgba(255,107,53, 0.05)' : 'var(--bg-base)'
                    }}
                    onMouseEnter={(e) => { if(eventType !== 'offline') e.currentTarget.style.borderColor = "var(--text-muted)" }}
                    onMouseLeave={(e) => { if(eventType !== 'offline') e.currentTarget.style.borderColor = "var(--border-dim)" }}
                  >
                    <MapPin style={{ width: "24px", height: "24px", color: eventType === 'offline' ? 'var(--gold)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: eventType === 'offline' ? 'var(--gold)' : 'var(--text-primary)' }}>In Person</span>
                  </div>
                  <div 
                    onClick={() => setValue("eventType", "online")}
                    style={{
                      cursor: "pointer", border: `1px solid ${eventType === 'online' ? 'var(--gold)' : 'var(--border-dim)'}`, borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "all 0.2s",
                      background: eventType === 'online' ? 'rgba(255,107,53, 0.05)' : 'var(--bg-base)'
                    }}
                    onMouseEnter={(e) => { if(eventType !== 'online') e.currentTarget.style.borderColor = "var(--text-muted)" }}
                    onMouseLeave={(e) => { if(eventType !== 'online') e.currentTarget.style.borderColor = "var(--border-dim)" }}
                  >
                    <Video style={{ width: "24px", height: "24px", color: eventType === 'online' ? 'var(--gold)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: eventType === 'online' ? 'var(--gold)' : 'var(--text-primary)' }}>Online</span>
                  </div>
                  <div 
                    onClick={() => setValue("eventType", "hybrid")}
                    style={{
                      cursor: "pointer", border: `1px solid ${eventType === 'hybrid' ? 'var(--gold)' : 'var(--border-dim)'}`, borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "all 0.2s",
                      background: eventType === 'hybrid' ? 'rgba(255,107,53, 0.05)' : 'var(--bg-base)'
                    }}
                    onMouseEnter={(e) => { if(eventType !== 'hybrid') e.currentTarget.style.borderColor = "var(--text-muted)" }}
                    onMouseLeave={(e) => { if(eventType !== 'hybrid') e.currentTarget.style.borderColor = "var(--border-dim)" }}
                  >
                    <Globe style={{ width: "24px", height: "24px", color: eventType === 'hybrid' ? 'var(--gold)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: eventType === 'hybrid' ? 'var(--gold)' : 'var(--text-primary)' }}>Hybrid</span>
                  </div>
                </div>
                <input type="hidden" {...register("eventType")} />
              </div>

              <div>
                <label htmlFor="title" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Event Title <span style={{color: "var(--gold)"}}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="E.g., Global Tech Summit 2026"
                  style={{ width: "100%", padding: "10px 14px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
                  onBlurCapture={(e) => e.target.style.borderColor = "var(--border-dim)"}
                  {...register("title")}
                />
                {errors.title && <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.title.message}</p>}
              </div>

              <div>
                <label htmlFor="shortDescription" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Short Description <span style={{color: "var(--gold)"}}>*</span> <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Summary for cards)</span>
                </label>
                <textarea
                  id="shortDescription"
                  rows={2}
                  placeholder="A quick summary of what this event is about..."
                  style={{ width: "100%", padding: "10px 14px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s", resize: "none" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
                  onBlurCapture={(e) => e.target.style.borderColor = "var(--border-dim)"}
                  {...register("shortDescription")}
                />
                {errors.shortDescription && <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.shortDescription.message}</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label htmlFor="startAt" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    Start Date & Time <span style={{color: "var(--gold)"}}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="startAt"
                      type="datetime-local"
                      style={{ width: "100%", padding: "10px 14px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s" }}
                      onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
                      onBlurCapture={(e) => e.target.style.borderColor = "var(--border-dim)"}
                      {...register("startAt")}
                    />
                  </div>
                  {errors.startAt && <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.startAt.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="endAt" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    End Date & Time <span style={{color: "var(--gold)"}}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="endAt"
                      type="datetime-local"
                      style={{ width: "100%", padding: "10px 14px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s" }}
                      onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
                      onBlurCapture={(e) => e.target.style.borderColor = "var(--border-dim)"}
                      {...register("endAt")}
                    />
                  </div>
                  {errors.endAt && <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.endAt.message}</p>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: repeat !== "none" ? "1fr 1fr" : "1fr", gap: "16px" }}>
                <div>
                  <label htmlFor="repeat" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    Repeat
                  </label>
                  <select
                    id="repeat"
                    style={{ width: "100%", padding: "10px 14px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}
                    {...register("repeat")}
                  >
                    <option value="none">Does not repeat</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {repeat !== "none" && (
                  <div>
                    <label htmlFor="occurrences" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      Number of events (2–12)
                    </label>
                    <input
                      id="occurrences"
                      type="number"
                      min={2}
                      max={12}
                      style={{ width: "100%", padding: "10px 14px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}
                      {...register("occurrences")}
                    />
                    {errors.occurrences && <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.occurrences.message}</p>}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="timezone" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Timezone <span style={{color: "var(--gold)"}}>*</span>
                </label>
                <select
                  id="timezone"
                  style={{ width: "100%", padding: "10px 14px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
                  onBlurCapture={(e) => e.target.style.borderColor = "var(--border-dim)"}
                  {...register("timezone")}
                >
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone} (Current)
                  </option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Central Europe (CET/CEST)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Calcutta">India (IST)</option>
                  <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                </select>
                {errors.timezone && <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.timezone.message}</p>}
              </div>
            </div>

            <div style={{ paddingTop: "24px", borderTop: "1px solid var(--border-dim)", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <Link
                href="/organizer/events"
                style={{ padding: "10px 24px", border: "1px solid var(--border-dim)", color: "var(--text-primary)", fontWeight: 500, borderRadius: "var(--radius-md)", background: "transparent", transition: "all 0.2s", textDecoration: "none" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "10px 24px", background: "var(--gold)", color: "#000", fontWeight: 600, borderRadius: "var(--radius-md)", border: "none", display: "flex", alignItems: "center", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "all 0.2s", boxShadow: isSubmitting ? "none" : "0 0 16px rgba(255,107,53, 0.2)"
                }}
                onMouseEnter={(e) => { if(!isSubmitting) { e.currentTarget.style.boxShadow = "0 0 24px rgba(255,107,53, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; } }}
                onMouseLeave={(e) => { if(!isSubmitting) { e.currentTarget.style.boxShadow = "0 0 16px rgba(255,107,53, 0.2)"; e.currentTarget.style.transform = "scale(1)"; } }}
              >
                {isSubmitting ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite", marginLeft: "-4px", marginRight: "8px", height: "16px", width: "16px", color: "#000" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Draft...
                  </>
                ) : (
                  "Create Event Draft"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
