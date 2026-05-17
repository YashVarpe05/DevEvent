"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";

interface NavbarShellProps {
  user: any;
}

export default function NavbarShell({ user }: NavbarShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#0A0A0B]/95 backdrop-blur-sm border-border-subtle"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between relative z-50">
        <Link href="/" className="font-display font-bold text-xl tracking-tight text-text-primary">
          Dev<em className="text-accent not-italic">Event</em>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/events" className="font-mono text-[12px] uppercase tracking-widest text-text-secondary hover:text-accent transition-colors">
            Discover
          </Link>
          <Link href="/become-organizer" className="font-mono text-[12px] uppercase tracking-widest text-text-secondary hover:text-accent transition-colors">
            Organizers
          </Link>
          <Link href="https://github.com/YashVarpe05/DevEvent" target="_blank" className="font-mono text-[12px] uppercase tracking-widest text-text-secondary hover:text-accent transition-colors">
            Open Source
          </Link>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link href="/profile" className="font-mono text-[12px] uppercase tracking-widest text-text-primary hover:text-accent">
              Profile
            </Link>
          ) : (
            <Link href="/login" className="font-mono text-[12px] uppercase tracking-widest text-text-primary hover:text-accent">
              Sign In
            </Link>
          )}
          <Button asChild variant="primary">
            <Link href="/become-organizer">List an Event</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-[2px] bg-text-primary transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-6 h-[2px] bg-text-primary transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-[2px] bg-text-primary transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-[49] bg-black/70 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 top-16 bg-bg-void z-50 p-6 flex flex-col gap-6 md:hidden overflow-y-auto border-t border-border-subtle">
            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="font-mono text-[14px] uppercase tracking-widest text-text-primary">
              Discover
            </Link>
            <Link href="/become-organizer" onClick={() => setMobileMenuOpen(false)} className="font-mono text-[14px] uppercase tracking-widest text-text-primary">
              Organizers
            </Link>
            <Link href="https://github.com/YashVarpe05/DevEvent" onClick={() => setMobileMenuOpen(false)} className="font-mono text-[14px] uppercase tracking-widest text-text-primary">
              Open Source
            </Link>
            <div className="h-px w-full bg-border-subtle my-2" />
            {user ? (
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="font-mono text-[14px] uppercase tracking-widest text-text-primary">
                Profile
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="font-mono text-[14px] uppercase tracking-widest text-text-primary">
                Sign In
              </Link>
            )}
            <Button asChild variant="primary" className="mt-4 w-full">
              <Link href="/become-organizer" onClick={() => setMobileMenuOpen(false)}>List an Event</Link>
            </Button>
          </div>
        </>
      )}
    </header>
  );
}
