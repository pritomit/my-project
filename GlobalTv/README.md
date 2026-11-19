# 📺 PritomX Global TV HuB

**PritomX Global TV HuB** — Modern, High-Performance IPTV Web Player with Cloudflare Stream Proxy & Automated Stream Health Checking.

---

## 🚀 ১. Vercel ডিপ্লয়মেন্ট (Quick Vercel Deploy)

### পদ্ধতি ১: Root Directory সেট করে (প্রস্তাবিত)
1. **[Vercel Dashboard](https://vercel.com/)**-এ যান এবং **Add New Project** সিলেক্ট করুন।
2. আপনার GitHub রিপোজিটরি `pritomit/my-project` ইমপোর্ট করুন।
3. **Project Settings**-এ **Root Directory** অপশনে `GlobalTv` নির্বাচন করুন।
4. **Deploy** বাটনে ক্লিক করুন। কয়েক সেকেন্ডেই আপনার লাইভ টিভি প্লেয়ার সক্রিয় হয়ে যাবে!

### পদ্ধতি ২: সরাসরি ডিপ্লয় (Direct Root)
- রিপোজিটরির রুটে রাখা `vercel.json` স্বয়ংক্রিয়ভাবে `/` থেকে `/GlobalTv/` রুটে ট্রাফিক রিডাইরেক্ট করে সাইট লাইভ রাখবে।

---

## ⚡ ২. Cloudflare Worker স্ট্রিম প্রক্সি সেটআপ
কিছু আইপিটিভি স্ট্রিমের CORS ব্লকিং বা টোকেন সিকিউরিটি বাইপাস করার জন্য ক্লাউডফ্লেয়ার ওয়ার্কার ব্যবহার করা হয়েছে:

1. **[Cloudflare Dashboard](https://dash.cloudflare.com/)** > **Workers & Pages**-এ যান।
2. আপনার `pritom-worker-tv` ওয়ার্কারে যান অথবা নতুন একটি ওয়ার্কার তৈরি করুন।
3. `cloudflare-worker/worker.js` ফাইলের কোড পেস্ট করে **Save and Deploy** দিন।
4. ওয়ার্কার টেস্ট লিংক:
   ```text
   https://pritom-worker-tv.pritomsiddique226.workers.dev/?url=https%3A%2F%2Ftest-streams.mux.dev%2Fx36xhzz%2Fx36xhzz.m3u8
   ```

---

## 🔄 ৩. GitHub Actions অটো-ক্লিন সিস্টেম
`.github/workflows/check-streams.yml` ওয়ার্কফ্লোটি সংযুক্ত রয়েছে। এটি:
- প্রতি ৬ ঘণ্টা পরপর স্বয়ংক্রিয়ভাবে সব চ্যানেলের স্বাস্থ্য (HTTP 200, m3u8 Manifest, Content-Type) পরীক্ষা করে।
- ডেড লিংকগুলো বাদ দিয়ে কার্যকর চ্যানেলগুলো দিয়ে `fallback.m3u` ফাইল আপডেট করে কমিট ও পুশ করে।
- আপনি চাইলে GitHub Actions ট্যাবে গিয়ে **Run workflow** দিয়ে যেকোনো সময় ম্যানুয়ালি যাচাই করতে পারেন।

---

## 📁 ফাইল স্ট্রাকচার

```text
GlobalTv/
├── index.html                  # মূল ওয়েব প্লেয়ার ফ্রন্টএন্ড UI
├── vercel.json                 # Vercel ক্যাশিং ও CORS কনফিগ
├── playlists.json              # সোর্স লিস্ট কনফিগারেশন
├── fallback.m3u                # ভেরিফাইড ব্যাকআপ প্লেলিস্ট
├── alltv.m3u8                  # NIS Free প্লেলিস্ট
├── github.m3u                  # Sky Pack প্লেলিস্ট
├── package.json                # প্রজেক্ট মেটাডাটা
├── cloudflare-worker/
│   └── worker.js               # ক্লাউডফ্লেয়ার রিভার্স প্রক্সি স্ক্রিপ্ট
└── scripts/
    └── check-streams.mjs       # স্ট্রিম ভ্যালিডেটর স্ক্রিপ্ট
```
