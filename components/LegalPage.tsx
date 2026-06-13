import React from "react";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

type LegalPageProps = {
	title: string;
	lastUpdated?: string;
	intro?: string;
	children: React.ReactNode;
};

// Shared shell for policy pages — consistent typography and width.
export default function LegalPage({ title, lastUpdated = LEGAL.lastUpdated, intro, children }: LegalPageProps) {
	return (
		<main className="min-h-screen bg-bg-base pt-28 pb-24 px-6">
			<article className="max-w-[760px] mx-auto">
				<Link
					href="/"
					className="font-mono text-[11px] uppercase tracking-widest text-text-secondary hover:text-accent transition-colors"
				>
					← Back to DevEvent
				</Link>

				<h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mt-6 mb-3">
					{title}
				</h1>
				<p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-8">
					Last updated: {lastUpdated}
				</p>

				{intro && (
					<p className="text-[15px] leading-[1.8] text-text-primary/80 mb-8">{intro}</p>
				)}

				<div className="legal-prose flex flex-col gap-7">{children}</div>

				<div className="mt-14 pt-8 border-t border-border-subtle">
					<p className="text-[14px] leading-[1.8] text-text-secondary">
						Questions about this policy? Contact us at{" "}
						<a href={`mailto:${LEGAL.supportEmail}`} className="text-accent hover:text-accent-hover">
							{LEGAL.supportEmail}
						</a>
						.
					</p>
				</div>
			</article>
		</main>
	);
}

// Section heading + body helpers keep the three policies visually identical.
export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
	return (
		<section>
			<h2 className="font-display text-xl font-bold text-text-primary mb-3">{heading}</h2>
			<div className="flex flex-col gap-3 text-[15px] leading-[1.8] text-text-primary/80">
				{children}
			</div>
		</section>
	);
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
	return (
		<ul className="flex flex-col gap-2 pl-5 list-disc marker:text-accent">
			{items.map((item, i) => (
				<li key={i} className="text-[15px] leading-[1.7] text-text-primary/80">
					{item}
				</li>
			))}
		</ul>
	);
}
