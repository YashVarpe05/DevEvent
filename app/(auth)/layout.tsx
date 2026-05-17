import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<main
			style={{
				minHeight: "100dvh",
				background: "var(--bg-void)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "48px 16px",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,107,53,0.04) 0%, transparent 60%)",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<div style={{ zIndex: 10, position: "relative", width: "100%", maxWidth: "400px" }}>
				<Link
					href="/"
					style={{
						display: "flex",
						flexDirection: "row",
						gap: 0,
						justifyContent: "center",
						marginBottom: "32px",
					}}
				>
					<span
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "22px",
							color: "var(--text-primary)",
							fontStyle: "normal",
							fontWeight: 600,
						}}
					>
						Dev
					</span>
					<span
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "22px",
							color: "var(--gold)",
							fontStyle: "italic",
							fontWeight: 600,
						}}
					>
						Event
					</span>
				</Link>

				<div
					style={{
						background: "var(--bg-surface)",
						border: "1px solid var(--border-dim)",
						borderRadius: "var(--radius-xl)",
						padding: "32px",
					}}
				>
					{children}
				</div>
			</div>
		</main>
	);
}
