import React, { useState, useEffect } from 'react';

const prizes = [
  '10% Off',
  'Free Delivery',
  '50% Off',
  '1 Free Pouch of Our Chips',
  'Try Again Later',
];

const MAX_TRIES = 3;
const COOLDOWN_HOURS = 6;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

function getCooldownRemaining(lastSpin: number) {
  const now = Date.now();
  const diff = lastSpin + COOLDOWN_MS - now;
  return diff > 0 ? diff : 0;
}

function formatTime(ms: number) {
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${h}h ${m}m`;
}

export default function PrizeWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [tries, setTries] = useState(MAX_TRIES);
  const [cooldown, setCooldown] = useState(0);

  // Load tries and cooldown from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('prizeWheel');
    if (stored) {
      const { triesLeft, lastSpin } = JSON.parse(stored);
      const remaining = getCooldownRemaining(lastSpin);
      if (triesLeft === 0 && remaining > 0) {
        setTries(0);
        setCooldown(remaining);
      } else {
        setTries(triesLeft ?? MAX_TRIES);
        setCooldown(0);
      }
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1000) {
            setTries(MAX_TRIES);
            localStorage.setItem('prizeWheel', JSON.stringify({ triesLeft: MAX_TRIES, lastSpin: 0 }));
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const handleSpin = () => {
    if (spinning || tries === 0 || cooldown > 0) return;
    setSpinning(true);
    setResult(null);
    // Always land on 'Try Again Later' (last prize)
    const prizeIndex = prizes.length - 1;
    const segmentAngle = 360 / prizes.length;
    const randomExtra = Math.floor(Math.random() * segmentAngle); // for realism
    const spins = 5;
    const finalRotation = spins * 360 + (prizeIndex * segmentAngle) + randomExtra;
    setRotation(finalRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[prizeIndex]);
      const newTries = tries - 1;
      if (newTries === 0) {
        const now = Date.now();
        setCooldown(COOLDOWN_MS);
        localStorage.setItem('prizeWheel', JSON.stringify({ triesLeft: 0, lastSpin: now }));
      } else {
        localStorage.setItem('prizeWheel', JSON.stringify({ triesLeft: newTries, lastSpin: 0 }));
      }
      setTries(newTries);
    }, 3500);
  };

  return (
    <section className="w-full flex flex-col items-center justify-center py-12 bg-[#b6862c] border-t border-yellow-200">
      <h2 className="text-2xl font-bold mb-4 text-yellow-200 drop-shadow" style={{ fontFamily: 'var(--font-brand)' }}>Spin the Prize Wheel!</h2>
      <div className="relative flex flex-col items-center">
        <div className="relative w-64 h-64 mb-6">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 2 }}
          >
            {/* Pointer */}
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-red-600 mx-auto" style={{ marginTop: -16 }} />
          </div>
          <svg
            width={256}
            height={256}
            viewBox="0 0 256 256"
            className="block mx-auto"
            style={{ transition: 'transform 3.2s cubic-bezier(0.23, 1, 0.32, 1)', transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((prize, i) => {
              const startAngle = (i * 360) / prizes.length;
              const endAngle = ((i + 1) * 360) / prizes.length;
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;
              const radius = 120;
              const x1 = 128 + radius * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 128 + radius * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 128 + radius * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 128 + radius * Math.sin((Math.PI * endAngle) / 180);
              const d = `M128,128 L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
              const fill = [
                '#fde047', // yellow-300
                '#facc15', // yellow-500
                '#a16207', // yellow-700
                '#fbbf24', // yellow-400
                '#fef08a', // yellow-200
              ][i % 5];
              return (
                <path key={prize} d={d} fill={fill} stroke="#fff" strokeWidth={2} />
              );
            })}
            {/* Center circle */}
            <circle cx={128} cy={128} r={40} fill="#fff" stroke="#b6862c" strokeWidth={4} />
          </svg>
          {/* Prize labels */}
          {prizes.map((prize, i) => {
            const angle = (i * 360) / prizes.length + 360 / prizes.length / 2;
            const rad = (angle * Math.PI) / 180;
            const x = 128 + 90 * Math.cos(rad);
            const y = 128 + 90 * Math.sin(rad);
            return (
              <div
                key={prize}
                className="absolute text-xs font-bold text-yellow-900 drop-shadow"
                style={{
                  left: x,
                  top: y,
                  width: 80,
                  textAlign: 'center',
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`
                }}
              >
                {prize}
              </div>
            );
          })}
        </div>
        <button
          className="px-8 py-3 rounded-full bg-yellow-300 text-yellow-900 font-bold text-lg shadow-lg hover:bg-yellow-400 transition disabled:opacity-60"
          onClick={handleSpin}
          disabled={spinning || tries === 0 || cooldown > 0}
        >
          {spinning ? 'Spinning...' : tries === 0 && cooldown > 0 ? 'Try Again Later' : 'Spin Now'}
        </button>
        <div className="mt-4 text-yellow-900 font-bold">
          {tries > 0 && cooldown === 0 && (
            <span>{tries} spin{tries > 1 ? 's' : ''} left</span>
          )}
          {tries === 0 && cooldown > 0 && (
            <span>Come back in {formatTime(cooldown)} to spin again!</span>
          )}
        </div>
        {result && (
          <div className="mt-6 text-lg font-bold text-yellow-900 bg-yellow-200 px-6 py-3 rounded-full shadow">
            {result === 'Try Again Later' ? 'Try Again Later! Better luck next time.' : `Congratulations! You won: ${result}`}
          </div>
        )}
      </div>
    </section>
  );
} 