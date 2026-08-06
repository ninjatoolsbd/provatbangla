import { kbImage } from "@/lib/kb-images";

export type Category = { slug: string; name: string };

export const categories: Category[] = [
  { slug: "sorboshesh", name: "সর্বশেষ" },
  { slug: "bangladesh", name: "বাংলাদেশ" },
  { slug: "antorjatik", name: "আন্তর্জাতিক" },
  { slug: "politics", name: "রাজনীতি" },
  { slug: "shikkha", name: "শিক্ষা" },
  { slug: "apradh", name: "অপরাধ" },
  { slug: "chakri", name: "চাকরি" },
  { slug: "prajukti", name: "প্রযুক্তি" },
  { slug: "khela", name: "খেলা" },
  { slug: "binodon", name: "বিনোদন" },
  { slug: "shilpo-sahitto", name: "শিল্প ও সাহিত্য" },
  { slug: "jibonjapon", name: "জীবনযাপন" },
  { slug: "cholonbil", name: "চলনবিল" },
  { slug: "video", name: "ভিডিও" },
  { slug: "health", name: "স্বাস্থ্য" },
  { slug: "probas", name: "প্রবাস" },
  { slug: "orthoniti", name: "অর্থনীতি" },
  { slug: "ain-adalat", name: "আইন-আদালত" },
  { slug: "motamot", name: "মতামত" },
  { slug: "bishesh-protibedon", name: "বিশেষ প্রতিবেদন" },
  { slug: "photo-gallery", name: "ফটো গ্যালারি" },
  { slug: "onnanno", name: "অন্যান্য" },
  
];

export type Article = {
  id: number;
  title: string;
  kicker?: string;
  excerpt: string;
  body: string[];
  category: string;
  author: string;
  location: string;
  time: string;
  image: string;
};

const bodyOf = (title: string, cat: string): string[] => [
  `${title} — এ বিষয়ে সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, পরিস্থিতি নিয়মিত পর্যবেক্ষণে রাখা হয়েছে এবং প্রয়োজনীয় সব ব্যবস্থা দ্রুততম সময়ের মধ্যে নেওয়া হবে। স্থানীয় বাসিন্দারা বলছেন, দীর্ঘদিনের এ সমস্যার স্থায়ী সমাধান না হলে ভোগান্তি আরও বাড়বে।`,
  `রোববার সকালে আয়োজিত এক অনুষ্ঠানে বক্তারা বলেন, স্বচ্ছতা ও জবাবদিহি নিশ্চিত করাই এখন সবচেয়ে বড় চ্যালেঞ্জ। তারা মনে করেন, সমন্বিত উদ্যোগ ছাড়া কাঙ্ক্ষিত অগ্রগতি সম্ভব নয়।`,
  `বিশ্লেষকরা বলছেন, ${cat} খাতে গত কয়েক বছরে উল্লেখযোগ্য পরিবর্তন এলেও মাঠপর্যায়ে তার সুফল পুরোপুরি পৌঁছায়নি। নীতিনির্ধারকদের উচিত তথ্যভিত্তিক সিদ্ধান্ত নেওয়া।`,
  `সংশ্লিষ্ট একজন কর্মকর্তা নাম প্রকাশ না করার শর্তে বলেন, তদন্ত প্রতিবেদন হাতে পাওয়ার পর পরবর্তী পদক্ষেপ নেওয়া হবে। এ বিষয়ে একটি কমিটিও গঠন করা হয়েছে বলে জানা গেছে।`,
  `এদিকে সাধারণ মানুষের প্রত্যাশা, প্রতিশ্রুতি নয়— দৃশ্যমান কাজই তাদের আস্থা ফেরাতে পারে। আগামী সপ্তাহে এ নিয়ে আরও একটি বৈঠক অনুষ্ঠিত হওয়ার কথা রয়েছে।`,
];

const raw: Array<Omit<Article, "body" | "image" | "excerpt"> & { excerpt?: string }> = [];

export const articles: Article[] = raw.map((a) => ({
  ...a,
  excerpt:
    a.excerpt ??
    `${a.title} নিয়ে সংশ্লিষ্টদের সঙ্গে কথা বলে জানা গেছে, বিষয়টি গুরুত্বের সঙ্গে দেখা হচ্ছে। বিস্তারিত প্রতিবেদনে থাকছে ঘটনার পটভূমি, প্রতিক্রিয়া ও পরবর্তী করণীয়।`,
  body: bodyOf(a.title, categoryName(a.category)),
  image: kbImage(a.id),
}));

export function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function byCategory(slug: string): Article[] {
  if (slug === "sorboshesh") return articles;
  return articles.filter((a) => a.category === slug);
}

export function getArticle(id: number): Article | undefined {
  return articles.find((a) => a.id === id);
}

export function related(article: Article): Article[] {
  return byCategory(article.category)
    .filter((a) => a.id !== article.id)
    .slice(0, 4);
}

export const banglaDate = "২ আগস্ট ২০২৬, ১৮ শ্রাবণ ১৪৩৩";
