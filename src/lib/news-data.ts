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

const raw: Array<Omit<Article, "body" | "image" | "excerpt"> & { excerpt?: string }> = [
  {
    id: 2001,
    title: "চাকরি: ব্যাংকিং খাতে বিশাল নিয়োগ বিজ্ঞপ্তি প্রকাশ",
    category: "chakri",
    author: "নিজস্ব প্রতিবেদক",
    location: "ঢাকা",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "দেশের অন্যতম শীর্ষ বেসরকারি ব্যাংকে কয়েকশ পদে জনবল নিয়োগের জন্য বিজ্ঞপ্তি প্রকাশ করা হয়েছে।"
  },
  {
    id: 2002,
    title: "চাকরি: সরকারি প্রাথমিক বিদ্যালয়ে শিক্ষক নিয়োগের প্রস্তুতি",
    category: "chakri",
    author: "শিক্ষা ডেস্ক",
    location: "ঢাকা",
    time: "০৯ আগস্ট ২০২৬",
    excerpt: "প্রাথমিক শিক্ষা অধিদপ্তর আগামী মাসেই নতুন নিয়োগ পরীক্ষা নেওয়ার পরিকল্পনা করছে।"
  },
  {
    id: 2003,
    title: "প্রযুক্তি: কৃত্রিম বুদ্ধিমত্তার নতুন যুগে স্মার্টফোন প্রযুক্তি",
    category: "prajukti",
    author: "আইটি ডেস্ক",
    location: "ঢাকা",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "নতুন প্রজন্মের স্মার্টফোনগুলোতে বিল্ট-ইন এআই ফিচার যোগ করা হচ্ছে যা ব্যবহারকারীর অভিজ্ঞতা বদলে দেবে।"
  },
  {
    id: 2004,
    title: "প্রযুক্তি: দেশেই তৈরি হচ্ছে উন্নত মানের ল্যাপটপ",
    category: "prajukti",
    author: "নিজস্ব প্রতিবেদক",
    location: "কালিয়াকৈর",
    time: "০৮ আগস্ট ২০২৬",
    excerpt: "হাইটেক পার্কে উৎপাদিত ল্যাপটপ এখন বিদেশের বাজারেও সুনাম কুড়াচ্ছে।"
  },
  {
    id: 2005,
    title: "প্রবাস: মধ্যপ্রাচ্যে বাংলাদেশিদের কর্মসংস্থান বাড়ছে",
    category: "probas",
    author: "প্রবাসী ডেস্ক",
    location: "দুবাই",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "সৌদি আরব ও আরব আমিরাতে দক্ষ জনশক্তি পাঠানোর হার গত বছরের তুলনায় ১৫ শতাংশ বৃদ্ধি পেয়েছে।"
  },
  {
    id: 2006,
    title: "প্রবাস: ইউরোপে বৈধ পথে যাওয়ার নতুন সুযোগ",
    category: "probas",
    author: "নিজস্ব প্রতিবেদক",
    location: "ঢাকা",
    time: "০৯ আগস্ট ২০২৬",
    excerpt: "ইতালি ও গ্রিসে মৌসুমি কাজের জন্য নির্দিষ্ট সংখ্যক কর্মী নেওয়ার চুক্তি সই হয়েছে।"
  },
  {
    id: 2007,
    title: "বিশেষ প্রতিবেদন: নদীতীরবর্তী মানুষের সংগ্রামী জীবন",
    category: "bishesh-protibedon",
    author: "আহমেদ রাজু",
    location: "কুড়িগ্রাম",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "নদী ভাঙনের শিকার পরিবারগুলো কীভাবে বারবার শূন্য থেকে নতুন করে শুরু করে, তারই এক সচিত্র প্রতিবেদন।"
  },
  {
    id: 2008,
    title: "বিশেষ প্রতিবেদন: ঢাকার যানজট নিরসনে নতুন ফ্লাইওভারের প্রভাব",
    category: "bishesh-protibedon",
    author: "নিজস্ব প্রতিবেদক",
    location: "ঢাকা",
    time: "০৮ আগস্ট ২০২৬",
    excerpt: "মেট্রোরেলের পর নতুন ফ্লাইওভারগুলো নগরের যানজট কতটুকু কমাতে পেরেছে তা নিয়ে আমাদের বিশেষ অনুসন্ধান।"
  },
  {
    id: 1001,
    title: "মতামত: নতুন প্রজন্মের সাংবাদিকতায় নৈতিকতার গুরুত্ব",
    category: "motamot",
    author: "ড. আশরাফ আলী",
    location: "ঢাকা",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "তথ্যপ্রযুক্তির এই যুগে বস্তুনিষ্ঠ সাংবাদিকতা বজায় রাখাই বড় চ্যালেঞ্জ।"
  },
  {
    id: 1002,
    title: "মতামত: কৃষি অর্থনীতিতে পরিবর্তনের ছোঁয়া",
    category: "motamot",
    author: "ফারজানা হক",
    location: "রাজশাহী",
    time: "০৯ আগস্ট ২০২৬",
    excerpt: "কৃষকদের নায্য মূল্য নিশ্চিত করতে না পারলে টেকসই উন্নয়ন সম্ভব নয়।"
  },
  {
    id: 1003,
    title: "মতামত: স্মার্ট বাংলাদেশ বিনির্মাণে তারুণ্যের ভূমিকা",
    category: "motamot",
    author: "তানভীর আহমেদ",
    location: "ঢাকা",
    time: "০৮ আগস্ট ২০২৬",
    excerpt: "দেশের ফ্রিল্যান্সারদের দক্ষতা বাড়াতে সরকারি ও বেসরকারি উদ্যোগ জরুরি।"
  },
  {
    id: 1004,
    title: "ভিডিও সংবাদ: ঢাকার উপকণ্ঠে ভয়াবহ অগ্নিকাণ্ড",
    category: "video-gallery",
    author: "নিজস্ব প্রতিবেদক",
    location: "গাজীপুর",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "গাজীপুরের একটি পোশাক কারখানায় অগ্নিকাণ্ডে ব্যাপক ক্ষয়ক্ষতির খবর পাওয়া গেছে।"
  },
  {
    id: 1005,
    title: "ভিডিও বিনোদন: আসছে নতুন বছরের বড় ধামাকা",
    category: "video-gallery",
    author: "বিনোদন ডেস্ক",
    location: "ঢাকা",
    time: "০৯ আগস্ট ২০২৬",
    excerpt: "ঢালিউডের জনপ্রিয় নায়কের নতুন ছবির ট্রেলার মুক্তি পেল আজ।"
  },
  {
    id: 1006,
    title: "ফটো গ্যালারি: বর্ষার সজীবতায় গ্রাম বাংলা",
    category: "photo-gallery",
    author: "ফটোগ্রাফার সুজন",
    location: "সিলেট",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "সিলেটের হাওর অঞ্চলে বর্ষার মনোরম দৃশ্য ফ্রেমবন্দি করা হয়েছে।"
  },
  {
    id: 1007,
    title: "বাংলা টকশো: সমসাময়িক রাজনীতি ও অর্থনীতি",
    category: "video-gallery",
    author: "নিউজ ডেস্ক",
    location: "ঢাকা",
    time: "১০ আগস্ট ২০২৬",
    excerpt: "আজকের টকশোতে দেশের শীর্ষ রাজনৈতিক বিশ্লেষকরা অংশ নিয়েছেন।"
  },
  {
    id: 1008,
    title: "বাংলা টকশো: ডিজিটাল বাংলাদেশের ভবিষ্যৎ",
    category: "video-gallery",
    author: "নিউজ ডেস্ক",
    location: "ঢাকা",
    time: "০৯ আগস্ট ২০২৬",
    excerpt: "তথ্যপ্রযুক্তি খাতের উন্নয়ন নিয়ে বিশেষ আলোচনা।"
  },
  {
    id: 1009,
    title: "ভিডিও বিনোদন: নতুন সিনেমার শুটিং শুরু",
    category: "video-gallery",
    author: "বিনোদন ডেস্ক",
    location: "এফডিসি",
    time: "০৮ আগস্ট ২০২৬",
    excerpt: "জনপ্রিয় জুটির নতুন সিনেমার মহরত অনুষ্ঠিত।"
  }
];

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
