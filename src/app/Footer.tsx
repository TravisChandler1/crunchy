"use client";
import EasterEgg from "./EasterEgg";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="w-full bg-black/80 border-t border-yellow-100 mt-8 py-8 px-4 text-yellow-50 flex flex-col items-center gap-4 relative">
      <Image src="/logo-2.jpeg" alt="Logo 2" width={64} height={64} className="mb-2 rounded-full border border-[var(--brown)] shadow" />
      <div className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-brand)' }}>Crunchy Cruise Snacks</div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-center text-sm">
        <span>&copy; {new Date().getFullYear()} Crunchy Cruise Snacks. All rights reserved.</span>
        <span>Contact: <a href="mailto:crunchycruise2023@gmail.com" className="underline hover:text-[#7ed957]">crunchycruise2023@gmail.com</a></span>
        <span>Phone: <a href="tel:+2348000000000" className="underline hover:text-[var(--brown)]">+234 800 000 0000</a></span>
      </div>
      <div className="flex gap-6 mt-2 items-center">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-[var(--brown)] text-2xl"><svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm6 1.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"></path></svg></a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-[var(--brown)] text-2xl"><svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path d="M17.525 8.998h-3.02V7.498c0-.49.327-.604.557-.604h2.432V3.998h-3.36c-2.02 0-2.48 1.51-2.48 2.48v2.52H8.475v3.5h3.18V20h3.85v-7.502h2.59l.43-3.5z"></path></svg></a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-[var(--brown)] text-2xl"><svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path d="M22.46 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475a8.94 8.94 0 0 1-2.828 1.082a4.48 4.48 0 0 0-7.635 4.086A12.72 12.72 0 0 1 3.112 4.89a4.48 4.48 0 0 0 1.387 5.976a4.44 4.44 0 0 1-2.03-.56v.057a4.48 4.48 0 0 0 3.59 4.393a4.48 4.48 0 0 1-2.025.077a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.54a12.67 12.67 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78c0-.195-.004-.39-.013-.583a9.14 9.14 0 0 0 2.24-2.333z"></path></svg></a>
        {pathname === "/" && <EasterEgg />}
      </div>
    </footer>
  );
} 