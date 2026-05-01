"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { schools } from "@/config/schools";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ArrowRight,
  ZoomIn,
  Play,
} from "lucide-react";

const branches = schools.filter((s) => s.slug !== "apsfatehpur");

const slides = [
  {
    image: "/images/hero-1.jpg",
    title: "Ashraful Uloom Educational & Welfare Society",
    subtitle: "A legacy of educational excellence since 1940 — Fatehpur Shekhawati",
  },
  {
    image: "/images/hero-2.jpg",
    title: "Nurturing Minds, Building Futures",
    subtitle: "Proudly nurturing over 1,500 young minds with 100% results year after year",
  },
  {
    image: "/images/hero-3.jpg",
    title: "Modern Education, Timeless Values",
    subtitle: "A network of institutions offering education in Hindi, English, Urdu, and Arabic",
  },
];

const branchImages: Record<string, string> = {
  apsgirls: "/images/hero-1.jpg",
  apsboys: "/images/hero-2.jpg",
  madrasa: "/images/hero-3.jpg",
  azadschool: "/images/hero-4.jpg",
};

const toppers = [
  "/images/toppers/topper-1.jpg",
  "/images/toppers/topper-2.jpg",
  "/images/toppers/topper-3.jpg",
  "/images/toppers/topper-4.jpg",
  "/images/toppers/topper-5.jpg",
  "/images/toppers/topper-6.jpg",
  "/images/toppers/topper-7.jpg",
  "/images/toppers/topper-8.jpg",
  "/images/toppers/topper-9.jpg",
];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Branches", href: "#branches" },
  { label: "Toppers", href: "#toppers" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

/* ───────────────────── GROUP LANDING ───────────────────── */
export function GroupLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <GroupNav />
      <HeroSlider />
      <AboutSection />
      <BranchesSection />
      <ToppersSection />
      <GallerySection />
      <GroupFooter />
    </div>
  );
}

/* ───────────────────── NAV ───────────────────── */
function GroupNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo + Name */}
        <Link href="#home" className="flex items-center gap-3">
          <Image
            src="/logos/apsfatehpur.png"
            alt="APS Fatehpur"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span
            className={`font-bold text-sm md:text-base transition-colors ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            APS Fatehpur Group
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:opacity-80 ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden ${scrolled ? "text-gray-900" : "text-white"}`}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

/* ───────────────────── HERO SLIDER ───────────────────── */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section id="home" className="relative h-[85vh] overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      </div>

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">{slide.subtitle}</p>
            <div className="flex gap-4 flex-wrap">
              <a
                href="#branches"
                className="inline-block rounded-full px-8 py-3 font-semibold text-base bg-[#3FA34D] text-white transition-transform hover:scale-105"
              >
                Our Branches
              </a>
              <a
                href="#about"
                className="inline-block rounded-full px-8 py-3 font-semibold text-base border-2 border-white text-white transition-transform hover:scale-105 hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current ? "w-8 bg-white" : "w-2.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ───────────────────── ABOUT SECTION ───────────────────── */
function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/school-campus.jpg"
              alt="Campus"
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#3FA34D]">
              About Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              A Legacy of Educational Excellence
            </h2>
            <p className="text-base leading-relaxed mb-4 text-gray-600">
              Founded in 1940 in Fatehpur Shekhawati, Ashraful Uloom Educational
              and Welfare Society emerged as a beacon of hope, dedicated to
              fostering education within an Islamic atmosphere and ideology.
            </p>
            <p className="text-base leading-relaxed mb-4 text-gray-600">
              The journey began with the establishment of Madarsa Islamiya
              Ashraful Uloom. Recognizing the need for modern education, the
              society founded Maulana Azad Middle School in 1962, which grew into
              a senior secondary institution by 1974.
            </p>
            <p className="text-base leading-relaxed mb-4 text-gray-600">
              In 2006, the society established Ashraful Uloom Public School.
              Today, it proudly nurtures over 1,500 young minds, achieving a
              remarkable legacy of 100% results year after year.
            </p>
            <p className="text-sm italic text-gray-500">
              — Chairman, A.P.S School
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── BRANCHES (FLIP CARDS) ───────────────────── */
function BranchesSection() {
  return (
    <section id="branches" className="py-20" style={{ backgroundColor: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#3FA34D]">
            Our Network
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Branches
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {branches.map((school) => (
            <FlipCard key={school.slug} school={school} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlipCard({ school }: { school: (typeof branches)[number] }) {
  const [flipped, setFlipped] = useState(false);

  const handleVisit = () => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      window.location.href = `/?school=${school.slug}`;
    } else {
      window.location.href = `https://${school.domain}`;
    }
  };

  return (
    <div
      className="group cursor-pointer"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full h-72 transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — Building Image */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            src={branchImages[school.slug] || "/images/school-campus.jpg"}
            alt={school.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-bold text-white">{school.name}</h3>
            <p className="text-sm text-white/70 mt-1">Tap to explore →</p>
          </div>
        </div>

        {/* Back — Visit Website */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg flex flex-col items-center justify-center p-6"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: school.theme.primary,
          }}
        >
          <Image
            src={school.logo}
            alt={school.name}
            width={64}
            height={64}
            className="rounded-full bg-white p-1 mb-4"
          />
          <h3 className="text-xl font-bold text-white text-center mb-2">
            {school.name}
          </h3>
          <p className="text-sm text-white/80 text-center mb-6">
            Explore our campus, programs, and achievements
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVisit();
            }}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-white transition-transform hover:scale-105"
            style={{ color: school.theme.primary }}
          >
            Visit Website <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── TOPPERS ───────────────────── */
function ToppersSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 5) {
        el.scrollLeft = 0;
      } else {
        el.scrollBy({ left: 2 });
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="toppers" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#3FA34D]">
            Achievements
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Toppers
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {toppers.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-56 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={src}
                alt={`Topper ${i + 1}`}
                width={224}
                height={300}
                className="w-full h-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((c) =>
                c !== null ? (c - 1 + toppers.length) % toppers.length : null
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((c) =>
                c !== null ? (c + 1) % toppers.length : null
              );
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={toppers[lightboxIndex]}
              alt={`Topper ${lightboxIndex + 1}`}
              width={800}
              height={1000}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────────────── GALLERY ───────────────────── */
function toEmbedUrl(url: string): string {
  // youtu.be/VIDEO_ID → youtube.com/embed/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // already embed format
  return url;
}

type GalleryItem = {
  type: "image" | "video";
  src: string;
  videoUrl?: string;
  alt: string;
};

const galleryItems: GalleryItem[] = [
  { type: "image", src: "/images/gallery-3.jpg", alt: "School Event" },
  { type: "image", src: "/images/gallery-4.jpg", alt: "Annual Function" },
  { type: "video", src: "/images/gallery-5.jpg", videoUrl: "https://youtu.be/SeKI41D5kyk?si=1wKsNngee5Rdsr-q", alt: "School Promo Video" },
  { type: "image", src: "/images/gallery-6.jpg", alt: "Classroom Activity" },
  { type: "image", src: "/images/gallery-7.jpg", alt: "Sports Day" },
  { type: "video", src: "/images/gallery-8.jpg", videoUrl: "https://youtu.be/SeKI41D5kyk?si=1wKsNngee5Rdsr-q", alt: "Campus Tour" },
  { type: "image", src: "/images/gallery-9.jpg", alt: "Cultural Program" },
  { type: "image", src: "/images/gallery-10.jpg", alt: "Award Ceremony" },
];

function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  const filtered = filter === "all" ? galleryItems : galleryItems.filter((g) => g.type === filter);
  const current = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <section id="gallery" className="py-20" style={{ backgroundColor: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#3FA34D]">
            Memories
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Gallery
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {(["all", "image", "video"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setFilter(tab); setLightboxIndex(null); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab
                  ? "bg-[#3FA34D] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab === "all" ? "All" : tab === "image" ? "Photos" : "Videos"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filtered.map((item, i) => (
            <div
              key={`${item.src}-${i}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-lg transition-all"
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                {item.type === "video" ? (
                  <Play className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                ) : (
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              {item.type === "video" && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  VIDEO
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {current && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((c) =>
                c !== null ? (c - 1 + filtered.length) % filtered.length : null
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((c) =>
                c !== null ? (c + 1) % filtered.length : null
              );
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="relative w-[90vw] max-w-4xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === "video" && current.videoUrl ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={toEmbedUrl(current.videoUrl)}
                  title={current.alt}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-lg"
                />
              </div>
            ) : (
              <Image
                src={current.src}
                alt={current.alt}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto mx-auto object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────────────── FOOTER ───────────────────── */
function GroupFooter() {
  return (
    <footer id="contact" className="bg-[#0f172a] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logos/apsfatehpur.png"
                alt="APS"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-bold">APS Fatehpur Group</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ashraful Uloom Educational & Welfare Society — A legacy of
              educational excellence since 1940, Fatehpur Shekhawati.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Our Branches</h4>
            <ul className="space-y-2">
              {branches.map((school) => (
                <li key={school.slug}>
                  <a
                    href={`https://${school.domain}`}
                    onClick={(e) => {
                      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
                        e.preventDefault();
                        window.location.href = `/?school=${school.slug}`;
                      }
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {school.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Fatehpur Shekhawati, Rajasthan, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91-XXXX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@apsfatehpur.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-5 text-sm text-gray-500">
        © {new Date().getFullYear()} Ashraful Uloom Educational & Welfare
        Society, Fatehpur Shekhawati
      </div>
    </footer>
  );
}
