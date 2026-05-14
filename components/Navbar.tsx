import { connection } from "next/server";
import { auth } from "@/lib/auth";
import NavbarShell from "./NavbarShell";

export default async function Navbar() {
	await connection();
	const session = await auth();

	const user = session?.user
		? {
				name: session.user.name || null,
				email: session.user.email || null,
				image: session.user.image || null,
				roles: session.user.roles || [],
				organizerStatus: session.user.organizerStatus || "not_applied",
			}
		: null;

	return <NavbarShell user={user} />;
}
