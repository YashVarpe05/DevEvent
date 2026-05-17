"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/Badge";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface EventCardProps {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  category?: string;
  isPaid?: boolean;
  price?: number;
  currency?: string;
  organizerName?: string;
  index?: number;
  featured?: boolean;
}

export default function EventCard({
  title,
  image,
  slug,
  location,
  date,
  time,
  category,
  isPaid = false,
  price,
  currency = "INR",
  organizerName,
  featured = false,
}: EventCardProps) {
  const priceLabel = isPaid
    ? `${currency === "INR" ? "₹" : "$"}${price ?? 0}`
    : "Free";

  return (
    <Link
      href={`/events/${slug}`}
      className={`event-card group flex flex-col w-full bg-bg-elevated border transition-all duration-300 hover:-translate-y-1 ${
        featured ? "border-accent shadow-[0_0_20px_rgba(255,107,53,0.15)]" : "border-border-subtle hover:border-accent"
      }`}
    >
      {/* Cover Image — fixed height container */}
      <div className="relative w-full h-[180px] flex-shrink-0 bg-bg-void overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-surface via-bg-void to-bg-surface">
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `
                linear-gradient(45deg, var(--accent) 1px, transparent 1px),
                linear-gradient(-45deg, var(--accent) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-bold text-[48px] text-border-subtle opacity-40 select-none">
                {"//"}
              </span>
            </div>
          </div>
        )}

        {/* Badges */}
        {category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="default">{category}</Badge>
          </div>
        )}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant={isPaid ? "default" : "teal"}>{priceLabel}</Badge>
        </div>
      </div>

      {/* Content — fixed height structure */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Date & Time */}
        <span className="font-mono text-[11px] uppercase text-text-secondary tracking-wider mb-2">
          {date} &middot; {time}
        </span>

        {/* Title — exactly 2 lines */}
        <h3 className="font-display text-[15px] font-bold text-text-primary leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2 h-[2.625rem]">
          {title}
        </h3>

        {/* Location */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary truncate">
          {location}
        </p>

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Organizer footer */}
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-2">
          <div className="w-6 h-6 bg-bg-void border border-border-subtle flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-[10px] text-text-secondary">
              {organizerName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <span className="font-mono text-[11px] text-text-primary truncate">
            {organizerName || "Organizer"}
          </span>
        </div>
      </div>
    </Link>
  );
}
