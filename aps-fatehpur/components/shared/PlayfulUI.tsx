"use client";

import React, { useEffect, useRef } from "react";
import {
  Star,
  Pencil,
  BookOpen,
  Heart,
  Sparkles,
} from "lucide-react";

/* ── Brand Colors ── */
export const brand = {
  primary: "#499f42",       // green
  primaryDark: "#3d8a37",
  secondary: "#22235b",     // navy
  accentBlue: "#9ab5db",    // soft blue
  accentLime: "#d4e96e",    // lime
  bgLight: "#f6faf5",       // soft green tint
} as const;

/* ── Wave Divider (Top) ── */
export function WaveTop({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 ${className}`}>
      <svg className="relative block w-full h-16 md:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor" />
      </svg>
    </div>
  );
}

/* ── Wave Divider (Bottom) ── */
export function WaveBottom({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute bottom-0 left-0 w-full overflow-hidden leading-none ${className}`}>
      <svg className="relative block w-full h-16 md:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V92.65A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor" />
      </svg>
    </div>
  );
}

/* ── Blob SVG Shape ── */
export function BlobDecoration({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-58.8,79.6,-45.4C87.4,-32,90,-15.5,88.2,-0.1C86.5,15.3,80.5,29.6,72.1,42.4C63.7,55.2,52.9,66.5,39.8,73.8C26.7,81.1,11.3,84.3,-3.2,82.6C-17.8,80.9,-31.5,74.2,-44.6,66.3C-57.7,58.3,-70.1,49,-77.3,36.5C-84.5,24,-86.5,8.2,-84.3,-6.6C-82.1,-21.4,-75.8,-35.2,-66.3,-46.1C-56.8,-57,-44.1,-65,-31,-72.2C-17.9,-79.4,-4.5,-85.8,8.1,-83.8C20.7,-81.8,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
    </svg>
  );
}

/* ── Floating Decorative Icons ── */
export function FloatingDecorations({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <Star className="absolute top-20 left-[10%] h-6 w-6 opacity-70 animate-float" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
      <Pencil className="absolute top-40 right-[15%] h-5 w-5 opacity-60 animate-float-slow" style={{ color: "var(--school-primary, #499f42)" }} />
      <Sparkles className="absolute bottom-32 left-[20%] h-7 w-7 opacity-60 animate-bounce-gentle" style={{ color: "var(--accent-blue, #9ab5db)" }} />
      <Heart className="absolute top-1/3 right-[8%] h-5 w-5 opacity-50 animate-float" style={{ color: "var(--school-primary, #499f42)" }} />
      <BookOpen className="absolute bottom-20 right-[25%] h-6 w-6 opacity-60 animate-float-slow" style={{ color: "var(--accent-blue, #9ab5db)" }} />
      <Star className="absolute top-1/2 left-[5%] h-4 w-4 opacity-65 animate-bounce-gentle" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
    </div>
  );
}

/* ── Section Wrapper with decorations ── */
interface PlayfulSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** Show wave divider at top */
  waveTop?: boolean;
  /** Show wave divider at bottom */
  waveBottom?: boolean;
  /** Color for waves (defaults to brand.bgLight) */
  waveColor?: string;
  /** Show floating icons */
  floatingIcons?: boolean;
  /** Show blob decorations */
  blobs?: boolean;
  /** Additional style */
  style?: React.CSSProperties;
}

export function PlayfulSection({
  children,
  id,
  className = "",
  waveTop = false,
  waveBottom = false,
  waveColor = brand.bgLight,
  floatingIcons = false,
  blobs = false,
  style,
}: PlayfulSectionProps) {
  return (
    <section id={id} className={`relative overflow-hidden ${className}`} style={style}>
      {waveTop && (
        <div className="absolute top-0 left-0 w-full" style={{ color: waveColor }}>
          <WaveTop />
        </div>
      )}

      {blobs && (
        <>
          <BlobDecoration className="absolute -top-16 -right-16 w-64 h-64 opacity-20 animate-float-slow" style={{ color: "var(--accent-blue, #9ab5db)" }} />
          <BlobDecoration className="absolute -bottom-12 -left-12 w-48 h-48 opacity-15 animate-float" style={{ color: "var(--school-primary, #499f42)" }} />
        </>
      )}

      {floatingIcons && <FloatingDecorations />}

      <div className="relative z-10">{children}</div>

      {waveBottom && (
        <div className="absolute bottom-0 left-0 w-full" style={{ color: waveColor }}>
          <WaveBottom />
        </div>
      )}
    </section>
  );
}

/* ── Section Header ── */
interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  emoji?: string;
  align?: "center" | "left";
}

export function SectionHeader({ label, title, description, emoji, align = "center" }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : ""}`}>
      <p className="text-sm font-bold uppercase tracking-widest mb-3 font-heading" style={{ color: "var(--school-primary, #499f42)" }}>
        {emoji && `${emoji} `}{label}
      </p>
      <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold" style={{ color: "var(--text-dark, #22235b)" }}>
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-gray-500 max-w-md mx-auto">{description}</p>
      )}
    </div>
  );
}

/* ── Cursor Trail Effect (desktop only) ── */
export function CursorTrail() {
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${pos.current.x - 12}px, ${pos.current.y - 12}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      ref={trailRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-6 w-6 rounded-full blur-[2px] hidden md:block"
      style={{ willChange: "transform", background: "linear-gradient(135deg, var(--school-primary, #499f42)80, var(--accent-blue, #9ab5db)80)" }}
    />
  );
}
