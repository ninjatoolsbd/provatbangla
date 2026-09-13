/**
 * অন্য সংবাদমাধ্যমের নাম, ডোমেইন ও প্রতিবেদকের বাইলাইন সরিয়ে "প্রভাত বাংলা" বসায়।
 */

export const SITE_NAME = "প্রভাত বাংলা";
export const SITE_DESK = "প্রভাত বাংলা ডেস্ক";

/** পরিচিত সংবাদমাধ্যমের নাম (বাংলা ও ইংরেজি)। */
const OUTLETS = [
  "প্রথম আলো", "কালবেলা", "কালের কণ্ঠ", "যুগান্তর", "সমকাল", "ইত্তেফাক", "বাংলাদেশ প্রতিদিন",
  "আজকের পত্রিকা", "দৈনিক শিক্ষা", "দৈনিক শিক্ষাডটকম", "ডেইলি সান", "দৈনিক সান", "প্রবাসীর দিগন্ত",
  "দৈনিক আমাদের সময়", "আমাদের সময়", "মানবজমিন", "বণিক বার্তা", "নয়া দিগন্ত", "ইনকিলাব",
  "জনকণ্ঠ", "দেশ রূপান্তর", "ঢাকা পোস্ট", "জাগো নিউজ", "বাংলা ট্রিবিউন", "রাইজিংবিডি",
  "বিডিনিউজ টোয়েন্টিফোর", "সময় টিভি", "চ্যানেল টোয়েন্টিফোর", "যমুনা টিভি", "একাত্তর টিভি",
  "The Daily Star", "Daily Star", "Daily Sun", "Prothom Alo", "Dhaka Tribune", "New Age",
  "Financial Express", "The Business Standard", "Ajker Patrika", "Dainik Shiksha",
  "The Good Morning", "Al Jazeera", "Reuters", "Associated Press", "CNN", "BBC",
  "The New York Times", "New York Times", "Washington Post", "The Guardian", "AFP", "PTI", "ANI",
];

const DOMAIN_RE =
  /\b(?:www\.)?[a-z0-9-]+\.(?:com|net|org|news|tv|info|co|bd|in|uk)(?:\.[a-z]{2})?\b/gi;

const OWN_DOMAIN_RE = /provatbangla(news)?\.com/i;

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * টেক্সট থেকে অন্য আউটলেট/ডোমেইন/বাইলাইন সরিয়ে প্রভাত বাংলা বসায়।
 * extraNames-এ অটো সোর্সের নাম ও হোস্ট পাঠানো যায়।
 */
export function sanitizeBrand(input: string, extraNames: string[] = []): string {
  if (!input) return input;
  let out = input;

  // "সূত্র: xyz" ধরনের ক্রেডিট লাইন সম্পূর্ণ বাদ
  out = out.replace(/^\s*(সূত্র|তথ্যসূত্র|Source)\s*[:：].*$/gim, "");

  const names = [...OUTLETS, ...extraNames.filter((n) => n && n.trim().length > 2)];
  for (const name of names) {
    const re = new RegExp(escapeRe(name.trim()), "gi");
    out = out.replace(re, SITE_NAME);
  }

  // ডোমেইন উল্লেখ থাকলে প্রভাত বাংলা
  out = out.replace(DOMAIN_RE, (match) => (OWN_DOMAIN_RE.test(match) ? match : SITE_NAME));

  // বাইলাইন/প্রতিবেদক লাইন
  out = out
    .replace(/^\s*(নিজস্ব প্রতিবেদক|স্টাফ রিপোর্টার|অনলাইন ডেস্ক|আন্তর্জাতিক ডেস্ক|নিউজ ডেস্ক)\s*[:：,-]?\s*/gim, "")
    .replace(/^\s*[^\n।]{2,40}\s*,\s*(প্রতিনিধি|জেলা প্রতিনিধি|উপজেলা প্রতিনিধি|সংবাদদাতা)\s*[:：]?\s*$/gim, "")
    .replace(/\b(?:Reporter|Correspondent|Staff Correspondent)\b\s*[:：,-]?/gi, "")
    .replace(new RegExp(`(?:${SITE_NAME}\\s*){2,}`, "g"), `${SITE_NAME} `);

  return out.replace(/\n{3,}/g, "\n\n").trim();
}

/** দুই টেক্সটের শব্দ-শিঙ্গল সাদৃশ্য (0-1)। কপি-পেস্ট ধরার জন্য। */
export function similarityRatio(a: string, b: string): number {
  const shingles = (text: string) => {
    const words = text
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");
    const set = new Set<string>();
    for (let i = 0; i + 4 <= words.length; i += 1) set.add(words.slice(i, i + 4).join(" "));
    return set;
  };
  const first = shingles(a);
  const second = shingles(b);
  if (first.size === 0 || second.size === 0) return 0;
  let shared = 0;
  for (const item of first) if (second.has(item)) shared += 1;
  return shared / Math.min(first.size, second.size);
}
