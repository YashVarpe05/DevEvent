import Link from "next/link";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/" className="inline-flex items-center gap-2">
						<span className="text-2xl font-bold italic text-primary">
							DevEvents
						</span>
					</Link>
				</div>
				<div className="glass card-shadow rounded-xl border border-dark-200 p-8">
					{children}
				</div>
			</div>
		</div>
	);
}
