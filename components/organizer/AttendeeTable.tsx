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
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ticket code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Attendee</th>
                <th className="px-6 py-4">Ticket Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No attendees found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((att) => (
                  <tr key={att._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{att.attendeeUserId?.name || "Unknown User"}</div>
                      <div className="text-gray-500">{att.attendeeUserId?.email || "No email provided"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs inline-block mb-1">
                        {att.ticketCode}
                      </div>
                      <div className="text-gray-500 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Booked {new Date(att.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {att.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 font-medium px-2.5 py-1 rounded-full text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      ) : att.checkedInAt ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full text-xs">
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {att.status === 'confirmed' && !att.checkedInAt && (
                        <button
                          onClick={() => handleManualCheckIn(att._id)}
                          className="text-primary hover:text-primary/80 font-medium bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors text-xs"
                        >
                          Check In Now
                        </button>
                      )}
                      {att.checkedInAt && (
                        <span className="text-gray-400 text-xs">
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
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-500">
          <p>Showing {filteredAttendees.length} of {totalExpected} records</p>
        </div>
      </div>
    </div>
  );
}
