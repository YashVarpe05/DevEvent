"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function CancelRegistrationButton({ registrationId }: { registrationId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel registration");
      }
      
      router.refresh();
      setConfirming(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900">Are you sure?</h4>
            <p className="text-sm text-red-700 mt-1">
              Cancelling your registration cannot be undone. If you cancel, you will free up your spot for someone else.
            </p>
          </div>
        </div>
        
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        
        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={() => setConfirming(false)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-colors border-transparent"
          >
            Keep Ticket
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-70 rounded-lg transition-colors shadow-sm"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      Cancel Registration
    </button>
  );
}
