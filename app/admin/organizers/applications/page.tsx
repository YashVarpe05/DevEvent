"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Application = {
	_id: string;
	user: {
		_id: string;
		name: string;
		email: string;
	};
	status: "pending" | "under_review" | "approved" | "rejected";
	whyOrganizing: string;
	pastEventsCount: number;
	expectedEventsPerMonth: number;
	primaryEventTypes: string[];
	ticketingIntent: string;
	createdAt: string;
};

export default function AdminApplicationsDashboard() {
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [filter, setFilter] = useState("pending");

	useEffect(() => {
		fetchApplications();
	}, [filter]);

	const fetchApplications = async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/admin/organizer-applications?status=${filter}`);
			if (res.ok) {
				const data = await res.json();
				setApplications(data);
			}
		} catch (error) {
			console.error("Failed to fetch applications", error);
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (id: string) => {
		if (!window.confirm("Are you sure you want to approve this application? The user will gain organizer access immediately.")) return;

		try {
			setActionLoading(id);
			const res = await fetch(`/api/admin/organizer-applications/${id}/approve`, {
				method: "POST",
			});

			if (res.ok) {
				// Remove the approved application from the local list if we're filtering for pending
				if (filter !== "all") {
					setApplications((prev) => prev.filter((app) => app._id !== id));
				} else {
					// Otherwise, just refresh the list
					fetchApplications();
				}
			} else {
				const error = await res.json();
				alert(error.error || "Failed to approve application");
			}
		} catch (error) {
			alert("An unexpected error occurred");
		} finally {
			setActionLoading(null);
		}
	};

	const handleReject = async (id: string, currentlyRejected: boolean = false) => {
		if (currentlyRejected) {
			alert("This application is already rejected.");
			return;
		}

		const reason = window.prompt("Reason for rejection (this will be sent to the user):");
		if (reason === null) return; // User cancelled

		try {
			setActionLoading(id);
			const res = await fetch(`/api/admin/organizer-applications/${id}/reject`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason: reason || "Does not meet community guidelines." }),
			});

			if (res.ok) {
				if (filter !== "all") {
					setApplications((prev) => prev.filter((app) => app._id !== id));
				} else {
					fetchApplications();
				}
			} else {
				const error = await res.json();
				alert(error.error || "Failed to reject application");
			}
		} catch (error) {
			alert("An unexpected error occurred");
		} finally {
			setActionLoading(null);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Organizer Applications</h1>
						<p className="text-gray-500 mt-1">Review and manage user requests to become event organizers.</p>
					</div>

					<div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
						{["all", "pending", "under_review", "approved", "rejected"].map((statusOption) => (
							<button
								key={statusOption}
								onClick={() => setFilter(statusOption)}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									filter === statusOption
										? "bg-gray-100 text-gray-900"
										: "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
								}`}
							>
								{statusOption.charAt(0).toUpperCase() + statusOption.slice(1).replace("_", " ")}
							</button>
						))}
					</div>
				</div>

				{loading ? (
					<div className="animate-pulse space-y-4">
						<div className="h-40 bg-gray-200 rounded-xl w-full"></div>
						<div className="h-40 bg-gray-200 rounded-xl w-full"></div>
					</div>
				) : applications.length === 0 ? (
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
						<svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
						<p className="text-gray-500">There are no {filter !== "all" ? filter : ""} applications to review right now.</p>
					</div>
				) : (
					<div className="space-y-6">
						{applications.map((app) => (
							<div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
								<div className="p-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-lg font-bold text-gray-900">{app.user.name}</h3>
											<p className="text-sm text-gray-500">{app.user.email}</p>
										</div>
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider
											${app.status === 'approved' ? 'bg-green-100 text-green-800' : 
												app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
												app.status === 'under_review' ? 'bg-blue-100 text-blue-800' : 
												'bg-yellow-100 text-yellow-800'}`}
										>
											{app.status.replace("_", " ")}
										</span>
									</div>

									<div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6">
										<div className="md:col-span-3 space-y-4 text-sm text-gray-700">
											<div>
												<span className="font-semibold text-gray-900 block mb-1">Why Organizing:</span>
												<p className="whitespace-pre-wrap">{app.whyOrganizing}</p>
											</div>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												<div>
													<span className="font-semibold text-gray-900 block">Past Events:</span>
													{app.pastEventsCount}
												</div>
												<div>
													<span className="font-semibold text-gray-900 block">Expected/Month:</span>
													{app.expectedEventsPerMonth}
												</div>
												<div>
													<span className="font-semibold text-gray-900 block">Ticketing:</span>
													{app.ticketingIntent.replace("_", " ")}
												</div>
											</div>
											<div>
												<span className="font-semibold text-gray-900 block mb-1">Event Types:</span>
												<div className="flex flex-wrap gap-2">
													{app.primaryEventTypes.map(type => (
														<span key={type} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{type}</span>
													))}
												</div>
											</div>
											<div className="text-xs text-gray-400 pt-2 flex items-center gap-4">
												<span>Applied: {new Date(app.createdAt).toLocaleString()}</span>
												<Link href={`/admin/users/${app.user._id}`} className="text-primary hover:underline">
													View User Profile
												</Link>
											</div>
										</div>

										<div className="md:col-span-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center space-y-3">
											{(app.status === "pending" || app.status === "under_review" || app.status === "rejected") && (
												<button
													onClick={() => handleApprove(app._id)}
													disabled={actionLoading === app._id}
													className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
												>
													{actionLoading === app._id ? "Approving..." : "Approve"}
												</button>
											)}
											
											{(app.status === "pending" || app.status === "under_review" || app.status === "approved") && (
												<button
													onClick={() => handleReject(app._id, app.status === 'rejected')}
													disabled={actionLoading === app._id}
													className="w-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
												>
													{actionLoading === app._id ? "Rejecting..." : "Reject"}
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
