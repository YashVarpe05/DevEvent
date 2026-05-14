"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  IndianRupee, 
  User, 
  ArrowLeft,
  Menu,
  X
} from "lucide-react";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { section: "MANAGE", links: [
      { label: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
      { label: "My Events", href: "/organizer/events", icon: CalendarDays },
      { label: "Payouts", href: "/organizer/payouts", icon: IndianRupee },
    ]},
    { section: "SETTINGS", links: [
      { label: "Profile", href: "/organizer/settings/profile", icon: User },
    ]}
  ];

  const SidebarContent = () => (
    <>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border-dim)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--text-primary)" }}>
            Dev<em style={{ color: "var(--gold)", fontStyle: "italic" }}>Event</em>
          </div>
        </Link>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: "2px" }}>
          Organizer
        </div>
      </div>

      <div style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {navLinks.map((group, idx) => (
          <div key={idx}>
            <div className="text-label" style={{ padding: "0 8px", marginBottom: "16px", marginTop: idx > 0 ? "24px" : "0" }}>
              {group.section}
            </div>
            {group.links.map((link) => {
              const exactActive = pathname === link.href;
              const subActive = link.href !== "/organizer" && pathname.startsWith(link.href);
              const active = exactActive || subActive;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    height: "36px",
                    padding: active ? "0 10px 0 8px" : "0 10px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 120ms ease",
                    marginBottom: "2px",
                    background: active ? "var(--bg-elevated)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    borderLeft: active ? "2px solid var(--gold)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "var(--bg-surface)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }
                  }}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border-dim)" }}>
        <Link 
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--text-muted)",
            textDecoration: "none",
            padding: "8px",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <ArrowLeft size={14} /> Back to site
        </Link>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex" style={{
        width: "240px",
        minHeight: "100dvh",
        background: "var(--bg-void)",
        borderRight: "1px solid var(--border-dim)",
        position: "fixed",
        top: 0,
        left: 0,
        flexDirection: "column",
        zIndex: 40,
      }}>
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full md:ml-[240px]" style={{
        minHeight: "100dvh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between" style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: "52px",
          background: "rgba(8,8,9,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-dim)",
          padding: "0 16px",
          width: "100%",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--gold)", fontSize: "16px" }}>
            DevEvent Organizer
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: "var(--text-primary)", background: "transparent", border: "none", padding: "4px" }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden" style={{
            position: "fixed",
            top: "52px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--bg-void)",
            zIndex: 35,
            display: "flex",
            flexDirection: "column",
          }}>
            <SidebarContent />
          </div>
        )}

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
