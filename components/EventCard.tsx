"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Video, ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/Badge";

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
  eventType?: "online" | "offline" | "hybrid";
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
  eventType,
  featured = false,
}: EventCardProps) {
  const priceLabel = isPaid
    ? `${currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$"}${price ?? 0}`
    : "Free";

  const isOnline = eventType === "online" || location.toLowerCase() === "online";

  return (
    <Link
      href={`/events/${slug}`}
      className={`event-card group relative flex flex-col w-full bg-bg-elevated border transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
        featured
          ? "border-accent shadow-[0_0_20px_rgba(255,107,53,0.15)]"
          : "border-border-subtle hover:border-accent hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
      }`}
    >
      {/* Cover Image — fixed height container */}
      <div className="relative w-full h-[180px] flex-shrink-0 bg-bg-void overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
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

        {/* Bottom hairline that lights up on hover */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-border-subtle group-hover:bg-accent transition-colors duration-300 z-10" />
      </div>

      {/* Content — fixed height structure */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Date & Time */}
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase text-text-secondary tracking-wider mb-2">
          <CalendarDays size={12} className="text-accent/70 shrink-0" aria-hidden="true" />
          {date} &middot; {time}
        </span>

        {/* Title — exactly 2 lines */}
        <h3 className="font-display text-[15px] font-bold text-text-primary leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2 h-[2.625rem]">
          {title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-text-secondary truncate">
          {isOnline ? (
            <Video size={12} className="text-teal shrink-0" aria-hidden="true" />
          ) : (
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">{location}</span>
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
          <ArrowUpRight
            size={14}
            className="ml-auto shrink-0 text-text-secondary opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-accent transition-all duration-200"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
