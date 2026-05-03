"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";

type BookEventProps = {
  eventId: string;
  isLoggedIn: boolean;
  isRegistered: boolean;
  isPaid: boolean;
  basePrice: number | null;
  currency: string;
  capacity?: number;
  availableSpots?: number;
};

export default function BookEvent({
  eventId,
  isLoggedIn,
  isRegistered,
  isPaid,
  basePrice,
  currency,
  capacity,
  availableSpots,
}: BookEventProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?callbackUrl=/events/${eventId}`);
      return;
    }

    if (isRegistered) {
      router.push(`/my/registrations`);
      return;
    }

    if (isPaid) {
      // Future feature
      setError("Paid ticketing is not yet supported.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to register");
      }
      
      // Successfully registered, redirect to registrations
      router.push("/my/registrations");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (!isLoggedIn) return "Log in to Register";
    if (isRegistered) return "View My Ticket";
    if (isPaid) return `Buy Ticket - ${currency === "USD" ? "$" : currency}${basePrice}`;
    return "Register for Free";
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAction}
        disabled={isLoading || (capacity !== undefined && availableSpots === 0 && !isRegistered)}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 text-lg"
      >
        <Ticket className="w-5 h-5" />
        {getButtonText()}
      </button>
      
      {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
      
      {capacity !== undefined && availableSpots !== undefined && !isRegistered && (
        <p className="text-sm text-center text-gray-500 font-medium pb-1">
          {availableSpots > 0 ? (
            <span className={availableSpots <= 10 ? "text-amber-600" : ""}>
              {availableSpots} {availableSpots === 1 ? "spot" : "spots"} remaining
            </span>
          ) : (
            <span className="text-red-500">Sold out</span>
          )}
        </p>
      )}
    </div>
  );
}
