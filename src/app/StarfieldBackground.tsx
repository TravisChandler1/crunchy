"use client";
import { useEffect, useRef } from "react";

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    // Star and shooting star setup
    const STAR_COUNT = 400;
    const CONSTELLATION_COUNT = 8;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 0.15 + 0.05,
    }));

    // Constellations: connect random stars
    const constellations = Array.from({ length: CONSTELLATION_COUNT }, () => {
      const points = [];
      const pointCount = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < pointCount; i++) {
        points.push(Math.floor(Math.random() * STAR_COUNT));
      }
      return points;
    });

    // Shooting stars
    type ShootingStar = {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      alpha: number;
    };
    let shootingStar: ShootingStar | null = null;
    function spawnShootingStar() {
      shootingStar = {
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.3,
        len: Math.random() * 80 + 100,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + Math.random() * Math.PI / 8,
        alpha: 1,
      };
    }
    let shootingStarTimer = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      // Draw stars
      for (const star of stars) {
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        // Twinkle
        star.alpha += (Math.random() - 0.5) * 0.02;
        if (star.alpha < 0.3) star.alpha = 0.3;
        if (star.alpha > 1) star.alpha = 1;
        // Move star (falling)
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      }
      // Draw constellations
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 0.7;
      for (const points of constellations) {
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const star = stars[points[i]];
          if (i === 0) ctx.moveTo(star.x, star.y);
          else ctx.lineTo(star.x, star.y);
        }
        ctx.stroke();
      }
      ctx.restore();
      // Draw shooting star
      if (shootingStar) {
        ctx.save();
        ctx.globalAlpha = shootingStar.alpha;
        ctx.strokeStyle = "#fff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.len,
          shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.len
        );
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
        // Move shooting star
        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.alpha -= 0.018;
        if (
          shootingStar.x > width ||
          shootingStar.y > height ||
          shootingStar.alpha <= 0
        ) {
          shootingStar = null;
        }
      }
      // Shooting star timer
      shootingStarTimer++;
      if (!shootingStar && shootingStarTimer > 180 + Math.random() * 120) {
        spawnShootingStar();
        shootingStarTimer = 0;
      }
      requestAnimationFrame(draw);
    }
    draw();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-30 pointer-events-none select-none"
      style={{
        background: "red", // TEMP: should see a red background if canvas renders
      }}
    />
  );
} 