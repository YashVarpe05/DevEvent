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
}).refine((data) => new Date(data.startAt) < new Date(data.endAt), {
  message: "End time must be after start time",
  path: ["endAt"],
});

type NewEventFormValues = z.infer<typeof newEventSchema>;

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
  } = useForm<NewEventFormValues>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      eventType: "offline",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startAt: "",
      endAt: "",
    },
  });

  const eventType = watch("eventType");

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
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/organizer/events" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Events
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-500 text-sm mt-1">
              Let's start with the basics. You can add more details later.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-6">
            {error && (
              <div className="p-4 rounded-md bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Event Type Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div 
                    onClick={() => setValue("eventType", "offline")}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                      eventType === 'offline' 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className={`w-6 h-6 ${eventType === 'offline' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${eventType === 'offline' ? 'text-primary' : 'text-gray-700'}`}>In Person</span>
                  </div>
                  <div 
                    onClick={() => setValue("eventType", "online")}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                      eventType === 'online' 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Video className={`w-6 h-6 ${eventType === 'online' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${eventType === 'online' ? 'text-primary' : 'text-gray-700'}`}>Online</span>
                  </div>
                  <div 
                    onClick={() => setValue("eventType", "hybrid")}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                      eventType === 'hybrid' 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Globe className={`w-6 h-6 ${eventType === 'hybrid' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${eventType === 'hybrid' ? 'text-primary' : 'text-gray-700'}`}>Hybrid</span>
                  </div>
                </div>
                <input type="hidden" {...register("eventType")} />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="E.g., Global Tech Summit 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
                  {...register("title")}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description * <span className="text-gray-400 font-normal">(Summary for cards)</span>
                </label>
                <textarea
                  id="shortDescription"
                  rows={2}
                  placeholder="A quick summary of what this event is about..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
                  {...register("shortDescription")}
                />
                {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time *
                  </label>
                  <div className="relative">
                    <input
                      id="startAt"
                      type="datetime-local"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
                      {...register("startAt")}
                    />
                  </div>
                  {errors.startAt && <p className="mt-1 text-sm text-red-600">{errors.startAt.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time *
                  </label>
                  <div className="relative">
                    <input
                      id="endAt"
                      type="datetime-local"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
                      {...register("endAt")}
                    />
                  </div>
                  {errors.endAt && <p className="mt-1 text-sm text-red-600">{errors.endAt.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone *
                </label>
                <select
                  id="timezone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
                  {...register("timezone")}
                >
                  {/* Just using the client timezone as default, providing a few common ones for demo */}
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
                {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Link
                href="/organizer/events"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
