# Cloudflare Pages Deployment Guide (প্রভাতবাংলা)

আপনার প্রজেক্টটি Cloudflare Pages-এ সফলভাবে ডেপ্লয় করার জন্য নিচের ধাপগুলো অনুসরণ করুন।

## ১. GitHub-এ প্রজেক্ট পুশ করুন
প্রথমে আপনার লোকাল প্রজেক্টটি একটি GitHub রিপোজিটরিতে আপলোড করুন।

## ২. Cloudflare Pages-এ কানেক্ট করুন
- [Cloudflare Dashboard](https://dash.cloudflare.com/)-এ লগইন করুন।
- **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**-এ যান।
- আপনার রিপোজিটরি সিলেক্ট করুন।

## ৩. বিল্ড সেটিংস (Build Settings)
বিল্ড সেটিংস নিচের মতো সেট করুন:
- **Framework preset**: `None` (অথবা TanStack Start সাপোর্ট থাকলে সেটি)
- **Build command**: `npm run build`
- **Build output directory**: `dist/client`

## ৪. এনভায়রনমেন্ট ভেরিয়েবল (Environment Variables) - অত্যন্ত গুরুত্বপূর্ণ
ডেপ্লয় করার আগে **Settings > Environment Variables**-এ গিয়ে নিচের সিক্রেটগুলো যোগ করুন। এই ভেরিয়েবলগুলো ছাড়া সাইট ব্ল্যাঙ্ক আসবে।

### Supabase (Own Instance)
- `MY_SUPABASE_URL`: আপনার Supabase URL
- `MY_SUPABASE_PUBLISHABLE_KEY`: আপনার Supabase Anon Key
- `MY_SUPABASE_SERVICE_ROLE_KEY`: আপনার Supabase Service Role Key (সার্ভার ফাংশনের জন্য)

### Cloudflare R2 (Media Storage)
- `R2_ACCOUNT_ID`: আপনার Cloudflare Account ID
- `R2_ACCESS_KEY_ID`: R2 API Token Access Key
- `R2_SECRET_ACCESS_KEY`: R2 API Token Secret Key
- `R2_BUCKET`: আপনার R2 Bucket নাম
- `R2_PUBLIC_BASE_URL`: (ঐচ্ছিক) R2 Public URL

### AI Providers (Gemini)
- `GEMINI_API_KEY`: আপনার Google Gemini API Key
- (ঐচ্ছিক) `GEMINI_API_KEY_1` থেকে `GEMINI_API_KEY_5` পর্যন্ত একাধিক কি (Key) যোগ করতে পারেন।

## ৫. ডিরেক্টরি স্ট্রাকচার চেক
প্রজেক্টটি বিল্ড হওয়ার পর `dist/server` ফোল্ডারে একটি `wrangler.json` (অথবা `.toml`) ফাইল তৈরি হবে। যদি আপনি সরাসরি **Workers** হিসেবে ডেপ্লয় করতে চান, তবে `dist/server` ডিরেক্টরি থেকে `npx wrangler deploy` চালাতে পারেন।

## কেন সাইট ব্ল্যাঙ্ক আসে?
১. **Missing Environment Variables**: যদি `MY_SUPABASE_URL` না থাকে, তবে ক্লায়েন্ট সাইড থেকে ডেটা ফেচ করতে পারবে না।
২. **Build Output Path**: নিশ্চিত করুন যে আপনি `dist/client` ফোল্ডারটিকে Static Assets হিসেবে এবং `dist/server` ফোল্ডারটিকে Functions/Worker হিসেবে ব্যবহার করছেন।

আপনার কোনো প্রশ্ন থাকলে বা কোনো এরর মেসেজ পেলে তা জানান।
