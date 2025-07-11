"use client";
import { useState } from "react";
import { FaEgg } from "react-icons/fa";

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
        aria-label="Easter Egg"
        className="bg-yellow-300 text-yellow-900 rounded-full p-3 shadow-lg hover:bg-yellow-400 transition flex items-center justify-center border-2 border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{ fontSize: 28 }}
      >
        <FaEgg />
      </button>
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card bg-white rounded-3xl shadow-2xl border border-yellow-200 flex flex-col items-center p-8 max-w-xs w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-2xl text-yellow-900 hover:text-yellow-400 bg-yellow-100 rounded-full w-8 h-8 flex items-center justify-center border border-yellow-200 shadow"
              aria-label="Close"
            >
              &times;
            </button>
            <FaEgg className="text-yellow-400 text-4xl mb-2 animate-bounce" />
            <h3 className="text-xl font-bold text-yellow-900 mb-2">Developer</h3>
            <p className="text-yellow-800 font-semibold mb-2">Oladeni Obaloluwa</p>
            <a
              href="https://github.com/TravisChandler1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              github.com/TravisChandler1
            </a>
          </div>
        </div>
      )}
    </>
  );
} 