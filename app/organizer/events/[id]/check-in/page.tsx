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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link 
            href={`/organizer/events/${eventId}/attendees`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Event Check-in</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Main Input Component */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors ${
              status === "success" ? "bg-green-100 text-green-600" : 
              status === "error" ? "bg-red-100 text-red-600" : 
              "bg-primary/10 text-primary"
            }`}>
              {status === "loading" ? <Loader2 className="w-10 h-10 animate-spin" /> : <QrCode className="w-10 h-10" />}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan or Enter Code</h2>
            <p className="text-gray-500 mb-8">Enter the attendee's ticket code manually or use a scanner.</p>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                placeholder="DEV-XXXX-YYYY"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                autoFocus
                autoComplete="off"
                className="w-full text-center text-2xl font-mono tracking-widest uppercase py-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300"
              />
              <button
                type="submit"
                disabled={!ticketCode || status === "loading"}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all text-lg"
              >
                {status === "loading" ? "Validating..." : "Check In"}
              </button>
            </form>
          </div>

          {/* Feedback Area */}
          {(status === "success" || status === "error") && (
            <div className={`rounded-2xl p-6 border flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
              status === "success" ? "bg-green-50 border-green-100 text-green-800" : "bg-red-50 border-red-100 text-red-800"
            }`}>
              {status === "success" ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
              <div>
                <p className="font-bold text-lg">{status === "success" ? "Confirmed!" : "Verification Failed"}</p>
                <p className="font-medium opacity-90">{message}</p>
              </div>
            </div>
          )}

          {/* Last Result Card */}
          {lastCheckIn && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3">
                 <Ticket className="w-12 h-12 text-gray-50 opacity-10" />
              </div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Last Result</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-none mb-1">
                    {lastCheckIn.attendeeUserId?.name || "Unknown Attendee"}
                  </p>
                  <p className="text-sm text-gray-500">{lastCheckIn.attendeeUserId?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50">
                <span className="text-gray-500">Ticket Code</span>
                <span className="font-mono font-bold text-gray-900">{lastCheckIn.ticketCode}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helpful Hint (Mobile Only) */}
      <div className="p-6 text-center text-gray-400 text-sm mb-4">
        <p>Pro Tip: Use a Bluetooth barcode scanner for rapid entry.</p>
      </div>
    </div>
  );
}
