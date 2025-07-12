"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function PageTransitionSpinner() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600); // Minimum spinner time for smoothness
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Image
        src="/logo-3.jpeg"
        alt="Loading..."
        width={100}
        height={100}
        className="rounded-full border-4 border-yellow-200 shadow-2xl animate-grow-glow"
      />
      <style jsx global>{`
        @keyframes grow-glow {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.5), 0 0 32px 8px rgba(255, 215, 0, 0.2);
          }
          50% {
            transform: scale(1.18);
            box-shadow: 0 0 40px 16px rgba(255, 215, 0, 0.7), 0 0 64px 24px rgba(255, 215, 0, 0.3);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.5), 0 0 32px 8px rgba(255, 215, 0, 0.2);
          }
        }
        .animate-grow-glow {
          animation: grow-glow 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 