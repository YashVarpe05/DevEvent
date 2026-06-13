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

  return (
    <form className="space-y-8 pb-24">
      {message && (
        <div className={`p-4 rounded-md flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="mt-0.5">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-medium">{message.text}</p>
            {message.details && message.details.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                {message.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* --- Section: Basic Information --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              {...register("title")}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:ring-primary focus:border-primary"
              {...register("shortDescription")}
            />
            {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              {...register("description")}
              placeholder="Detailed information about your event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                {...register("category")}
                placeholder="e.g., Technology, Design, Business"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-primary focus:border-primary"
                {...register("eventType")}
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
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Date & Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              {...register("startAt")}
            />
            {errors.startAt && <p className="mt-1 text-sm text-red-600">{errors.startAt.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              {...register("endAt")}
            />
            {errors.endAt && <p className="mt-1 text-sm text-red-600">{errors.endAt.message}</p>}
          </div>
        </div>
      </div>

      {/* --- Section: Location --- */}
      {(eventType === "offline" || eventType === "hybrid") && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Venue Location</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name/Building</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                {...register("location.venueName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                {...register("location.addressLine1")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  {...register("location.city")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  {...register("location.country")}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Section: Online Meeting --- */}
      {(eventType === "online" || eventType === "hybrid") && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Online Meeting Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform (Zoom, Google Meet, etc.)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                {...register("online.platform")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting URL</label>
              <input
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                {...register("online.meetingUrl")}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}

      {/* --- Section: Capacity & Registration --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Capacity & Registration</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-primary focus:border-primary"
                {...register("capacityType")}
              >
                <option value="unlimited">Unlimited</option>
                <option value="limited">Limited</option>
              </select>
            </div>
            {capacityType === "limited" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  {...register("capacity", { valueAsNumber: true })}
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
                  className="w-4 h-4 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded"
                  {...register("waitlistEnabled")}
                />
                <div>
                  <label htmlFor="waitlistEnabled" className="text-sm font-medium text-gray-700">Enable waitlist</label>
                  <p className="text-xs text-gray-500">When the event is full, new guests join a waitlist and are confirmed automatically if spots open up.</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="requiresApproval"
                className="w-4 h-4 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded"
                {...register("requiresApproval")}
              />
              <div>
                <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">Require approval</label>
                <p className="text-xs text-gray-500">Review and approve each registration before guests receive their ticket.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Co-hosts</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                {...register("coHostEmails")}
                placeholder="cohost1@example.com, cohost2@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Co-hosts can view attendees, check in guests, approve registrations, and message guests. Separate emails with commas.</p>
              {errors.coHostEmails && <p className="mt-1 text-sm text-red-600">{(errors.coHostEmails as { message?: string }).message}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="showGuestList"
                className="w-4 h-4 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded"
                {...register("showGuestList")}
              />
              <div>
                <label htmlFor="showGuestList" className="text-sm font-medium text-gray-700">Show guest list</label>
                <p className="text-xs text-gray-500">Display attendee avatars and the &quot;going&quot; count on the public event page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section: Registration Questions --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Registration Questions</h2>
        <p className="text-sm text-gray-500 mb-4">Ask guests for extra info when they register — t-shirt size, dietary needs, company, etc.</p>

        <div className="space-y-4">
          {questionFields.map((field, index) => {
            const type = questionTypes?.[index]?.type || "text";
            return (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g. What's your t-shirt size?"
                      {...register(`registrationQuestions.${index}.label`)}
                    />
                    {errors.registrationQuestions?.[index]?.label && (
                      <p className="mt-1 text-sm text-red-600">{errors.registrationQuestions[index]?.label?.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="mt-7 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer type</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
                      {...register(`registrationQuestions.${index}.type`)}
                    >
                      <option value="text">Short text</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                  {type === "select" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        placeholder="S, M, L, XL"
                        {...register(`registrationQuestions.${index}.options`)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`q-required-${index}`}
                    className="w-4 h-4 text-primary border-gray-300 rounded"
                    {...register(`registrationQuestions.${index}.required`)}
                  />
                  <label htmlFor={`q-required-${index}`} className="text-sm text-gray-700">Required</label>
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
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-md hover:border-gray-400 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add question
            </button>
          )}
        </div>
      </div>

      {/* --- Section: Pricing --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              {...register("isPaid")}
            />
            <label htmlFor="isPaid" className="text-sm font-medium text-gray-700">This is a paid event</label>
          </div>
          
          {isPaid && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  {...register("basePrice", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
                  {...register("currency")}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "save"))}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "publish"))}
              disabled={isSaving || isPublishing || initialData.status === "published"}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-gray-400"
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
