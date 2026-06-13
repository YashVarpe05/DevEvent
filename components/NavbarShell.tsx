"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/Button";
import { NavbarUserMenu } from "./NavbarUserMenu";

interface NavbarShellProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    roles: string[];
    organizerStatus: string;
  } | null;
}

const NAV_LINKS = [
  { href: "/events", label: "Discover", external: false },
  { href: "/organizers", label: "Organizers", external: false },
  {
    href: "https://github.com/YashVarpe05/DevEvent",
    label: "Open Source",
    external: true,
  },
];

export default function NavbarShell({ user }: NavbarShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isOrganizer = user?.organizerStatus === "approved";
  const ctaHref = isOrganizer ? "/organizer/events/new" : "/become-organizer";
  const ctaLabel = "List an Event";

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    !href.startsWith("http") &&
    (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-[60] transition-all duration-300 border-b ${
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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative font-mono text-[12px] uppercase tracking-widest transition-colors py-1 ${
                isActive(link.href)
                  ? "text-accent after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-accent"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <NavbarUserMenu user={user} />
          ) : (
            <Link
              href="/login"
              className="font-mono text-[12px] uppercase tracking-widest text-text-primary hover:text-accent transition-colors"
            >
              Sign In
            </Link>
          )}
          <Button asChild variant="primary">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`block w-6 h-[2px] bg-text-primary transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-6 h-[2px] bg-text-primary transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-[2px] bg-text-primary transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-[#060608] flex flex-col md:hidden overflow-y-auto">
          {/* Logo & Close Button */}
          <div className="px-6 h-16 flex items-center justify-between shrink-0 border-b border-border-subtle">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-xl tracking-tight text-text-primary">
              Dev<em className="text-accent not-italic">Event</em>
            </Link>
            <button
              className="md:hidden flex flex-col gap-[5px] p-2"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <span className="block w-6 h-[2px] bg-text-primary rotate-45 translate-y-[7px]" />
              <span className="block w-6 h-[2px] bg-text-primary opacity-0" />
              <span className="block w-6 h-[2px] bg-text-primary -rotate-45 -translate-y-[7px]" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-4 border-b border-border-subtle font-mono text-[14px] uppercase tracking-widest transition-colors ${
                  isActive(link.href) ? "text-accent" : "text-text-primary"
                }`}
              >
                {link.label}
                <span className="text-text-secondary" aria-hidden="true">→</span>
              </Link>
            ))}

            {user ? (
              <>
                {isOrganizer && (
                  <Link
                    href="/organizer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-4 border-b border-border-subtle font-mono text-[14px] uppercase tracking-widest text-text-primary"
                  >
                    Dashboard
                    <span className="text-text-secondary" aria-hidden="true">→</span>
                  </Link>
                )}
                <Link
                  href="/my/registrations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-border-subtle font-mono text-[14px] uppercase tracking-widest text-text-primary"
                >
                  My Tickets
                  <span className="text-text-secondary" aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-border-subtle font-mono text-[14px] uppercase tracking-widest text-text-primary"
                >
                  Profile
                  <span className="text-text-secondary" aria-hidden="true">→</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-border-subtle font-mono text-[14px] uppercase tracking-widest text-text-primary"
              >
                Sign In
                <span className="text-text-secondary" aria-hidden="true">→</span>
              </Link>
            )}

            <Button asChild variant="primary" className="mt-6 w-full">
              <Link href={ctaHref} onClick={() => setMobileMenuOpen(false)}>{ctaLabel}</Link>
            </Button>

            {user && (
              <p className="mt-6 font-mono text-[11px] text-text-secondary truncate text-center">
                Signed in as {user.email}
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
