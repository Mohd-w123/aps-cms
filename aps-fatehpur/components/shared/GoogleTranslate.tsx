"use client";

import React, { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ur", label: "Urdu", native: "اردو", flag: "🇵🇰" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦" },
] as const;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslate({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Read existing googtrans cookie if set
    const match = document.cookie.match(/googtrans=\/([^/]+)\/([^;]+)/);
    if (match && match[2]) {
      setCurrentLang(match[2]);
    }

    // Initialize Google Translate script once globally
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,ur,ar",
              autoDisplay: false,
            },
            "global_google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    const host = window.location.hostname;
    const cookieValue = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${host};`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${host};`;

    if (langCode === "en") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;
    }

    const selectElem = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const buttonStyle =
    variant === "dark"
      ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
      : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} suppressHydrationWarning>
      {/* Modern Language Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${buttonStyle}`}
        aria-expanded={isOpen}
        aria-label="Select Language"
        suppressHydrationWarning
      >
        <Globe className="h-3.5 w-3.5 opacity-80" />
        <span className="mr-0.5">{mounted ? currentLangObj.flag : "🇬🇧"}</span>
        <span>{mounted ? currentLangObj.native : "English"}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Language Options Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-[999] py-1 text-gray-800 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <div>
                    <span className="block">{lang.native}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">{lang.label}</span>
                  </div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
