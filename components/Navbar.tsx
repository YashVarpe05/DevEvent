import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { NavbarUserMenu } from "./NavbarUserMenu";

const Navbar = async () => {
	await connection();
	const session = await auth();

	return (
		<header>
			<nav>
				<Link href="/" className="logo">
					<Image src="/icons/logo.png" alt="logo" width={24} height={24} />
					<p>DevEvents</p>
				</Link>
				<ul>
					<Link href="/">Home</Link>
					<Link href="/events">Events</Link>
					{session?.user ? (
						<NavbarUserMenu user={session.user} />
					) : (
						<>
							<Link
								href="/login"
								className="text-light-100 hover:text-white transition-colors"
							>
								Login
							</Link>
							<Link
								href="/signup"
								className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors"
							>
								Sign Up
							</Link>
						</>
					)}
				</ul>
			</nav>
		</header>
	);
};

export default Navbar;
