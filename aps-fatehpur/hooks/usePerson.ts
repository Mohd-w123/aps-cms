"use client";

import { useEffect, useState } from "react";
import { useSchool } from "@/hooks/useSchool";

export interface PersonData {
  name: string;
  designation: string;
  bio: string;
  photo?: string;
  qualifications?: string;
}

export function usePerson(role: "director" | "chairman" | "principal") {
  const { slug } = useSchool();
  const [person, setPerson] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || slug === "apsfatehpur") {
      setPerson(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/persons?role=${role}&school=${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data?.length > 0) {
          setPerson(json.data[0]);
        } else {
          setPerson(null);
        }
      })
      .catch(() => {
        if (!cancelled) setPerson(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, slug]);

  return { person, loading, slug };
}
