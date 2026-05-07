"use client";

import { useState, useEffect } from "react";

import { useScript } from "./script-provider";

export function ScriptToggle() {
  const { script, toggle } = useScript();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggle}
      data-no-transliterate
      title={
        script === "lat"
          ? "Prebaci na ćirilicu"
          : "Prebaci na latinicu"
      }
      className="fixed top-4 right-4 z-[120] flex h-9 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-700"
    >
      <span className="text-base leading-none">
        {script === "lat" ? "Ћ" : "L"}
      </span>
      <span>{script === "lat" ? "Ћирилица" : "Latinica"}</span>
    </button>
  );
}
