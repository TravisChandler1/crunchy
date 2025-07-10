import React, { useState } from 'react';

const prizes = [
  '10% Off',
  'Free Delivery',
  '50% Off',
  '1 Free Pouch of Our Chips',
  'Try Again Later',
];

const wheelColors = [
  'bg-yellow-300',
  'bg-yellow-500',
  'bg-yellow-700',
  'bg-yellow-400',
  'bg-yellow-200',
];

export default function PrizeWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    // Always land on 'Try Again Later' (last prize)
    const prizeIndex = prizes.length - 1;
    // Calculate rotation so the pointer lands on the last segment
    const segmentAngle = 360 / prizes.length;
    const randomExtra = Math.floor(Math.random() * segmentAngle); // for realism
    const spins = 5; // number of full spins
    const finalRotation = spins * 360 + (prizeIndex * segmentAngle) + randomExtra;
    setRotation(finalRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[prizeIndex]);
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
          disabled={spinning}
        >
          {spinning ? 'Spinning...' : 'Spin Now'}
        </button>
        {result && (
          <div className="mt-6 text-lg font-bold text-yellow-900 bg-yellow-200 px-6 py-3 rounded-full shadow">
            {result === 'Try Again Later' ? 'Try Again Later! Better luck next time.' : `Congratulations! You won: ${result}`}
          </div>
        )}
      </div>
    </section>
  );
} 