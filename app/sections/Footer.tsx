import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-void border-t border-border-subtle pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Top Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="font-display font-bold text-2xl tracking-tight text-text-primary inline-block mb-4 hover:text-accent transition-colors">
              Dev<em className="text-accent not-italic">Event</em>
            </Link>
            <p className="font-mono text-[11px] uppercase text-text-secondary tracking-widest leading-relaxed mb-6 max-w-xs">
              India's premier open-source developer event platform.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {[
                { name: "Twitter", href: "#" },
                { name: "GitHub", href: "https://github.com/YashVarpe05/DevEvent" },
                { name: "Discord", href: "#" }
              ].map((social) => (
                <a 
                  key={social.name} 
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-border-subtle bg-bg-base hover:border-accent hover:text-accent text-text-secondary transition-all"
                  aria-label={social.name}
                >
                  <span className="font-mono text-[10px] uppercase">{social.name.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase text-text-primary tracking-widest mb-6">
              Platform
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/events" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  Discover Events
                </Link>
              </li>
              <li>
                <Link href="/become-organizer" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  For Organizers
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  Pricing (Free)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase text-text-primary tracking-widest mb-6">
              Resources
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/docs" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="https://github.com/YashVarpe05/DevEvent" target="_blank" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  Open Source
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase text-text-primary tracking-widest mb-6">
              Legal
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/privacy" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="font-mono text-[12px] uppercase text-text-secondary tracking-widest hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase text-text-secondary tracking-widest">
            &copy; {currentYear} DevEvent. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase text-text-secondary tracking-widest">
            Built with <span className="text-accent">&lt;/&gt;</span> in India
          </p>
        </div>

      </div>
    </footer>
  );
}
