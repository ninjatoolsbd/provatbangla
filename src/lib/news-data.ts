import { kbImage } from "@/lib/kb-images";

export type Category = { slug: string; name: string };

export const categories: Category[] = [
  { slug: "jatiyo", name: "জাতীয়" },
  { slug: "rajniti", name: "রাজনীতি" },
  { slug: "sarabangla", name: "সারাবাংলা" },
  { slug: "antorjatik", name: "আন্তর্জাতিক" },
  { slug: "khela", name: "খেলা" },
  { slug: "binodon", name: "বিনোদন" },
  { slug: "arthonity", name: "অর্থনীতি" },
  { slug: "prajukti", name: "প্রযুক্তি" },
  { slug: "shikkha", name: "শিক্ষা" },
  { slug: "sasthyo", name: "স্বাস্থ্য" },
  { slug: "apradh", name: "অপরাধ" },
  { slug: "motamot", name: "মতামত" },
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

const raw: Array<Omit<Article, "body" | "image" | "excerpt"> & { excerpt?: string }> = [
  { id: 101, title: "পুলিশ কোনো দলের লাঠিয়াল বাহিনী নয়, বললেন স্বরাষ্ট্র উপদেষ্টা", kicker: "রাজশাহীতে সমাবেশ", category: "jatiyo", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "১০ মিনিট আগে" },
  { id: 102, title: "এলএনজি সরবরাহ কমায় দেশজুড়ে তীব্র গ্যাস সংকট", category: "jatiyo", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "২৫ মিনিট আগে" },
  { id: 103, title: "১৬ লাখ আবেদনকারী স্মার্টকার্ডের অপেক্ষায়", kicker: "ড্রাইভিং লাইসেন্স", category: "jatiyo", author: "বিশেষ প্রতিনিধি", location: "ঢাকা", time: "৪০ মিনিট আগে" },
  { id: 104, title: "টানা সাড়ে ৭ ঘণ্টা বিদ্যুৎ থাকবে না যেসব এলাকায়", category: "jatiyo", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "১ ঘণ্টা আগে" },
  { id: 105, title: "রাজধানীর সড়কে শৃঙ্খলা ফেরাতে নতুন পরিকল্পনা", category: "jatiyo", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "২ ঘণ্টা আগে" },

  { id: 201, title: "স্থানীয় সরকার নির্বাচন পাঁচ ধাপে করতে চায় বড় দলগুলো", kicker: "নির্বাচন ভাবনা", category: "rajniti", author: "রাজনৈতিক প্রতিবেদক", location: "ঢাকা", time: "৩৫ মিনিট আগে" },
  { id: 202, title: "সংস্কার প্রশ্নে ঐকমত্যের ইঙ্গিত, বৈঠক আগামী সপ্তাহে", category: "rajniti", author: "রাজনৈতিক প্রতিবেদক", location: "ঢাকা", time: "১ ঘণ্টা আগে" },
  { id: 203, title: "তৃণমূলে সংগঠন গোছাতে মাঠে নেতাকর্মীরা", category: "rajniti", author: "নিজস্ব প্রতিবেদক", location: "চট্টগ্রাম", time: "৩ ঘণ্টা আগে" },
  { id: 204, title: "জোট গঠনের আলোচনা নতুন মোড় নিল", category: "rajniti", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "৪ ঘণ্টা আগে" },

  { id: 301, title: "পদ্মার ভাঙনে দিশাহারা তিন গ্রামের মানুষ", category: "sarabangla", author: "জেলা প্রতিনিধি", location: "শরীয়তপুর", time: "৫০ মিনিট আগে" },
  { id: 302, title: "সেতুর অভাবে বাঁশের সাঁকোই ভরসা ১২ গ্রামের", category: "sarabangla", author: "উপজেলা প্রতিনিধি", location: "নেত্রকোনা", time: "২ ঘণ্টা আগে" },
  { id: 303, title: "হাওরে আগাম বন্যার শঙ্কা, ব্যস্ত কৃষকরা", category: "sarabangla", author: "জেলা প্রতিনিধি", location: "সুনামগঞ্জ", time: "৫ ঘণ্টা আগে" },
  { id: 304, title: "চা-বাগানের শ্রমিকদের মজুরি বৃদ্ধির দাবিতে কর্মবিরতি", category: "sarabangla", author: "জেলা প্রতিনিধি", location: "মৌলভীবাজার", time: "৬ ঘণ্টা আগে" },

  { id: 401, title: "মধ্যপ্রাচ্যে উত্তেজনা, আরও রিফুয়েলিং বিমান পাঠাচ্ছে যুক্তরাষ্ট্র", kicker: "বড় হামলার ঘনঘটা", category: "antorjatik", author: "আন্তর্জাতিক ডেস্ক", location: "ওয়াশিংটন", time: "৩০ মিনিট আগে" },
  { id: 402, title: "‘যতবার ইচ্ছা পশ্চিমবঙ্গে আসুন, পূর্ণ নিরাপত্তা পাবেন’", category: "antorjatik", author: "আন্তর্জাতিক ডেস্ক", location: "কলকাতা", time: "১ ঘণ্টা আগে" },
  { id: 403, title: "ইউরোপে তাপপ্রবাহ, জারি সর্বোচ্চ সতর্কতা", category: "antorjatik", author: "আন্তর্জাতিক ডেস্ক", location: "প্যারিস", time: "৩ ঘণ্টা আগে" },
  { id: 404, title: "বিশ্ব বাণিজ্যে নতুন শুল্কযুদ্ধের আশঙ্কা", category: "antorjatik", author: "আন্তর্জাতিক ডেস্ক", location: "জেনেভা", time: "৪ ঘণ্টা আগে" },

  { id: 501, title: "শেষ ওভারের নাটকীয়তায় বাংলাদেশের রোমাঞ্চকর জয়", kicker: "সিরিজ নির্ধারণী ম্যাচ", category: "khela", author: "ক্রীড়া প্রতিবেদক", location: "মিরপুর", time: "১৫ মিনিট আগে" },
  { id: 502, title: "বিশ্বকাপ প্রস্তুতিতে ২২ সদস্যের দল ঘোষণা", category: "khela", author: "ক্রীড়া ডেস্ক", location: "ঢাকা", time: "২ ঘণ্টা আগে" },
  { id: 503, title: "ইউরোপিয়ান লিগে হ্যাটট্রিক করে শিরোনামে তরুণ ফরোয়ার্ড", category: "khela", author: "ক্রীড়া ডেস্ক", location: "লন্ডন", time: "৫ ঘণ্টা আগে" },
  { id: 504, title: "সাফ চ্যাম্পিয়নশিপের সূচি চূড়ান্ত", category: "khela", author: "ক্রীড়া প্রতিবেদক", location: "ঢাকা", time: "৭ ঘণ্টা আগে" },

  { id: 601, title: "ঈদের নাটকে ফিরছেন জনপ্রিয় জুটি", category: "binodon", author: "বিনোদন প্রতিবেদক", location: "ঢাকা", time: "৪৫ মিনিট আগে" },
  { id: 602, title: "নতুন সিনেমার শুটিং শুরু কক্সবাজারে", category: "binodon", author: "বিনোদন ডেস্ক", location: "কক্সবাজার", time: "৩ ঘণ্টা আগে" },
  { id: 603, title: "গানের অ্যালবাম নিয়ে ফিরছেন এই সংগীতশিল্পী", category: "binodon", author: "বিনোদন ডেস্ক", location: "ঢাকা", time: "৬ ঘণ্টা আগে" },
  { id: 604, title: "ওটিটিতে দর্শকপ্রিয়তার শীর্ষে দেশীয় সিরিজ", category: "binodon", author: "বিনোদন ডেস্ক", location: "ঢাকা", time: "৮ ঘণ্টা আগে" },

  { id: 701, title: "রেমিট্যান্সে রেকর্ড, রিজার্ভে স্বস্তির আভাস", category: "arthonity", author: "অর্থনৈতিক প্রতিবেদক", location: "ঢাকা", time: "২০ মিনিট আগে" },
  { id: 702, title: "পুঁজিবাজারে সূচকের ঊর্ধ্বমুখী প্রবণতা", category: "arthonity", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "১ ঘণ্টা আগে" },
  { id: 703, title: "নিত্যপণ্যের বাজারে অস্থিরতা, নজরদারি বাড়ানোর নির্দেশ", category: "arthonity", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "৪ ঘণ্টা আগে" },
  { id: 704, title: "পোশাক রপ্তানিতে প্রবৃদ্ধি ৯ শতাংশ", category: "arthonity", author: "অর্থনৈতিক প্রতিবেদক", location: "ঢাকা", time: "৯ ঘণ্টা আগে" },

  { id: 801, title: "দেশে চালু হচ্ছে নতুন ডিজিটাল পেমেন্ট সেবা", category: "prajukti", author: "প্রযুক্তি ডেস্ক", location: "ঢাকা", time: "১ ঘণ্টা আগে" },
  { id: 802, title: "কৃত্রিম বুদ্ধিমত্তা ব্যবহারে নীতিমালা তৈরির উদ্যোগ", category: "prajukti", author: "প্রযুক্তি ডেস্ক", location: "ঢাকা", time: "৩ ঘণ্টা আগে" },
  { id: 803, title: "স্মার্টফোনের দাম কমার আভাস", category: "prajukti", author: "প্রযুক্তি ডেস্ক", location: "ঢাকা", time: "৭ ঘণ্টা আগে" },

  { id: 901, title: "প্রাথমিকের ১৪ হাজার শিক্ষকের যোগদান ১ অক্টোবর", category: "shikkha", author: "শিক্ষা প্রতিবেদক", location: "ঢাকা", time: "৫৫ মিনিট আগে" },
  { id: 902, title: "এইচএসসির ফল প্রকাশ চলতি মাসেই", category: "shikkha", author: "শিক্ষা প্রতিবেদক", location: "ঢাকা", time: "২ ঘণ্টা আগে" },
  { id: 903, title: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার তারিখ ঘোষণা", category: "shikkha", author: "শিক্ষা ডেস্ক", location: "ঢাকা", time: "৫ ঘণ্টা আগে" },

  { id: 1001, title: "ডেঙ্গুতে নতুন করে আক্রান্ত ৩২৭ জন", category: "sasthyo", author: "স্বাস্থ্য প্রতিবেদক", location: "ঢাকা", time: "৪০ মিনিট আগে" },
  { id: 1002, title: "সরকারি হাসপাতালে বাড়ছে বিশেষজ্ঞ চিকিৎসকের সংখ্যা", category: "sasthyo", author: "স্বাস্থ্য প্রতিবেদক", location: "ঢাকা", time: "৪ ঘণ্টা আগে" },
  { id: 1003, title: "শীতের আগেই শিশুদের নিউমোনিয়া নিয়ে সতর্কতা", category: "sasthyo", author: "স্বাস্থ্য ডেস্ক", location: "ঢাকা", time: "৮ ঘণ্টা আগে" },

  { id: 1101, title: "কলাবাগানে পারিবারিক কলহের জেরে জোড়া খুন", kicker: "কথা কাটাকাটির জের", category: "apradh", author: "নিজস্ব প্রতিবেদক", location: "ঢাকা", time: "১২ মিনিট আগে" },
  { id: 1102, title: "প্রতারণার অভিযোগে চক্রের চার সদস্য গ্রেপ্তার", category: "apradh", author: "নিজস্ব প্রতিবেদক", location: "নারায়ণগঞ্জ", time: "২ ঘণ্টা আগে" },
  { id: 1103, title: "মাদকবিরোধী অভিযানে জব্দ বিপুল পরিমাণ ইয়াবা", category: "apradh", author: "জেলা প্রতিনিধি", location: "কক্সবাজার", time: "৬ ঘণ্টা আগে" },

  { id: 1201, title: "নগর পরিকল্পনায় নদী কেন বারবার উপেক্ষিত", category: "motamot", author: "ড. আনিসুর রহমান", location: "ঢাকা", time: "৩ ঘণ্টা আগে" },
  { id: 1202, title: "তরুণদের কর্মসংস্থান: সুযোগ ও সংকট", category: "motamot", author: "শারমিন আক্তার", location: "ঢাকা", time: "৯ ঘণ্টা আগে" },
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
