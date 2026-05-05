export function StatsBar() {
	const stats = [
		{ value: "500+", label: "Developers" },
		{ value: "50+", label: "Events Hosted" },
		{ value: "20+", label: "Cities" },
		{ value: "Free", label: "Always Open Source" },
	];

	return (
		<section
			className="w-full overflow-x-auto"
			style={{
				backgroundColor: "var(--bg-elevated)",
				borderTop: "1px solid var(--border)",
				borderBottom: "1px solid var(--border)",
			}}
		>
			<div className="mx-auto flex h-16 max-w-6xl items-center">
				{stats.map((stat, i) => (
					<div
						key={stat.label}
						className="flex flex-1 flex-col items-center justify-center gap-0.5 px-4"
						style={{
							borderLeft: i > 0 ? "1px solid var(--border)" : "none",
							minWidth: "140px",
						}}
					>
						<span
							className="font-mono text-[20px] font-semibold"
							style={{ color: "var(--accent)" }}
						>
							{stat.value}
						</span>
						<span
							className="text-[11px] font-medium uppercase tracking-wide whitespace-nowrap"
							style={{ color: "var(--text-muted)" }}
						>
							{stat.label}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
