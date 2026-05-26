"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { schools as configSchools } from "@/config/schools";
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
  Star,
  Pencil,
  BookOpen,
  GraduationCap,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/* ── Fallbacks (used until API data loads) ── */
const fallbackBranches = configSchools.filter((s) => s.slug !== "apsfatehpur");

const fallbackSlides = [
  { _id: "f1", image: "/images/hero-1.jpg", title: "Ashraful Uloom Educational & Welfare Society", subtitle: "A legacy of educational excellence since 1940 — Fatehpur Shekhawati" },
  { _id: "f2", image: "/images/hero-2.jpg", title: "Nurturing Minds, Building Futures", subtitle: "Proudly nurturing over 1,500 young minds with 100% results year after year" },
  { _id: "f3", image: "/images/hero-3.jpg", title: "Modern Education, Timeless Values", subtitle: "A network of institutions offering education in Hindi, English, Urdu, and Arabic" },
];

const fallbackToppers = [
  "/images/toppers/topper-1.jpg", "/images/toppers/topper-2.jpg", "/images/toppers/topper-3.jpg",
  "/images/toppers/topper-4.jpg", "/images/toppers/topper-5.jpg", "/images/toppers/topper-6.jpg",
  "/images/toppers/topper-7.jpg", "/images/toppers/topper-8.jpg", "/images/toppers/topper-9.jpg",
];

const defaultNavLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Branches", href: "#branches" },
  { label: "Toppers", href: "#toppers" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const defaultGroupFooterLinks = [
  { title: "Quick Links", links: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Branches", href: "#branches" },
    { label: "Toppers", href: "#toppers" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ]},
];

/* ── Decorative SVG Components ── */
function WaveTop() {
  return (
    <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
      <svg className="relative block w-full h-16 md:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor" />
      </svg>
    </div>
  );
}

function WaveBottom() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
      <svg className="relative block w-full h-16 md:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V92.65A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor" />
      </svg>
    </div>
  );
}

function BlobDecoration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-58.8,79.6,-45.4C87.4,-32,90,-15.5,88.2,-0.1C86.5,15.3,80.5,29.6,72.1,42.4C63.7,55.2,52.9,66.5,39.8,73.8C26.7,81.1,11.3,84.3,-3.2,82.6C-17.8,80.9,-31.5,74.2,-44.6,66.3C-57.7,58.3,-70.1,49,-77.3,36.5C-84.5,24,-86.5,8.2,-84.3,-6.6C-82.1,-21.4,-75.8,-35.2,-66.3,-46.1C-56.8,-57,-44.1,-65,-31,-72.2C-17.9,-79.4,-4.5,-85.8,8.1,-83.8C20.7,-81.8,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
    </svg>
  );
}

function FloatingDecorations() {
  return (
    <>
      <Star className="absolute top-20 left-[10%] h-6 w-6 text-[#d4e96e]/80 animate-float" />
      <Pencil className="absolute top-40 right-[15%] h-5 w-5 text-[#499f42]/70 animate-float-slow" />
      <Sparkles className="absolute bottom-32 left-[20%] h-7 w-7 text-[#9ab5db]/70 animate-bounce-gentle" />
      <Heart className="absolute top-1/3 right-[8%] h-5 w-5 text-[#499f42]/50 animate-float" />
      <BookOpen className="absolute bottom-20 right-[25%] h-6 w-6 text-[#9ab5db]/70 animate-float-slow" />
      <Star className="absolute top-1/2 left-[5%] h-4 w-4 text-[#d4e96e]/75 animate-bounce-gentle" />
    </>
  );
}

/* ───────────────────── CURSOR TRAIL ───────────────────── */
function CursorTrail() {
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Hide on touch devices
    if ("ontouchstart" in window) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${pos.current.x - 16}px, ${pos.current.y - 16}px)`;
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
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-6 w-6 rounded-full bg-gradient-to-br from-[#499f42]/50 to-[#9ab5db]/50 blur-[2px] hidden md:block ring-1 ring-[#499f42]/30"
      style={{ willChange: "transform" }}
    />
  );
}

/* ───────────────────── GROUP LANDING ───────────────────── */
interface SlideData { _id: string; image: string; title: string; subtitle: string; ctaLabel?: string; ctaLink?: string; }
interface BranchData { slug: string; name: string; domain?: string; logo?: string; cardImage?: string; cardBgColor?: string; websiteUrl?: string; theme: { primaryColor?: string }; contactInfo?: { phone?: string; email?: string; address?: string }; isActive: boolean; }
interface GalleryData { _id: string; type: string; image: string; videoUrl?: string; category?: string; title?: string; }

export function GroupLanding() {
  const [slides, setSlides] = useState<SlideData[]>(fallbackSlides);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [toppers, setToppers] = useState<string[]>(fallbackToppers);
  const [gallery, setGallery] = useState<GalleryData[]>([]);
  const [groupName, setGroupName] = useState("APS Group");
  const [contactInfo, setContactInfo] = useState({ phone: "+91-XXXX-XXXXXX", email: "info@apsfatehpur.com", address: "Fatehpur Shekhawati, Rajasthan, India" });
  const [groupHeaderNav, setGroupHeaderNav] = useState(defaultNavLinks);
  const [groupFooterLinks, setGroupFooterLinks] = useState(defaultGroupFooterLinks);

  useEffect(() => {
    fetch("/api/sliders?scope=group&limit=10").then(r => r.json())
      .then(r => { if (r.success && r.data?.length) setSlides(r.data); }).catch(() => {});

    fetch("/api/schools").then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const list = Array.isArray(r.data) ? r.data : [r.data];
          const branchList = list.filter((s: BranchData) => s.slug !== "apsfatehpur" && s.isActive);
          if (branchList.length) setBranches(branchList);
          const group = list.find((s: BranchData) => s.slug === "apsfatehpur");
          if (group?.name) setGroupName(group.name);
          if (group?.contactInfo) {
            setContactInfo({
              phone: group.contactInfo.phone || "+91-XXXX-XXXXXX",
              email: group.contactInfo.email || "info@apsfatehpur.com",
              address: group.contactInfo.address || "Fatehpur Shekhawati, Rajasthan, India",
            });
          }
          if (group?.headerNav?.length) {
            setGroupHeaderNav(group.headerNav.map((n: { label: string; href: string }) => ({ label: n.label, href: n.href })));
          }
          if (group?.footerLinks?.length) {
            setGroupFooterLinks(group.footerLinks);
          }
        }
      }).catch(() => {});

    fetch("/api/toppers?scope=all&limit=20").then(r => r.json())
      .then(r => { if (r.success && r.data?.length) setToppers(r.data.map((t: { photo?: string; name?: string }) => t.photo || "/images/toppers/topper-1.jpg")); }).catch(() => {});

    fetch("/api/gallery?scope=all&limit=20").then(r => r.json())
      .then(r => { if (r.success && r.data?.length) setGallery(r.data); }).catch(() => {});
  }, []);

  const branchCards = branches.length > 0
    ? branches.map(b => {
        const cfg = configSchools.find(c => c.slug === b.slug);
        return {
          slug: b.slug, name: b.name, domain: b.domain || cfg?.domain || "",
          logo: b.logo || cfg?.logo || "/logos/apsfatehpur.png",
          theme: { primary: b.theme?.primaryColor || cfg?.theme.primary || "#3FA34D" },
          image: b.cardImage || (cfg ? `/images/hero-${configSchools.indexOf(cfg)}.jpg` : "/images/school-campus.jpg"),
          cardBgColor: b.cardBgColor || "",
          websiteUrl: b.websiteUrl || "",
        };
      })
    : fallbackBranches.map(b => ({
        slug: b.slug, name: b.name, domain: b.domain,
        logo: b.logo, theme: { primary: b.theme.primary },
        image: `/images/hero-${configSchools.indexOf(b)}.jpg`,
        websiteUrl: "",
      }));

  return (
    <div className="min-h-screen flex flex-col bg-[#f6faf5] font-sans">
      <CursorTrail />
      <GroupNav groupName={groupName} navLinks={groupHeaderNav} />
      <HeroSlider slides={slides} />
      <AboutSection />
      <BranchesSection branches={branchCards} />
      <ToppersSection toppers={toppers} />
      <GallerySection items={gallery} />
      <GroupFooter branches={branchCards} contactInfo={contactInfo} groupName={groupName} footerLinks={groupFooterLinks} />
    </div>
  );
}

/* ───────────────────── NAV ───────────────────── */
function GroupNav({ groupName, navLinks }: { groupName: string; navLinks: { label: string; href: string }[] }) {
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
        scrolled || mobileOpen
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-[#9ab5db]/30"
          : "bg-transparent"
      }`}
    >
      <div className="w-full mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-18">
        <Link href="#home" className="flex items-center gap-3">
          <Image
            src="/logos/apsfatehpur.png"
            alt="APS Fatehpur"
            width={44}
            height={44}
            className="rounded-full ring-2 ring-[#499f42]/30"
          />
          <span
            className={`font-heading font-bold text-sm md:text-base transition-colors ${
              scrolled || mobileOpen ? "text-[#22235b]" : "text-white"
            }`}
          >
            {groupName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-[#499f42]/10 ${
                scrolled ? "text-[#22235b] hover:text-[#499f42]" : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-full transition-colors ${
            scrolled || mobileOpen ? "text-[#22235b] hover:bg-[#499f42]/10" : "text-white hover:bg-white/10"
          }`}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-[#9ab5db]/30 shadow-lg rounded-b-3xl mx-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-3.5 text-sm font-medium text-[#22235b] hover:bg-[#499f42]/5 transition-colors"
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
function HeroSlider({ slides }: { slides: SlideData[] }) {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section id="home" className="relative h-[65vh] md:h-[90vh] overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#22235b]/60 via-[#22235b]/40 to-[#499f42]/20" />
      </div>

      {/* Floating decorations on hero */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-24 left-[15%] h-5 w-5 text-[#d4e96e]/70 animate-float" />
        <Sparkles className="absolute top-32 right-[20%] h-6 w-6 text-[#9ab5db]/60 animate-float-slow" />
        <Star className="absolute bottom-40 left-[10%] h-4 w-4 text-white/50 animate-bounce-gentle" />
      </div>

      <div className="relative z-10 flex h-full items-center">
        <div className="w-full mx-auto px-6 md:px-12 lg:px-16">
          <div className="max-w-2xl text-white">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-4 drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 font-light">{slide.subtitle}</p>
            <div className="flex gap-4 flex-wrap">
              <a
                href="#branches"
                className="inline-block rounded-full px-8 py-3.5 font-semibold text-base bg-gradient-to-r from-[#499f42] to-[#3d8a37] text-white shadow-lg shadow-[#499f42]/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#499f42]/30"
              >
                Our Branches
              </a>
              <a
                href="#about"
                className="inline-block rounded-full px-8 py-3.5 font-semibold text-base border-2 border-white/70 text-white transition-all hover:scale-105 hover:bg-white/10 hover:border-white backdrop-blur-sm"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#499f42] to-[#3d8a37] text-white shadow-lg shadow-[#499f42]/30 hover:shadow-xl hover:shadow-[#499f42]/40 transition-all hover:scale-110"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#499f42] to-[#3d8a37] text-white shadow-lg shadow-[#499f42]/30 hover:shadow-xl hover:shadow-[#499f42]/40 transition-all hover:scale-110"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 bg-[#22235b]/40 backdrop-blur-sm rounded-full px-3 py-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-3 rounded-full transition-all ${
              i === current ? "w-10 bg-gradient-to-r from-[#499f42] to-[#d4e96e] shadow-md" : "w-3 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full text-[#f6faf5]">
        <WaveBottom />
      </div>
    </section>
  );
}

/* ───────────────────── ABOUT SECTION ───────────────────── */
function AboutSection() {
  const [title, setTitle] = useState("A Legacy of Educational Excellence");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("/images/school-campus.jpg");
  const [signoff, setSignoff] = useState("— Chairman, A.P.S School");

  const defaultContent = `<p>Founded in 1940 in Fatehpur Shekhawati, Ashraful Uloom Educational and Welfare Society emerged as a beacon of hope, dedicated to fostering education within an Islamic atmosphere and ideology.</p><p>The journey began with the establishment of Madarsa Islamiya Ashraful Uloom. Recognizing the need for modern education, the society founded Maulana Azad Middle School in 1962, which grew into a senior secondary institution by 1974.</p><p>In 2006, the society established Ashraful Uloom Public School. Today, it proudly nurtures over 1,500 young minds, achieving a remarkable legacy of 100% results year after year.</p>`;

  useEffect(() => {
    fetch("/api/pages?slug=group-about&school=apsfatehpur")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data) {
          const p = r.data;
          if (p.title) setTitle(p.title);
          if (p.content) setContent(p.content);
          if (p.featuredImage) setImage(p.featuredImage);
          if (p.seo?.metaDescription) setSignoff(p.seo.metaDescription);
        }
      })
      .catch(() => {});
  }, []);

  const displayContent = content || defaultContent;

  return (
    <section id="about" className="relative py-24 bg-gradient-to-br from-[#f6faf5] via-[#f0f5fa] to-[#f5faf0] overflow-hidden">
      {/* Background blobs */}
      <BlobDecoration className="absolute -top-20 -right-20 w-72 h-72 text-[#9ab5db]/30 animate-float-slow" />
      <BlobDecoration className="absolute -bottom-16 -left-16 w-56 h-56 text-[#499f42]/20 animate-float" />

      <FloatingDecorations />

      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl ring-4 ring-white">
              <Image
                src={image}
                alt="Campus"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl -z-10 opacity-60" style={{ background: "linear-gradient(135deg, #d4e96e, #9ab5db)" }} />
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#9ab5db]/30 to-[#499f42]/20 rounded-full -z-10 opacity-50" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#499f42] font-heading">
              ✨ About Us
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#22235b] leading-tight">
              {title}
            </h2>
            <div
              className="text-base leading-relaxed text-gray-600 space-y-4 [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
            <p className="text-sm italic text-[#499f42]/70 mt-6 font-medium">
              {signoff}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── BRANCHES (PLAYFUL CARDS) ───────────────────── */
interface BranchCard { slug: string; name: string; domain: string; logo: string; theme: { primary: string }; image: string; cardBgColor?: string; websiteUrl?: string; }

const pastelColors = [
  { bg: "from-[#f0f7ef] to-[#e8f5e6]", border: "border-[#499f42]/20", hover: "hover:shadow-[#499f42]/20" },
  { bg: "from-[#eef2f8] to-[#e4ecf5]", border: "border-[#9ab5db]/30", hover: "hover:shadow-[#9ab5db]/20" },
  { bg: "from-[#f8fae8] to-[#f2f7d8]", border: "border-[#d4e96e]/30", hover: "hover:shadow-[#d4e96e]/20" },
  { bg: "from-[#ecedf5] to-[#e2e3f0]", border: "border-[#22235b]/15", hover: "hover:shadow-[#22235b]/15" },
];

function BranchesSection({ branches }: { branches: BranchCard[] }) {
  return (
    <section id="branches" className="relative py-24 overflow-hidden bg-gradient-to-b from-[#e8f5e6]/40 via-[#eef2f8]/30 to-[#f8fae8]/40">
      {/* Top wave */}
      <div className="absolute top-0 left-0 w-full text-[#f6faf5]">
        <WaveTop />
      </div>

      {/* Background blobs */}
      <BlobDecoration className="absolute top-10 -left-20 w-64 h-64 text-[#499f42]/15 animate-float-slow" />
      <BlobDecoration className="absolute bottom-10 -right-16 w-48 h-48 text-[#9ab5db]/20 animate-float" />

      <FloatingDecorations />

      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#499f42] font-heading">
            🏫 Our Network
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#22235b]">
            Our Branches
          </h2>
          <p className="mt-4 text-gray-500 max-w-md mx-auto">
            Explore our network of educational institutions dedicated to excellence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {branches.map((school, i) => (
            <PlayfulBranchCard key={school.slug} school={school} colorSet={pastelColors[i % pastelColors.length]} />
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full text-[#f6faf5]">
        <WaveBottom />
      </div>
    </section>
  );
}

function PlayfulBranchCard({ school, colorSet }: { school: BranchCard; colorSet: typeof pastelColors[0] }) {
  const handleVisit = () => {
    if (school.websiteUrl) {
      window.location.href = school.websiteUrl;
    } else if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))) {
      window.location.href = `/?school=${school.slug}`;
    } else {
      window.location.href = `https://${school.domain}`;
    }
  };

  return (
    <Card
      className={`group cursor-pointer rounded-3xl border ${colorSet.border} bg-gradient-to-br ${colorSet.bg} shadow-md ${colorSet.hover} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
      onClick={handleVisit}
    >
      <div className="relative h-40 overflow-hidden rounded-t-3xl">
        <Image
          src={school.image || "/images/school-campus.jpg"}
          alt={school.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <CardContent className="p-5 text-center">
        <div className="mx-auto -mt-10 relative z-10 w-14 h-14 rounded-full bg-white shadow-lg ring-4 ring-white overflow-hidden mb-3">
          <Image
            src={school.logo}
            alt={school.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-heading font-bold text-base text-[#22235b] mb-2 leading-snug">
          {school.name}
        </h3>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#499f42] group-hover:text-[#3d8a37] transition-colors">
          Visit Website <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </CardContent>
    </Card>
  );
}

/* ───────────────────── TOPPERS ───────────────────── */
function ToppersSection({ toppers }: { toppers: string[] }) {
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
    <section id="toppers" className="relative py-24 bg-gradient-to-br from-[#f8fae8]/40 via-[#f6faf5] to-[#eef2f8]/40 overflow-hidden">
      {/* Background blobs */}
      <BlobDecoration className="absolute top-20 right-0 w-60 h-60 text-[#d4e96e]/30 animate-float" />
      <BlobDecoration className="absolute bottom-10 left-10 w-44 h-44 text-[#9ab5db]/25 animate-float-slow" />

      <div className="absolute inset-0 pointer-events-none">
        <GraduationCap className="absolute top-16 left-[12%] h-7 w-7 text-[#22235b]/40 animate-float" />
        <Star className="absolute top-24 right-[18%] h-5 w-5 text-[#d4e96e]/70 animate-bounce-gentle" />
        <Sparkles className="absolute bottom-20 left-[30%] h-6 w-6 text-[#9ab5db]/50 animate-float-slow" />
      </div>

      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#499f42] font-heading">
            🏆 Achievements
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#22235b]">
            Our Toppers
          </h2>
          <p className="mt-4 text-gray-500 max-w-md mx-auto">
            Celebrating the brilliant minds who make us proud every year
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          {toppers.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-52 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ring-2 ring-white bg-white"
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={toppers[lightboxIndex]}
              alt={`Topper ${lightboxIndex + 1}`}
              width={800}
              height={1000}
              className="max-h-[85vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────────────── GALLERY ───────────────────── */
function toEmbedUrl(url: string): string {
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

type GalleryItemLocal = {
  type: string;
  src: string;
  videoUrl?: string;
  alt: string;
  category: string;
};

const fallbackGallery: GalleryItemLocal[] = [
  { type: "image", src: "/images/gallery-3.jpg", alt: "School Event", category: "event" },
  { type: "image", src: "/images/gallery-4.jpg", alt: "Annual Function", category: "annual function" },
  { type: "video", src: "/images/gallery-5.jpg", videoUrl: "https://youtu.be/SeKI41D5kyk?si=1wKsNngee5Rdsr-q", alt: "School Promo Video", category: "event" },
  { type: "image", src: "/images/gallery-6.jpg", alt: "Classroom Activity", category: "classroom" },
  { type: "image", src: "/images/gallery-7.jpg", alt: "Sports Day", category: "sports" },
  { type: "video", src: "/images/gallery-8.jpg", videoUrl: "https://youtu.be/SeKI41D5kyk?si=1wKsNngee5Rdsr-q", alt: "Campus Tour", category: "general" },
  { type: "image", src: "/images/gallery-9.jpg", alt: "Cultural Program", category: "cultural" },
  { type: "image", src: "/images/gallery-10.jpg", alt: "Award Ceremony", category: "event" },
];

function GallerySection({ items }: { items: GalleryData[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState("all");

  const galleryItems: GalleryItemLocal[] = items.length > 0
    ? items.map(g => ({ type: g.type, src: g.image, videoUrl: g.videoUrl, alt: g.title || "Gallery", category: g.category || "general" }))
    : fallbackGallery;

  const categories = ["all", ...Array.from(new Set(galleryItems.map(g => g.category)))];
  const filtered = catFilter === "all" ? galleryItems : galleryItems.filter((g) => g.category === catFilter);
  const current = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <section id="gallery" className="relative py-24 overflow-hidden bg-gradient-to-b from-[#eef2f8]/40 via-[#f0f7ef]/30 to-[#f8fae8]/40">
      {/* Top wave */}
      <div className="absolute top-0 left-0 w-full text-[#f6faf5]">
        <WaveTop />
      </div>

      {/* Background blobs */}
      <BlobDecoration className="absolute -top-10 right-10 w-52 h-52 text-[#9ab5db]/25 animate-float" />
      <BlobDecoration className="absolute bottom-20 -left-10 w-40 h-40 text-[#499f42]/15 animate-float-slow" />

      <FloatingDecorations />

      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#499f42] font-heading">
            📸 Memories
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#22235b]">
            Our Gallery
          </h2>
        </div>

        {/* Category Filter tabs */}
        <div className="flex justify-center gap-2 flex-wrap mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCatFilter(cat); setLightboxIndex(null); }}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                catFilter === cat
                  ? "bg-gradient-to-r from-[#499f42] to-[#3d8a37] text-white shadow-lg shadow-[#499f42]/20"
                  : "bg-white text-[#22235b] hover:bg-[#499f42]/5 border border-[#9ab5db]/30 shadow-sm"
              }`}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item, i) => (
            <div
              key={`${item.src}-${i}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-2 ring-white"
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#22235b]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {item.type === "video" ? (
                  <Play className="h-10 w-10 text-white drop-shadow-lg" />
                ) : (
                  <ZoomIn className="h-8 w-8 text-white" />
                )}
              </div>
              {item.type === "video" && (
                <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  VIDEO
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full text-[#22235b]">
        <WaveBottom />
      </div>

      {/* Lightbox */}
      {current && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
                  className="absolute inset-0 w-full h-full rounded-2xl"
                />
              </div>
            ) : (
              <Image
                src={current.src}
                alt={current.alt}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto mx-auto object-contain rounded-2xl"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────────────── FOOTER ───────────────────── */
function GroupFooter({ branches, contactInfo, groupName, footerLinks }: { branches: BranchCard[]; contactInfo: { phone: string; email: string; address: string }; groupName: string; footerLinks: { title: string; links: { label: string; href: string }[] }[] }) {
  return (
    <footer id="contact" className="relative bg-[#22235b] text-white overflow-hidden">
      {/* Background decorative elements */}
      <BlobDecoration className="absolute top-10 right-10 w-60 h-60 text-[#499f42]/10 animate-float-slow" />
      <BlobDecoration className="absolute bottom-20 left-10 w-40 h-40 text-[#9ab5db]/10 animate-float" />

      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logos/apsfatehpur.png"
                alt="APS"
                width={44}
                height={44}
                className="rounded-full ring-2 ring-[#499f42]/20"
              />
              <span className="font-heading font-bold text-lg">{groupName}</span>
            </div>
            <p className="text-sm text-[#9ab5db]/80 leading-relaxed">
              {groupName} — Nurturing minds, building futures since 1940.
            </p>
          </div>

          {/* Dynamic footer link groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-heading font-bold mb-4 text-[#d4e96e]">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[#9ab5db]/70 hover:text-white transition-colors hover:pl-1 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Our Branches */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-[#d4e96e]">Our Branches</h4>
            <ul className="space-y-2.5">
              {branches.map((school) => (
                <li key={school.slug}>
                  <a
                    href={`https://${school.domain}`}
                    onClick={(e) => {
                      if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))) {
                        e.preventDefault();
                        window.location.href = `/?school=${school.slug}`;
                      }
                    }}
                    className="text-sm text-[#9ab5db]/70 hover:text-white transition-colors hover:pl-1 inline-block"
                  >
                    {school.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-[#d4e96e]">Contact</h4>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-sm text-[#9ab5db]/70">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#499f42]" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#9ab5db]/70">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#499f42]" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#9ab5db]/70">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#499f42]" />
                <span>{contactInfo.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#9ab5db]/20 text-center py-5 text-sm text-[#9ab5db]/50">
        © {new Date().getFullYear()} {groupName}. All rights reserved.
      </div>
    </footer>
  );
}
