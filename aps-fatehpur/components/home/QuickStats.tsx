"use client";

import React, { useEffect, useState, useRef } from "react";
import { Users, GraduationCap, Award, BookOpen } from "lucide-react";

const stats = [
  { icon: Users, label: "Students", target: 3500, suffix: "+" },
  { icon: GraduationCap, label: "Teachers", target: 180, suffix: "+" },
  { icon: Award, label: "Years of Excellence", target: 30, suffix: "+" },
  { icon: BookOpen, label: "Board Results", target: 100, suffix: "%" },
];

function useCountUp(target: number, active: boolean, duration = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, active, duration]);

  return value;
}

function StatCard({
  icon: Icon,
  label,
  target,
  suffix,
  active,
}: {
  icon: React.ElementType;
  label: string;
  target: number;
  suffix: string;
  active: boolean;
}) {
  const count = useCountUp(target, active);

  return (
    <div className="flex flex-col items-center gap-2 py-6 px-4">
      <Icon className="h-8 w-8 text-white/80" />
      <span className="text-3xl md:text-4xl font-bold text-white">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm text-white/80">{label}</span>
    </div>
  );
}

export function QuickStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-2"
      style={{ backgroundColor: "var(--school-primary)" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} active={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
