"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const messages = [
  "Make a good choice and order today!",
  "Crunch your way to happiness—try our plantain chips!",
  "Life's better with a bag of Crunchy Cruise Snacks!",
  "Don't just snack… cruise!",
  "Sweet or savory, we've got your crunch!",
  "Your taste buds deserve a vacation—order now!",
  "The crunch you crave is just a click away!",
  "Plantain chips so good, you'll want to share (but you won't)!",
  "Take a break, take a crunch!",
  "As you dey crunch, just dey cruise!",
];

export default function FlashMessage() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setShow(true);
      }, 2000); // fade out duration
    }, 7000); // show each message for 7s
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-8 z-[1000] -translate-x-1/2 px-8 py-4 rounded-full glass-card text-white font-bold text-lg shadow-2xl border border-[#7ed957] pointer-events-none transition-transform duration-2000 ease-in-out animate-flash-move-fade ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-32"}`}
      style={{
        animation: show ? "flash-move-fade 2s linear forwards" : undefined,
        willChange: "transform, opacity",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
      }}
    >
      {messages[index]}
      <style jsx global>{`
        @keyframes flash-move-fade {
          0% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(-120px); }
          100% { opacity: 0; transform: translateY(-160px); }
        }
        .animate-flash-move-fade {
          animation: flash-move-fade 2s linear forwards;
        }
      `}</style>
    </div>
  );
} 