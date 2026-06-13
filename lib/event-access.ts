import type { Session } from "next-auth";

type ManageableEvent = {
	organizerId: { toString(): string };
	coHostEmails?: string[];
};

// Owner, platform admin, or co-host (matched by account email).
// Co-hosts can run the event day-of: view attendees, check in guests,
// approve/decline registrations, and message guests. They cannot edit
// the event itself or touch payouts.
export function canManageEvent(
	event: ManageableEvent,
	session: Session | null,
): boolean {
	if (!session?.user?.id) return false;
	if (session.user.roles?.includes("admin")) return true;
	if (event.organizerId.toString() === session.user.id) return true;

	const email = session.user.email?.toLowerCase();
	if (email && event.coHostEmails?.some((coHost) => coHost.toLowerCase() === email)) {
		return true;
	}
	return false;
}
