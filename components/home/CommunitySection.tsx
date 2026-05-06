"use client";

import { LogoSlider } from "../ui/logo-slider";

const communities = [
	"FOSS United",
	"GDG India",
	"React India",
	"AWS UG",
	"Devfolio",
	"MLH",
	"CNCF"
];

export function CommunitySection() {
	// Map the strings into styled span nodes
	const logoNodes = communities.map((name, index) => (
		<span key={name} className="flex items-center">
			<span
				className="transition-colors duration-300 hover:opacity-100 cursor-default"
				style={{
					fontFamily: "var(--font-body)",
					fontSize: "12px",
					fontWeight: 500,
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					color: "var(--text-muted)",
					whiteSpace: "nowrap",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.color = "var(--gold)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.color = "var(--text-muted)";
				}}
			>
				{name}
			</span>
			{/* Separator */}
			<span
				style={{
					color: "var(--gold)",
					opacity: 0.4,
					margin: "0 20px",
					fontSize: "10px",
				}}
			>
				·
			</span>
		</span>
	));

	return (
		<section
			className="relative py-12 md:py-20 overflow-hidden"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			<div className="mx-auto max-w-7xl px-5 sm:px-6 text-center" style={{ marginBottom: "20px" }}>
				<p
					style={{
						fontSize: "10px",
						letterSpacing: "0.16em",
						textTransform: "uppercase",
						color: "var(--text-muted)",
						textAlign: "center",
					}}
				>
					Trusted by leading developer communities
				</p>
			</div>
			
			<div className="w-full relative flex items-center" style={{ height: "44px" }}>
				<LogoSlider
					logos={logoNodes}
					speed={40}
					direction="left"
					showBlur={true}
					blurLayers={8}
					pauseOnHover={true}
				/>
			</div>
		</section>
	);
}
