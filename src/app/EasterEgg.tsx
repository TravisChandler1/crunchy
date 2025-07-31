"use client";
import { useState } from "react";
import { GiSecretBook } from "react-icons/gi";

export default function EasterEgg() {
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (showModal) return;
    if (count + 1 >= 5) {
      setShowModal(true);
      setCount(0);
    } else {
      setCount(count + 1);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-[#7ed957] text-white rounded-full p-3 shadow-lg hover:bg-[#45523e] hover:text-white transition flex items-center justify-center border-4 border-[#7ed957]"
        aria-label="Easter Egg"
      >
        <GiSecretBook className="text-2xl text-white" />
      </button>
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card bg-white rounded-3xl shadow-2xl border border-[var(--brown)] flex flex-col items-center p-8 max-w-xs w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-2xl text-yellow-900 hover:text-[var(--brown-dark)] bg-[var(--brown)] rounded-full w-8 h-8 flex items-center justify-center border border-[var(--brown)] shadow"
              aria-label="Close"
            >
              &times;
            </button>
            <GiSecretBook className="text-[var(--brown)] text-2xl mb-2 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">Developer</h3>
            <p className="text-white font-semibold mb-2">Oladeni Obaloluwa</p>
            <a
              href="https://github.com/TravisChandler1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-[var(--brown)]"
            >
              github.com/TravisChandler1
            </a>
          </div>
        </div>
      )}
    </>
  );
} 