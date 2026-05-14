"use client";

import React, { useState } from "react";
import { Download, Search, CheckCircle, XCircle, Clock } from "lucide-react";

type AttendeeTableProps = {
  eventId: string;
  initialAttendees: any[];
  totalExpected: number;
};

export default function AttendeeTable({ eventId, initialAttendees, totalExpected }: AttendeeTableProps) {
  const [attendees, setAttendees] = useState(initialAttendees);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Simplified local filtering for demo purposes. 
  // In production with large datasets, this should trigger a new fetch to the paginated API
  const filteredAttendees = attendees.filter((att) => {
    const matchesSearch = 
      att.attendeeUserId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      att.attendeeUserId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      att.ticketCode?.toLowerCase().includes(search.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (filter === "confirmed") return att.status === "confirmed";
    if (filter === "cancelled") return att.status === "cancelled";
    if (filter === "checked-in") return !!att.checkedInAt;
    
    return true;
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/attendees/export`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-${eventId}-attendees.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export attendees");
    } finally {
      setIsExporting(false);
    }
  };

  const handleManualCheckIn = async (registrationId: string) => {
    try {
      const res = await fetch(`/api/organizer/registrations/${registrationId}/check-in`, {
        method: "POST",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      const data = await res.json();
      
      // Update local state
      setAttendees(attendees.map(att => 
        att._id === registrationId 
          ? { ...att, checkedInAt: data.registration.checkedInAt } 
          : att
      ));
    } catch (error: any) {
      alert(error.message || "Failed to check in attendee");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", '@media (min-width: 640px)': { flexDirection: "row", alignItems: "center", justifyContent: "space-between" } } as any}>
        <div style={{ flex: 1, display: "flex", gap: "16px", width: "100%", flexDirection: "column", '@media (min-width: 640px)': { flexDirection: "row" } } as any}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by name, email, or ticket code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 16px 10px 40px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "10px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s", appearance: "none" }}
            onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="checked-in">Checked In</option>
          </select>
        </div>
        
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", color: "var(--text-primary)", padding: "10px 16px", borderRadius: "var(--radius-md)", fontWeight: 500, transition: "all 0.2s", cursor: isExporting ? "not-allowed" : "pointer", opacity: isExporting ? 0.5 : 1 }}
          onMouseEnter={(e) => { if (!isExporting) e.currentTarget.style.borderColor = "var(--text-muted)"; }}
          onMouseLeave={(e) => { if (!isExporting) e.currentTarget.style.borderColor = "var(--border-dim)"; }}
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Table Area */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "14px", whiteSpace: "nowrap", borderCollapse: "collapse" }}>
            <thead style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border-dim)", color: "var(--text-secondary)", fontWeight: 500 }}>
              <tr>
                <th style={{ padding: "16px 24px", fontWeight: 500 }}>Attendee</th>
                <th style={{ padding: "16px 24px", fontWeight: 500 }}>Ticket Details</th>
                <th style={{ padding: "16px 24px", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "16px 24px", fontWeight: 500, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                    No attendees found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((att) => (
                  <tr key={att._id} style={{ borderBottom: "1px solid var(--border-dim)", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{att.attendeeUserId?.name || "Unknown User"}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{att.attendeeUserId?.email || "No email provided"}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontFamily: "monospace", color: "var(--gold)", background: "var(--gold-dim)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", display: "inline-block", marginBottom: "4px" }}>
                        {att.ticketCode}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock className="w-3 h-3" />
                        Booked {new Date(att.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {att.status === 'cancelled' ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(239, 68, 68, 0.1)", color: "var(--red)", fontWeight: 500, padding: "4px 10px", borderRadius: "9999px", fontSize: "12px" }}>
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      ) : att.checkedInAt ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(34, 197, 94, 0.1)", color: "var(--green)", fontWeight: 500, padding: "4px 10px", borderRadius: "9999px", fontSize: "12px" }}>
                          <CheckCircle className="w-3.5 h-3.5" /> Checked In
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontWeight: 500, padding: "4px 10px", borderRadius: "9999px", fontSize: "12px" }}>
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      {att.status === 'confirmed' && !att.checkedInAt && (
                        <button
                          onClick={() => handleManualCheckIn(att._id)}
                          style={{ color: "var(--gold)", background: "var(--gold-dim)", border: "none", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontWeight: 500, fontSize: "12px", cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "#000"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--gold-dim)"; e.currentTarget.style.color = "var(--gold)"; }}
                        >
                          Check In Now
                        </button>
                      )}
                      {att.checkedInAt && (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                          {new Date(att.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Footer Pagination area (mocked for demo) */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", borderTop: "1px solid var(--border-dim)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" }}>
          <p style={{ margin: 0 }}>Showing {filteredAttendees.length} of {totalExpected} records</p>
        </div>
      </div>
    </div>
  );
}
