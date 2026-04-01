"use client"

const footerSections = [
  {
    title: "Product",
    links: ["Features", "How it Works", "Channels", "Shadow Identity", "Pricing", "Roadmap"]
  },
  {
    title: "Company",
    links: ["About Us", "Our Mission", "Careers", "Press Kit", "Blog", "Contact"]
  },
  {
    title: "Resources",
    links: ["Help Center", "Community Guidelines", "Safety Tips", "Mental Health Resources", "API Docs", "Status"]
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DMCA", "Transparency Report"]
  }
]

export default function Footer() {
  return (
    <footer className="relative bg-truth-bg border-t border-truth-midGray overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="font-bitter text-4xl font-black text-truth-textLight mb-6 uppercase">TruTH</h3>
            <p className="text-lg text-truth-textGray italic leading-relaxed mb-8">
              Where masks fall<br />and truths rise.
            </p>
            <div className="flex gap-4">
              {/* Twitter */}
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-truth-darkGray border border-truth-midGray text-truth-textGray hover:bg-truth-accentRed hover:text-truth-bg hover:border-truth-accentRed hover:-translate-y-1 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-truth-darkGray border border-truth-midGray text-truth-textGray hover:bg-truth-accentRed hover:text-truth-bg hover:border-truth-accentRed hover:-translate-y-1 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* Discord */}
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-truth-darkGray border border-truth-midGray text-truth-textGray hover:bg-truth-accentRed hover:text-truth-bg hover:border-truth-accentRed hover:-translate-y-1 transition-all duration-300"
                aria-label="Discord"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-truth-darkGray border border-truth-midGray text-truth-textGray hover:bg-truth-accentRed hover:text-truth-bg hover:border-truth-accentRed hover:-translate-y-1 transition-all duration-300"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i}>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-truth-textLight mb-8 select-none">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-truth-textGray hover:text-truth-accentRed hover:translate-x-1 transition-all inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="group flex flex-wrap justify-between items-center bg-truth-darkGray p-12 border border-truth-midGray mb-20 gap-8 hover:border-truth-accentRed transition-all">
          <div className="max-w-md">
            <h4 className="font-bitter text-2xl font-black text-truth-textLight mb-2 uppercase">Stay in the Loop</h4>
            <p className="text-sm text-truth-textGray">Get weekly insights on authenticity, mental health, and the future of social.</p>
          </div>
          <form className="flex-1 w-full flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-truth-bg border border-truth-midGray p-4 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all w-full"
            />
            <button className="px-8 py-4 bg-truth-accentRed text-truth-bg font-mono font-bold uppercase tracking-widest hover:bg-white hover:scale-105 transition-all whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-wrap justify-between items-center pt-8 border-t border-truth-midGray font-mono text-[10px] text-truth-textGray tracking-widest uppercase gap-8">
            <p>© 2026 TruTH. Built with 🖤 for authentic humans.</p>
            <div className="flex gap-6 items-center">
              <a href="#" className="hover:text-truth-accentRed transition-colors">English</a>
              <span>•</span>
              <a href="#" className="hover:text-truth-accentRed transition-colors">Dark Mode</a>
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
