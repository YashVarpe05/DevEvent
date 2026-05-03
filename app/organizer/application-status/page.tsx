"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ApplicationData {
	status: "pending" | "under_review" | "approved" | "rejected";
	createdAt: string;
	adminNotes?: string;
}

export default function ApplicationStatusPage() {
	const router = useRouter();
	const { update } = useSession();
	const [application, setApplication] = useState<ApplicationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const res = await fetch("/api/organizer/application/me");
				if (res.status === 404) {
					router.push("/become-organizer");
					return;
				}
				if (!res.ok) {
					throw new Error("Failed to fetch application status");
				}
				const data = await res.json();
				setApplication(data);

				// If approved, trigger a session update to refresh organizerStatus in JWT
				if (data.status === "approved") {
					await update();
				}
			} catch (err) {
				setError("Could not load your application status.");
			} finally {
				setLoading(false);
			}
		};

		fetchStatus();
	}, [router, update]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	if (error || !application) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
				<div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full border border-gray-100">
					<div className="text-red-500 mb-4">
						<svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<h2 className="text-xl font-bold mb-2">Error</h2>
					<p className="text-gray-600 mb-6">{error || "Application not found"}</p>
					<Link href="/become-organizer" className="text-primary hover:underline font-medium">
						Return to Application Form
					</Link>
				</div>
			</div>
		);
	}

	const renderStatusCard = () => {
		switch (application.status) {
			case "approved":
				return (
					<div className="text-center">
						<div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">You're Approved!</h2>
						<p className="text-gray-600 mb-8">
							Welcome to the DevEvent Organizer community. You now have access to host and manage events.
						</p>
						<div className="space-y-3">
							<button
								onClick={() => router.push("/organizer/dashboard")}
								className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium"
							>
								Go to Organizer Dashboard
							</button>
							<p className="text-sm text-gray-500">
								Note: You may need to log out and log back in if you don't see your new dashboard right away.
							</p>
						</div>
					</div>
				);

			case "rejected":
				return (
					<div className="text-center">
						<div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
						<p className="text-gray-600 mb-6">
							Thank you for applying to be an organizer. Unfortunately, we cannot approve your application at this time.
						</p>
						{application.adminNotes && (
							<div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 text-left">
								<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Reason provided</span>
								<p className="text-gray-800 text-sm">{application.adminNotes}</p>
							</div>
						)}
						<Link href="/" className="inline-block border border-gray-300 bg-white text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition-colors font-medium">
							Return Home
						</Link>
					</div>
				);

			case "pending":
			case "under_review":
			default:
				return (
					<div className="text-center">
						<div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
						<p className="text-gray-600 mb-8">
							We've received your application and our team is currently reviewing it. This usually takes 24-48 hours.
						</p>

						<div className="relative pt-4 text-left">
							<div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
								<div 
									style={{ width: application.status === "under_review" ? "66%" : "33%" }} 
									className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
								></div>
							</div>
							<div className="flex justify-between text-xs text-gray-500 font-medium">
								<span className="text-blue-600">Submitted</span>
								<span className={application.status === "under_review" ? "text-blue-600" : ""}>In Review</span>
								<span>Decision</span>
							</div>
						</div>
						
						<p className="text-sm text-gray-500 mt-8">
							Applied on {new Date(application.createdAt).toLocaleDateString()}
						</p>
					</div>
				);
		}
	};

	return (
		<main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
			<div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-12">
				{renderStatusCard()}
			</div>
		</main>
	);
}
