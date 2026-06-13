"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Hourglass, UserCheck } from "lucide-react";

export type RegistrationQuestion = {
  id: string;
  label: string;
  type: "text" | "select" | "checkbox";
  required: boolean;
  options: string[];
};

type BookEventProps = {
  eventId: string;
  isLoggedIn: boolean;
  registrationStatus: "confirmed" | "waitlisted" | "pending_approval" | null;
  isPaid: boolean;
  basePrice: number | null;
  currency: string;
  capacity?: number;
  availableSpots?: number;
  waitlistEnabled?: boolean;
  requiresApproval?: boolean;
  questions?: RegistrationQuestion[];
};

export default function BookEvent({
  eventId,
  isLoggedIn,
  registrationStatus,
  isPaid,
  basePrice,
  currency,
  capacity,
  availableSpots,
  waitlistEnabled = true,
  requiresApproval = false,
  questions = [],
}: BookEventProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});

  const setAnswer = (id: string, value: string | boolean) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const isSoldOut = capacity !== undefined && availableSpots === 0;
  const isJoiningWaitlist = isSoldOut && waitlistEnabled && !registrationStatus;
  const isDisabled =
    isLoading ||
    registrationStatus === "waitlisted" ||
    registrationStatus === "pending_approval" ||
    (isSoldOut && !waitlistEnabled && !registrationStatus);

  const handleAction = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/events/${eventId}`);
      return;
    }

    if (registrationStatus === "confirmed") {
      router.push(`/my/registrations`);
      return;
    }

    if (registrationStatus) {
      // waitlisted / pending — nothing to do, button is disabled anyway
      return;
    }

    if (isPaid) {
      setError("Paid ticketing is not yet supported.");
      return;
    }

    // Client-side check for required questions before hitting the API
    for (const question of questions) {
      const value = answers[question.id];
      const isEmpty =
        value === undefined ||
        (typeof value === "string" && value.trim() === "") ||
        (question.type === "checkbox" && value !== true);
      if (question.required && isEmpty) {
        setError(`Please answer: ${question.label}`);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questions.length > 0 ? { answers } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to register");
      }

      if (data.status === "confirmed") {
        router.push("/my/registrations");
      } else {
        setNotice(data.message);
      }
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
    if (registrationStatus === "confirmed") return "View My Ticket";
    if (registrationStatus === "waitlisted") return "You're on the Waitlist";
    if (registrationStatus === "pending_approval") return "Pending Host Approval";
    if (isPaid) return `Buy Ticket - ${currency === "USD" ? "$" : currency}${basePrice}`;
    if (isSoldOut) return waitlistEnabled ? "Join the Waitlist" : "Sold Out";
    if (requiresApproval) return "Request to Join";
    return "Register for Free";
  };

  const ButtonIcon =
    registrationStatus === "waitlisted" || isJoiningWaitlist
      ? Hourglass
      : registrationStatus === "pending_approval" || requiresApproval
        ? UserCheck
        : Ticket;

  const showQuestions =
    questions.length > 0 && isLoggedIn && !registrationStatus && !isPaid &&
    !(isSoldOut && !waitlistEnabled);

  const questionInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    background: "var(--bg-base, rgba(0,0,0,0.25))",
    border: "1px solid var(--border-dim, rgba(255,255,255,0.12))",
    borderRadius: "var(--radius-sm, 6px)",
    color: "var(--text-primary)",
    fontSize: "13px",
    outline: "none",
  };

  return (
    <div className="flex flex-col gap-2">
      {showQuestions && (
        <div className="flex flex-col gap-3 mb-2">
          {questions.map((question) => (
            <div key={question.id}>
              {question.type === "checkbox" ? (
                <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "var(--text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={answers[question.id] === true}
                    onChange={(e) => setAnswer(question.id, e.target.checked)}
                    style={{ marginTop: "2px" }}
                  />
                  <span>
                    {question.label}
                    {question.required && <span style={{ color: "var(--gold)" }}> *</span>}
                  </span>
                </label>
              ) : (
                <>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    {question.label}
                    {question.required && <span style={{ color: "var(--gold)" }}> *</span>}
                  </label>
                  {question.type === "select" ? (
                    <select
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      style={{ ...questionInputStyle, appearance: "none" }}
                    >
                      <option value="">Select...</option>
                      {question.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => setAnswer(question.id, e.target.value)}
                      maxLength={500}
                      style={questionInputStyle}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleAction}
        disabled={isDisabled}
        className="w-full flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--gold)',
          color: 'var(--bg-void)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '16px 24px',
          borderRadius: 'var(--radius-sm, 6px)',
          border: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <ButtonIcon className="w-4 h-4" />
        {getButtonText()}
      </button>

      {requiresApproval && !registrationStatus && !isSoldOut && (
        <p style={{ fontSize: "12px", textAlign: "center", color: "var(--text-muted)" }}>
          The host reviews each registration before it&apos;s confirmed.
        </p>
      )}

      {error && <p style={{ fontSize: "12px", color: "#EF4444", textAlign: "center", fontWeight: 500 }}>{error}</p>}
      {notice && <p style={{ fontSize: "12px", color: "var(--gold)", textAlign: "center", fontWeight: 500 }}>{notice}</p>}

      {capacity !== undefined && availableSpots !== undefined && !registrationStatus && (
        <p style={{ fontSize: "12px", textAlign: "center", color: "var(--text-muted)", marginTop: "4px" }}>
          {availableSpots > 0 ? (
            <span style={{ color: availableSpots <= 10 ? "var(--gold)" : "inherit" }}>
              {availableSpots} {availableSpots === 1 ? "spot" : "spots"} remaining
            </span>
          ) : waitlistEnabled ? (
            <span style={{ color: "var(--gold)" }}>Event is full — waitlist open</span>
          ) : (
            <span style={{ color: "#EF4444" }}>Sold out</span>
          )}
        </p>
      )}
    </div>
  );
}
