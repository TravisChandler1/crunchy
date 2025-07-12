"use client";

import React, { useState, useEffect } from 'react';

const prizes = [
  '10% Off',
  'Free Delivery',
  '50% Off',
  '1 Full Chips',
  'Try Again Later',
];

const MAX_TRIES = 3;

function getTodayKey() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function PrizeWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [tries, setTries] = useState(MAX_TRIES);
  const [spinCount, setSpinCount] = useState(0); // for unique spins
  const [resetIn, setResetIn] = useState(0);

  // Load tries from localStorage for today
  useEffect(() => {
    const todayKey = getTodayKey();
    const stored = localStorage.getItem('prizeWheel');
    if (stored) {
      const { date, triesLeft } = JSON.parse(stored);
      if (date === todayKey) {
        setTries(triesLeft ?? MAX_TRIES);
      } else {
        setTries(MAX_TRIES);
        localStorage.setItem('prizeWheel', JSON.stringify({ date: todayKey, triesLeft: MAX_TRIES }));
      }
    } else {
      setTries(MAX_TRIES);
      localStorage.setItem('prizeWheel', JSON.stringify({ date: todayKey, triesLeft: MAX_TRIES }));
    }
  }, []);

  // Timer to reset at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    setResetIn(msUntilMidnight);
    const interval = setInterval(() => {
      setResetIn((prev) => {
        if (prev <= 1000) {
          setTries(MAX_TRIES);
          localStorage.setItem('prizeWheel', JSON.stringify({ date: getTodayKey(), triesLeft: MAX_TRIES }));
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSpin = () => {
    if (spinning || tries === 0) return;
    setSpinning(true);
    setResult(null);
    // Always land on 'Try Again Later' (last prize)
    const prizeIndex = prizes.length - 1;
    const segmentAngle = 360 / prizes.length;
    const randomExtra = Math.floor(Math.random() * segmentAngle); // for realism
    const spins = 5 + Math.floor(Math.random() * 3); // randomize full spins for each try
    // Make each spin unique by adding spinCount*360
    const finalRotation = spins * 360 + (prizeIndex * segmentAngle) + randomExtra + spinCount * 360;
    setRotation(finalRotation);
    setSpinCount((c) => c + 1);
    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[prizeIndex]);
      const newTries = tries - 1;
      setTries(newTries);
      localStorage.setItem('prizeWheel', JSON.stringify({ date: getTodayKey(), triesLeft: newTries }));
    }, 3500);
  };

  // Wheel size and label placement
  const SVG_SIZE = 400;
  const CENTER = SVG_SIZE / 2;
  const RADIUS = 180;
  const LABEL_RADIUS = 130;
  const FONT_SIZE = 14;

  function formatTime(ms: number) {
    const h = Math.floor(ms / (60 * 60 * 1000));
    const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${h}h ${m}m`;
  }

  return (
    <section className="w-full flex flex-col items-center justify-center py-12 bg-[#b6862c] border-t border-yellow-200">
      <h2 className="text-2xl font-bold mb-4 text-yellow-200 drop-shadow" style={{ fontFamily: 'var(--font-brand)' }}>Spin the Prize Wheel!</h2>
      <div className="relative flex flex-col items-center">
        <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE, minWidth: SVG_SIZE, minHeight: SVG_SIZE }}>
          {/* Precise pointer */}
          <div
            className="absolute left-1/2 top-0 z-10"
            style={{ transform: 'translateX(-50%)', width: 0, height: 0 }}
          >
            <svg width="48" height="48" viewBox="0 0 32 32">
              <polygon points="16,0 26,24 16,20 6,24" fill="#dc2626" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="block mx-auto"
            style={{ transition: 'transform 3.2s cubic-bezier(0.23, 1, 0.32, 1)', transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((prize, i) => {
              const startAngle = (i * 360) / prizes.length;
              const endAngle = ((i + 1) * 360) / prizes.length;
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;
              const x1 = CENTER + RADIUS * Math.cos((Math.PI * startAngle) / 180);
              const y1 = CENTER + RADIUS * Math.sin((Math.PI * startAngle) / 180);
              const x2 = CENTER + RADIUS * Math.cos((Math.PI * endAngle) / 180);
              const y2 = CENTER + RADIUS * Math.sin((Math.PI * endAngle) / 180);
              const d = `M${CENTER},${CENTER} L${x1},${y1} A${RADIUS},${RADIUS} 0 ${largeArc} 1 ${x2},${y2} Z`;
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
            <circle cx={CENTER} cy={CENTER} r={80} fill="#fff" stroke="#b6862c" strokeWidth={6} />
            {/* Prize labels inside wheel */}
            {prizes.map((prize, i) => {
              const angle = (i * 360) / prizes.length + 360 / prizes.length / 2;
              const rad = (angle * Math.PI) / 180;
              const x = CENTER + LABEL_RADIUS * Math.cos(rad);
              const y = CENTER + LABEL_RADIUS * Math.sin(rad);
              return (
                <text
                  key={prize}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize={FONT_SIZE}
                  fontWeight="bold"
                  fill="#78350f"
                  transform={`rotate(${angle}, ${x}, ${y})`}
                  style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'Quicksand, sans-serif' }}
                >
                  {prize}
                </text>
              );
            })}
          </svg>
        </div>
        <button
          className="px-8 py-3 rounded-full bg-yellow-300 text-yellow-900 font-bold text-lg shadow-lg hover:bg-yellow-400 transition disabled:opacity-60 mt-8"
          onClick={handleSpin}
          disabled={spinning || tries === 0}
        >
          {spinning ? 'Spinning...' : tries === 0 ? 'No Spins Left' : 'Spin Now'}
        </button>
        <div className="mt-4 text-yellow-900 font-bold">
          {tries > 0 && (
            <span>{tries} spin{tries > 1 ? 's' : ''} left today</span>
          )}
          {tries === 0 && (
            <span>Come back in {formatTime(resetIn)} for more spins!</span>
          )}
        </div>
        {result && (
          <div className="mt-6 text-lg font-bold text-yellow-900 bg-yellow-200 px-6 py-3 rounded-full shadow">
            {result === 'Try Again Later' ? 'Try Again Later! Better luck next time.' : `Congratulations! You won: ${result}`}
          </div>
        )}
      </div>
      {/* Add note about buying products */}
      <div className="mt-4 text-yellow-100 text-center text-base italic max-w-lg">
        <span>Tip: Buying products increases your chances of winning on the prize wheel!</span>
      </div>
    </section>
  );
} 