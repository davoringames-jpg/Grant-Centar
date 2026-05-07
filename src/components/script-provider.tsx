"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";

type Script = "lat" | "cyr";

const ScriptContext = createContext<{ script: Script; toggle: () => void }>({
  script: "cyr",
  toggle: () => {},
});

export const useScript = () => useContext(ScriptContext);

// ── Latinica → Ćirilica (fallback za tekst iz baze koji stigne u latinici) ──
const LAT_TO_CYR_MAP: Record<string, string> = {
  A: "А", B: "Б", C: "Ц", D: "Д", E: "Е", F: "Ф", G: "Г",
  H: "Х", I: "И", J: "Ј", K: "К", L: "Л", M: "М", N: "Н",
  O: "О", P: "П", R: "Р", S: "С", T: "Т", U: "У", V: "В",
  Z: "З", Q: "К", W: "В", X: "Кс", Y: "И",
  a: "а", b: "б", c: "ц", d: "д", e: "е", f: "ф", g: "г",
  h: "х", i: "и", j: "ј", k: "к", l: "л", m: "м", n: "н",
  o: "о", p: "п", r: "р", s: "с", t: "т", u: "у", v: "в",
  z: "з", q: "к", w: "в", x: "кс", y: "и",
  Š: "Ш", š: "ш", Č: "Ч", č: "ч", Ć: "Ћ", ć: "ћ",
  Đ: "Ђ", đ: "ђ", Ž: "Ж", ž: "ж",
};

// "dj" namjerno izostavljeno — nije digraf u srpskoj latinici (ђ = đ).
function srLatToCyr(text: string): string {
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    const c1 = text[i];
    const c2 = text[i + 1] ?? "";
    const pairLow = (c1 + c2).toLowerCase();
    const upFirst = c1 === c1.toUpperCase() && c1 !== c1.toLowerCase();
    if (pairLow === "lj") { result.push(upFirst ? "Љ" : "љ"); i += 2; }
    else if (pairLow === "nj") { result.push(upFirst ? "Њ" : "њ"); i += 2; }
    else if (pairLow === "dž") { result.push(upFirst ? "Џ" : "џ"); i += 2; }
    else { result.push(LAT_TO_CYR_MAP[c1] ?? c1); i++; }
  }
  return result.join("");
}

// ── Ćirilica → Latinica (osnovna konverzija — uvijek jednoznačna) ──
const CYR_TO_LAT_MAP: Record<string, string> = {
  А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ж: "Ž", З: "Z",
  И: "I", Ј: "J", К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P",
  Р: "R", С: "S", Т: "T", У: "U", Ф: "F", Х: "H", Ц: "C", Ч: "Č",
  Ш: "Š", Ђ: "Đ", Ћ: "Ć",
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "ž", з: "z",
  и: "i", ј: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "č",
  ш: "š", ђ: "đ", ћ: "ć",
  // Диграфи
  Љ: "Lj", љ: "lj", Њ: "Nj", њ: "nj", Џ: "Dž", џ: "dž",
};

function srCyrToLat(text: string): string {
  return text.split("").map((ch) => CYR_TO_LAT_MAP[ch] ?? ch).join("");
}

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "CODE", "INPUT", "TEXTAREA", "SELECT",
]);

function getTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-transliterate]"))
        return NodeFilter.FILTER_REJECT;
      if (!(node.textContent ?? "").trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) {
    nodes.push(node as Text);
  }
  return nodes;
}

export function ScriptProvider({ children }: { children: ReactNode }) {
  const [script, setScript] = useState<Script>(() => {
    if (typeof window === "undefined") {
      return "cyr";
    }
    const saved = localStorage.getItem("grantportal_script") as Script | null;
    return saved === "lat" ? "lat" : "cyr";
  });
  const originalTexts = useRef<Map<Text, string>>(new Map());
  const observer = useRef<MutationObserver | null>(null);
  const isTransliterating = useRef(false);

  const applyTransliteration = useCallback((root: Node = document.body) => {
    if (isTransliterating.current) return;
    isTransliterating.current = true;
    const nodes = getTextNodes(root);
    for (const node of nodes) {
      if (!originalTexts.current.has(node)) {
        originalTexts.current.set(node, node.textContent ?? "");
      }
      const original = originalTexts.current.get(node)!;
      node.textContent = srLatToCyr(original);
    }
    isTransliterating.current = false;
  }, []);

  const applyLatinTransliteration = useCallback((root: Node = document.body) => {
    if (isTransliterating.current) return;
    isTransliterating.current = true;
    const nodes = getTextNodes(root);
    for (const node of nodes) {
      if (!originalTexts.current.has(node)) {
        originalTexts.current.set(node, node.textContent ?? "");
      }
      const original = originalTexts.current.get(node)!;
      node.textContent = srCyrToLat(original);
    }
    isTransliterating.current = false;
  }, []);

  const removeTransliteration = useCallback(() => {
    originalTexts.current.forEach((originalText, node) => {
      if (node.isConnected) {
        node.textContent = originalText;
      }
    });
    originalTexts.current.clear();
  }, []);

  useEffect(() => {
    const applyFn = script === "cyr" ? applyTransliteration : applyLatinTransliteration;

    removeTransliteration();
    applyFn();

    observer.current = new MutationObserver((mutations) => {
      if (isTransliterating.current) return;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            applyFn(node);
          }
        }
      }
    });

    observer.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [script, applyTransliteration, applyLatinTransliteration, removeTransliteration]);

  const toggle = useCallback(() => {
    setScript((prev) => {
      const next = prev === "lat" ? "cyr" : "lat";
      localStorage.setItem("grantportal_script", next);
      return next;
    });
  }, []);

  return (
    <ScriptContext.Provider value={{ script, toggle }}>
      {children}
    </ScriptContext.Provider>
  );
}
