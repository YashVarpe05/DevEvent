"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { eventFormSchema, EventFormValues } from "@/lib/validations/event";
import { IEvent } from "@/database/event.model";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

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
      isPaid: initialData.isPaid || false,
      basePrice: initialData.basePrice || undefined,
      currency: initialData.currency || "USD",
      location: initialData.location || {},
      online: initialData.online || {},
    },
  });

  const eventType = watch("eventType");
  const isPaid = watch("isPaid");

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
