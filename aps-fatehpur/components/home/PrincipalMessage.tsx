"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { PlayfulSection, BlobDecoration } from "@/components/shared/PlayfulUI";

interface PersonData {
  name: string; designation: string; bio: string; photo?: string;
}

export function PrincipalMessage() {
  const [person, setPerson] = useState<PersonData>({
    name: "Nazneen Bano",
    designation: "Principal",
    bio: "<p>&ldquo;Education is not just about academics — it is about building character, instilling values, and preparing young minds to face the challenges of tomorrow. At our school, every child is valued and nurtured to reach their fullest potential.&rdquo;</p><p>&ldquo;We believe in holistic development — academics, sports, arts, and community service — all play an integral role in shaping well-rounded individuals. I invite parents and students to join our family and experience a journey of growth and discovery.&rdquo;</p>",
    photo: "/images/principal.jpg",
  });

  useEffect(() => {
    fetch("/api/persons?role=principal")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const p = r.data[0];
          setPerson({ name: p.name, designation: p.designation || "Principal", bio: p.bio || "", photo: p.photo || "/images/principal.jpg" });
        }
      })
      .catch(() => {});
  }, []);
  return (
    <PlayfulSection className="py-20 bg-white" blobs>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Principal Photo */}
            <div className="flex flex-col items-center text-center relative">
              <BlobDecoration className="absolute -top-6 -left-6 w-32 h-32 opacity-30 animate-float-slow" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
              <div className="w-48 h-48 rounded-full overflow-hidden mb-4 shadow-xl" style={{ outline: "4px solid var(--school-primary, #499f42)", outlineOffset: "2px" }}>
                <Image
                  src={person.photo || "/images/principal.jpg"}
                  alt={`${person.name} - ${person.designation}`}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-heading font-bold text-lg" style={{ color: "var(--text-dark, #22235b)" }}>
                {person.name}
              </h3>
              <p className="text-sm text-gray-500">
                {person.designation}
              </p>
            </div>

            {/* Message */}
            <div className="relative">
              <Quote className="h-10 w-10 mb-4 opacity-30" style={{ color: "var(--school-primary, #499f42)" }} />
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text-dark, #22235b)" }}>
                {person.designation}&apos;s Message
              </h2>
              <div
                className="text-base leading-relaxed prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: person.bio }}
              />
            </div>
          </div>
        </div>
      </div>
    </PlayfulSection>
  );
}
