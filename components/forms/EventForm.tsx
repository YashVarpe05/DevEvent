"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { eventFormSchema, EventFormValues } from "@/lib/validations/event";
import { IEvent } from "@/database/event.model";
import { Save, AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";

type EventFormInput = z.input<typeof eventFormSchema>;

interface EventFormProps {
  initialData: Partial<IEvent> & { _id: string; startAt: string | Date; endAt: string | Date; status?: string };
}

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string, details?: string[] } | null>(null);

  // Format dates for datetime-local input
  const formatDateForInput = (dateObj: Date | string) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<EventFormInput, unknown, EventFormValues>({
    // [FIXED]: Align React Hook Form input/output generics with Zod coercion.
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData.title || "",
      shortDescription: initialData.shortDescription || "",
      description: initialData.description || "",
      eventType: initialData.eventType || "offline",
      timezone: initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      startAt: formatDateForInput(initialData.startAt),
      endAt: formatDateForInput(initialData.endAt),
      category: initialData.category || "",
      isAllDay: initialData.isAllDay || false,
      capacityType: initialData.capacityType || "unlimited",
      capacity: initialData.capacity || undefined,
      requiresApproval: initialData.requiresApproval ?? false,
      waitlistEnabled: initialData.waitlistEnabled ?? true,
      showGuestList: initialData.showGuestList ?? true,
      coHostEmails: (initialData.coHostEmails || []).join(", "),
      registrationQuestions: (initialData.registrationQuestions || []).map((q) => ({
        ...q,
        options: (q.options || []).join(", "),
      })),
      isPaid: initialData.isPaid || false,
      basePrice: initialData.basePrice || undefined,
      currency: initialData.currency || "USD",
      location: initialData.location || {},
      online: initialData.online || {},
    },
  });

  const eventType = watch("eventType");
  const isPaid = watch("isPaid");
  const capacityType = watch("capacityType");

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: "registrationQuestions" });
  const questionTypes = watch("registrationQuestions");

  const onSubmit = async (data: EventFormValues, action: "save" | "publish" = "save") => {
    if (action === "save") setIsSaving(true);
    else setIsPublishing(true);
    
    setMessage(null);

    try {
      const payload = {
        ...data,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
      };

      const res = await fetch(`/api/events/${initialData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to save event");
      }

      if (action === "publish") {
        await handlePublish();
      } else {
        setMessage({ type: "success", text: "Draft saved successfully" });
        router.refresh();
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "An error occurred";
      setMessage({ type: "error", text });
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/events/${initialData._id}/publish`, {
        method: "POST",
      });
      const result = await res.json();
      
      if (!res.ok) {
        let details: string[] = [];
        if (result.errors && Array.isArray(result.errors)) {
          details = result.errors.map((error: { message?: string }) => error.message || "Missing requirement");
        }
        setMessage({ type: "error", text: "Cannot publish event. Missing requirements:", details });
        return;
      }
      
      setMessage({ type: "success", text: "Event published successfully!" });
      setTimeout(() => {
        router.push("/organizer/events");
      }, 1500);
    } catch {
      setMessage({ type: "error", text: "Failed to publish event" });
    }
  };

  // ── Shared dark-theme styles (mirrors new-event form + MessageGuestsPanel) ──
  const sectionCardStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-xl)",
    padding: "24px",
  };
  const headingStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 16px 0",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: "6px",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--bg-base)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "14px",
    transition: "border-color 0.2s",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none" };
  const helperTextStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "4px",
  };
  const errorTextStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "var(--red)",
    marginTop: "4px",
  };
  const checkboxStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
    marginTop: "2px",
    accentColor: "var(--accent)",
    flexShrink: 0,
  };
  const checkboxLabelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-primary)",
  };
  const primaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 24px",
    background: "var(--accent)",
    color: "var(--bg-base)",
    fontWeight: 600,
    fontSize: "14px",
    border: "none",
    borderRadius: "var(--radius-md)",
    transition: "all 0.2s",
  };
  const secondaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 24px",
    background: "transparent",
    color: "var(--text-primary)",
    fontWeight: 500,
    fontSize: "14px",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
    transition: "all 0.2s",
  };
  // register() supplies its own onBlur; use onFocus + onBlurCapture so the
  // focus-border effect doesn't clobber react-hook-form's blur handling.
  const focusBorder = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.target.style.borderColor = "var(--accent)";
  };
  const blurBorder = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.target.style.borderColor = "var(--border-subtle)";
  };

  return (
    <form className="space-y-8 pb-24">
      {message && (
        <div
          className="flex items-start gap-3"
          style={{
            padding: "16px",
            borderRadius: "var(--radius-md)",
            background: message.type === "success" ? "rgba(42,157,111,0.1)" : "rgba(204,70,70,0.1)",
            border: `1px solid ${message.type === "success" ? "rgba(42,157,111,0.25)" : "rgba(204,70,70,0.25)"}`,
            color: message.type === "success" ? "var(--green)" : "var(--red)",
          }}
        >
          <div style={{ marginTop: "2px" }}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <p style={{ fontWeight: 500, margin: 0 }}>{message.text}</p>
            {message.details && message.details.length > 0 && (
              <ul className="mt-2 space-y-1 list-disc list-inside" style={{ fontSize: "14px" }}>
                {message.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* --- Section: Basic Information --- */}
      <div style={sectionCardStyle}>
        <h2 style={headingStyle}>Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              type="text"
              style={inputStyle}
              {...register("title")}
              onFocus={focusBorder}
              onBlurCapture={blurBorder}
            />
            {errors.title && <p style={errorTextStyle}>{errors.title.message}</p>}
          </div>

          <div>
            <label style={labelStyle}>Short Description *</label>
            <textarea
              rows={2}
              style={{ ...inputStyle, resize: "none" }}
              {...register("shortDescription")}
              onFocus={focusBorder}
              onBlurCapture={blurBorder}
            />
            {errors.shortDescription && <p style={errorTextStyle}>{errors.shortDescription.message}</p>}
          </div>

          <div>
            <label style={labelStyle}>Full Description</label>
            <textarea
              rows={6}
              style={{ ...inputStyle, resize: "vertical" }}
              {...register("description")}
              onFocus={focusBorder}
              onBlurCapture={blurBorder}
              placeholder="Detailed information about your event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Category</label>
              <input
                type="text"
                style={inputStyle}
                {...register("category")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
                placeholder="e.g., Technology, Design, Business"
              />
            </div>
            <div>
              <label style={labelStyle}>Event Type *</label>
              <select
                style={selectStyle}
                {...register("eventType")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
              >
                <option value="offline">In Person (Offline)</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section: Date & Time --- */}
      <div style={sectionCardStyle}>
        <h2 style={headingStyle}>Date &amp; Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Start Date &amp; Time *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              {...register("startAt")}
              onFocus={focusBorder}
              onBlurCapture={blurBorder}
            />
            {errors.startAt && <p style={errorTextStyle}>{errors.startAt.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>End Date &amp; Time *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              {...register("endAt")}
              onFocus={focusBorder}
              onBlurCapture={blurBorder}
            />
            {errors.endAt && <p style={errorTextStyle}>{errors.endAt.message}</p>}
          </div>
        </div>
      </div>

      {/* --- Section: Location --- */}
      {(eventType === "offline" || eventType === "hybrid") && (
        <div style={sectionCardStyle}>
          <h2 style={headingStyle}>Venue Location</h2>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Venue Name/Building</label>
              <input
                type="text"
                style={inputStyle}
                {...register("location.venueName")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>Address Line 1</label>
              <input
                type="text"
                style={inputStyle}
                {...register("location.addressLine1")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  style={inputStyle}
                  {...register("location.city")}
                  onFocus={focusBorder}
                  onBlurCapture={blurBorder}
                />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input
                  type="text"
                  style={inputStyle}
                  {...register("location.country")}
                  onFocus={focusBorder}
                  onBlurCapture={blurBorder}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Section: Online Meeting --- */}
      {(eventType === "online" || eventType === "hybrid") && (
        <div style={sectionCardStyle}>
          <h2 style={headingStyle}>Online Meeting Details</h2>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Platform (Zoom, Google Meet, etc.)</label>
              <input
                type="text"
                style={inputStyle}
                {...register("online.platform")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>Meeting URL</label>
              <input
                type="url"
                style={inputStyle}
                {...register("online.meetingUrl")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}

      {/* --- Section: Capacity & Registration --- */}
      <div style={sectionCardStyle}>
        <h2 style={headingStyle}>Capacity &amp; Registration</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Capacity</label>
              <select
                style={selectStyle}
                {...register("capacityType")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
              >
                <option value="unlimited">Unlimited</option>
                <option value="limited">Limited</option>
              </select>
            </div>
            {capacityType === "limited" && (
              <div>
                <label style={labelStyle}>Max Guests</label>
                <input
                  type="number"
                  min="1"
                  style={inputStyle}
                  {...register("capacity", { valueAsNumber: true })}
                  onFocus={focusBorder}
                  onBlurCapture={blurBorder}
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {capacityType === "limited" && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="waitlistEnabled"
                  style={checkboxStyle}
                  {...register("waitlistEnabled")}
                />
                <div>
                  <label htmlFor="waitlistEnabled" style={checkboxLabelStyle}>Enable waitlist</label>
                  <p style={helperTextStyle}>When the event is full, new guests join a waitlist and are confirmed automatically if spots open up.</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="requiresApproval"
                style={checkboxStyle}
                {...register("requiresApproval")}
              />
              <div>
                <label htmlFor="requiresApproval" style={checkboxLabelStyle}>Require approval</label>
                <p style={helperTextStyle}>Review and approve each registration before guests receive their ticket.</p>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Co-hosts</label>
              <input
                type="text"
                style={inputStyle}
                {...register("coHostEmails")}
                onFocus={focusBorder}
                onBlurCapture={blurBorder}
                placeholder="cohost1@example.com, cohost2@example.com"
              />
              <p style={helperTextStyle}>Co-hosts can view attendees, check in guests, approve registrations, and message guests. Separate emails with commas.</p>
              {errors.coHostEmails && <p style={errorTextStyle}>{(errors.coHostEmails as { message?: string }).message}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="showGuestList"
                style={checkboxStyle}
                {...register("showGuestList")}
              />
              <div>
                <label htmlFor="showGuestList" style={checkboxLabelStyle}>Show guest list</label>
                <p style={helperTextStyle}>Display attendee avatars and the &quot;going&quot; count on the public event page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section: Registration Questions --- */}
      <div style={sectionCardStyle}>
        <h2 style={{ ...headingStyle, marginBottom: "4px" }}>Registration Questions</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 16px 0" }}>Ask guests for extra info when they register — t-shirt size, dietary needs, company, etc.</p>

        <div className="space-y-4">
          {questionFields.map((field, index) => {
            const type = questionTypes?.[index]?.type || "text";
            return (
              <div
                key={field.id}
                className="space-y-3"
                style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "16px" }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label style={labelStyle}>Question</label>
                    <input
                      type="text"
                      style={inputStyle}
                      placeholder="e.g. What's your t-shirt size?"
                      {...register(`registrationQuestions.${index}.label`)}
                      onFocus={focusBorder}
                      onBlurCapture={blurBorder}
                    />
                    {errors.registrationQuestions?.[index]?.label && (
                      <p style={errorTextStyle}>{errors.registrationQuestions[index]?.label?.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="mt-7 p-2 transition-colors"
                    style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    aria-label="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label style={labelStyle}>Answer type</label>
                    <select
                      style={selectStyle}
                      {...register(`registrationQuestions.${index}.type`)}
                      onFocus={focusBorder}
                      onBlurCapture={blurBorder}
                    >
                      <option value="text">Short text</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                  {type === "select" && (
                    <div className="md:col-span-2">
                      <label style={labelStyle}>Options (comma separated)</label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="S, M, L, XL"
                        {...register(`registrationQuestions.${index}.options`)}
                        onFocus={focusBorder}
                        onBlurCapture={blurBorder}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`q-required-${index}`}
                    style={{ ...checkboxStyle, marginTop: 0 }}
                    {...register(`registrationQuestions.${index}.required`)}
                  />
                  <label htmlFor={`q-required-${index}`} style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Required</label>
                </div>

                <input type="hidden" {...register(`registrationQuestions.${index}.id`)} />
              </div>
            );
          })}

          {questionFields.length < 10 && (
            <button
              type="button"
              onClick={() =>
                appendQuestion({
                  id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
                  label: "",
                  type: "text",
                  required: false,
                  options: "",
                })
              }
              className="flex items-center gap-2 transition-colors"
              style={{
                padding: "10px 16px",
                border: "1px dashed var(--border-subtle)",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: 500,
                background: "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <Plus className="w-4 h-4" />
              Add question
            </button>
          )}
        </div>
      </div>

      {/* --- Section: Pricing --- */}
      <div style={sectionCardStyle}>
        <h2 style={headingStyle}>Pricing</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              style={{ ...checkboxStyle, marginTop: 0 }}
              {...register("isPaid")}
            />
            <label htmlFor="isPaid" style={checkboxLabelStyle}>This is a paid event</label>
          </div>

          {isPaid && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label style={labelStyle}>Ticket Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  {...register("basePrice", { valueAsNumber: true })}
                  onFocus={focusBorder}
                  onBlurCapture={blurBorder}
                />
              </div>
              <div>
                <label style={labelStyle}>Currency</label>
                <select
                  style={selectStyle}
                  {...register("currency")}
                  onFocus={focusBorder}
                  onBlurCapture={blurBorder}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-10"
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "save"))}
              disabled={isSaving || isPublishing}
              style={{
                ...secondaryButtonStyle,
                opacity: isSaving || isPublishing ? 0.5 : 1,
                cursor: isSaving || isPublishing ? "not-allowed" : "pointer",
              }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "publish"))}
              disabled={isSaving || isPublishing || initialData.status === "published"}
              style={{
                ...primaryButtonStyle,
                opacity: isSaving || isPublishing || initialData.status === "published" ? 0.5 : 1,
                cursor: isSaving || isPublishing || initialData.status === "published" ? "not-allowed" : "pointer",
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialData.status === "published" ? "Published" : (isPublishing ? "Publishing..." : "Publish Event")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
