import Link from "next/link"
import Logo from "./Logo"

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Channels", href: "/channels" },
      { label: "Shadow Identity", href: "/feed" },
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Community Guidelines", href: "/guidelines" },
      { label: "Safety Tips", href: "/guidelines" },
      { label: "API Docs", href: "/api/og" },
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy" },
    ]
  }
]

export default function Footer() {
  return (
    <footer className="relative bg-truth-bg border-t border-truth-midGray overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 sm:gap-12 mb-16 sm:mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Logo size={28} className="sm:w-8 sm:h-8" />
              <h3 className="font-bitter text-3xl sm:text-4xl font-black text-truth-textLight uppercase tracking-tighter">TRUTH</h3>
            </div>
            <p className="text-base sm:text-lg text-truth-textGray italic leading-relaxed mb-6 sm:mb-8 max-w-xs">
              Where masks fall<br />and truths rise.
            </p>
            <div className="flex gap-4">
              {/* X (Twitter) */}
              <a
                href="https://x.com/truth_protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-truth-darkGray border border-truth-midGray text-truth-textGray hover:bg-truth-accentRed hover:text-truth-bg hover:border-truth-accentRed hover:-translate-y-1 transition-all duration-300"
                aria-label="X (Twitter)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i} className="lg:col-span-1">
              <h4 className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-truth-textLight mb-5 sm:mb-8 select-none">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-sm text-truth-textGray hover:text-truth-accentRed hover:translate-x-1 transition-all inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="group flex flex-wrap justify-between items-center bg-truth-darkGray p-6 sm:p-10 md:p-12 border border-truth-midGray mb-12 sm:mb-20 gap-8 hover:border-truth-accentRed transition-all">
          <div className="max-w-md">
            <h4 className="font-bitter text-xl sm:text-2xl font-black text-truth-textLight mb-2 uppercase tracking-tight">Stay in the Loop</h4>
            <p className="text-xs sm:text-sm text-truth-textGray">Get weekly insights on authenticity, mental health, and the future of social.</p>
          </div>
          <form className="flex-1 w-full flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="email"
              placeholder="node@protocol.com"
              className="flex-1 bg-truth-bg border border-truth-midGray p-3 sm:p-4 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all w-full text-xs sm:text-sm"
            />
            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-truth-accentRed text-truth-bg font-mono font-bold uppercase tracking-widest hover:bg-white hover:scale-105 transition-all whitespace-nowrap text-xs sm:text-sm">
              SYNC_NODE
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-wrap justify-between items-center pt-8 border-t border-truth-midGray font-mono text-[10px] text-truth-textGray tracking-widest uppercase gap-8">
            <p>© 2026 TRUTH PROTOCOL. Built for radical honesty.</p>
            <div className="flex gap-6 items-center">
              <span className="text-truth-accentGreen">DECRYPT_READY</span>
              <span>•</span>
              <span className="text-truth-accentBlue">v1.0.0_ALPHA</span>
            </div>
        </div>

        {/* Easter Egg */}
        <div className="text-center pt-16 opacity-30 hover:opacity-100 transition-opacity">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-truth-textGray select-none">
              👁️ The truth is out there
            </span>
        </div>
      </div>
    </footer>
  )
}
