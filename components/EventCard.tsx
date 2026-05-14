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
      className={`group block w-full h-full rounded-none bg-bg-elevated border transition-all duration-200 ${
        featured ? "border-accent shadow-[0_0_20px_rgba(255,107,53,0.15)]" : "border-border-subtle hover:border-accent"
      }`}
      style={{ transform: "translateY(0)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-video bg-bg-void overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-surface to-bg-void" />
        )}

        {/* Badges */}
        {category && (
          <div className="absolute top-2 left-2">
            <Badge variant="default">{category}</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={isPaid ? "default" : "teal"}>{priceLabel}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between h-[calc(100%-56.25%)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[12px] uppercase text-text-secondary">
              {date} • {time}
            </span>
          </div>
          <h3 className="font-display text-base font-bold text-text-primary leading-tight mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="font-mono text-[12px] uppercase tracking-widest text-text-secondary truncate">
            {location}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-bg-void border border-border-subtle rounded-none flex items-center justify-center">
              <span className="font-mono text-[10px] text-text-secondary">
                {organizerName?.charAt(0) || "?"}
              </span>
            </div>
            <span className="font-mono text-[12px] text-text-primary truncate max-w-[120px]">
              {organizerName || "Organizer"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
