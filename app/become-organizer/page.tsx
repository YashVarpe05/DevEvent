import BecomeOrganizerForm from "@/components/BecomeOrganizerForm";

export const metadata = {
	title: "Become an Organizer | DevEvent",
	description: "Apply to become an event organizer on DevEvent.",
};

export default function BecomeOrganizerPage() {
	return (
		<main className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-1 space-y-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Build Your Community</h1>
							<p className="text-gray-600">
								Join thousands of organizers hosting high-quality tech events around the world.
							</p>
						</div>

						<div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
							<h3 className="font-semibold text-blue-900 mb-2">Why we verify organizers</h3>
							<p className="text-sm text-blue-800">
								To maintain a high-quality experience for attendees, we review all new organizer applications. This helps us prevent spam and ensures all events meet our community guidelines.
							</p>
							<p className="text-sm text-blue-800 mt-2 font-medium">
								Applications are typically reviewed within 48 hours.
							</p>
						</div>

						{/* Benefits List */}
						<ul className="space-y-4 pt-4 border-t border-gray-200">
							<li className="flex gap-3 text-sm text-gray-700">
								<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Host unlimited free events
							</li>
							<li className="flex gap-3 text-sm text-gray-700">
								<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Access community-building tools
							</li>
							<li className="flex gap-3 text-sm text-gray-700">
								<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Analytics and attendee insights
							</li>
							<li className="flex gap-3 text-sm text-gray-700">
								<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Paid ticketing (coming soon)
							</li>
						</ul>
					</div>

					<div className="md:col-span-2">
						<BecomeOrganizerForm />
					</div>
				</div>
			</div>
		</main>
	);
}
