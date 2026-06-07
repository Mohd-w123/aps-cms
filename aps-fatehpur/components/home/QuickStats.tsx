"use client";

import React, { useEffect, useState, useRef } from "react";
import { Users, GraduationCap, Award, BookOpen } from "lucide-react";

const defaultStats = [
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
      <Icon className="h-8 w-8" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
      <span className="text-3xl md:text-4xl font-heading font-bold text-white">
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
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    fetch("/api/schools")
      .then(r => r.json())
      .then(r => {
        if (r.success) {
          const arr = Array.isArray(r.data) ? r.data : [r.data];
          const slug = document.cookie.match(/school-slug=([^;]+)/)?.[1] || "apsfatehpur";
          const school = arr.find((s: { slug: string }) => s.slug === slug) || arr[0];
          if (school?.stats) {
            setStats([
              { icon: Users, label: "Students", target: school.stats.students || 3500, suffix: "+" },
              { icon: GraduationCap, label: "Teachers", target: school.stats.teachers || 180, suffix: "+" },
              { icon: Award, label: "Years of Excellence", target: school.stats.years || 30, suffix: "+" },
              { icon: BookOpen, label: "Board Results", target: 100, suffix: "%" },
            ]);
          }
        }
      })
      .catch(() => {});
  }, []);

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
      style={{ background: "linear-gradient(135deg, var(--school-primary, #499f42) 0%, var(--school-primary-dark, #3d8a37) 100%)" }}
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
