"use client";

import Marquee from "../components/Marquee";

const communities = [
	"FOSS United",
	"GDG India",
	"ReactJS India",
	"MLH",
	"AWS UG",
	"DevFolio",
	"GitHub India",
	"Women Who Code",
	"HackerEarth",
	"Hasgeek",
	"JSConf India",
	"TensorFlow User Group",
] as const;

export default function CommunityMarquee() {
	return (
		<section className="community-marquee">
			<style>{communityMarqueeStyles}</style>
			<div className="community-marquee__inner">
				<p className="community-marquee__label">
					TRUSTED BY LEADING DEVELOPER COMMUNITIES
				</p>
			</div>

			<div className="community-marquee__strip">
				<div className="community-marquee__fade community-marquee__fade--left" />
				<div className="community-marquee__fade community-marquee__fade--right" />

				<Marquee speed={50}>
					<div className="community-marquee__items">
						{communities.map((name) => (
							<span key={name} className="community-marquee__item">
								<span className="community-marquee__name">{name}</span>
								<span className="community-marquee__dot">●</span>
							</span>
						))}
					</div>
				</Marquee>
			</div>
		</section>
	);
}

const communityMarqueeStyles = `
	.community-marquee {
		width: 100%;
		padding: 64px 0;
		background: var(--bg-base, #0A0A0B);
		border-bottom: 1px solid var(--border-dim, #1F1F23);
		overflow: hidden;
	}

	.community-marquee__inner {
		width: min(100%, 1440px);
		margin: 0 auto 32px;
		padding: 0 24px;
	}

	.community-marquee__label {
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.15em;
		line-height: 1.4;
		text-align: center;
		text-transform: uppercase;
	}

	.community-marquee__strip {
		position: relative;
		width: 100%;
	}

	.community-marquee__fade {
		position: absolute;
		top: 0;
		bottom: 0;
		z-index: 2;
		width: 96px;
		pointer-events: none;
	}

	.community-marquee__fade--left {
		left: 0;
		background: linear-gradient(90deg, #0A0A0B 0%, rgba(10, 10, 11, 0) 100%);
	}

	.community-marquee__fade--right {
		right: 0;
		background: linear-gradient(270deg, #0A0A0B 0%, rgba(10, 10, 11, 0) 100%);
	}

	.community-marquee__items {
		display: flex;
		align-items: center;
		gap: 32px;
		padding: 0 16px;
	}

	.community-marquee__item {
		display: flex;
		align-items: center;
		gap: 32px;
		flex-shrink: 0;
	}

	.community-marquee__name {
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.1em;
		line-height: 1;
		text-transform: uppercase;
		white-space: nowrap;
		transition: color 180ms ease;
	}

	.community-marquee__item:hover .community-marquee__name {
		color: var(--text-primary, #E8E6E3);
	}

	.community-marquee__dot {
		color: var(--gold, #FF6B35);
		font-size: 8px;
		line-height: 1;
	}

	@media (min-width: 1024px) {
		.community-marquee__inner {
			padding-inline: 40px;
		}
	}

	@media (max-width: 640px) {
		.community-marquee {
			padding: 48px 0;
		}

		.community-marquee__fade {
			width: 56px;
		}
	}
`;
