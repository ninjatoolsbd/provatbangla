import { useState } from "react";
import { Play } from "lucide-react";

type Channel = {
  name: string;
  color: string;
  kind: "youtube" | "iframe" | "hls";
  src: string;
  /** youtube video id, used for the still image */
  ytId?: string;
  /** extra style for cropped iframes */
  crop?: boolean;
};

const CHANNELS: Channel[] = [
  {
    name: "বিটিভি লাইভ",
    color: "#990000",
    kind: "iframe",
    src: "https://www.btvlive.gov.bd/channel/BTV-News?autoplay=1&mute=1",
    crop: true,
  },
  { name: "এনটিভি", color: "#006600", kind: "youtube", src: "WAH0A6-f258", ytId: "WAH0A6-f258" },
  { name: "চ্যানেল ২৪", color: "#CC0000", kind: "youtube", src: "hjQluVY6EzQ", ytId: "hjQluVY6EzQ" },
  { name: "আরটিভি লাইভ", color: "#003399", kind: "youtube", src: "PtztZQi5hCg", ytId: "PtztZQi5hCg" },
  { name: "৭১ টিভি", color: "#333333", kind: "youtube", src: "9L9ymmaPIS0", ytId: "9L9ymmaPIS0" },
  {
    name: "সানন্দা টিভি",
    color: "#660066",
    kind: "hls",
    src: "https://live.sanandatelevision.in/sananda/index.m3u8",
  },
];

function ChannelBox({ channel }: { channel: Channel }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="flex h-full flex-col border-[6px] p-1 shadow-lg sm:border-[10px]"
      style={{ borderColor: channel.color, backgroundColor: channel.color }}
    >
      <div className="mb-2 flex items-center justify-between px-2 text-white">
        <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider sm:text-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          {channel.name}
        </h3>
        <div className="h-1 w-10 rounded-full bg-white/20" />
      </div>

      <div className="relative aspect-video w-full flex-grow overflow-hidden rounded-sm bg-black shadow-inner">
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`${channel.name} চালু করুন`}
            className="absolute inset-0 grid h-full w-full place-items-center bg-black"
          >
            {channel.ytId && (
              <img
                src={`https://i.ytimg.com/vi/${channel.ytId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            )}
            <span className="relative grid size-14 place-items-center rounded-full bg-white/90 text-black shadow-lg">
              <Play className="size-6 fill-current" />
            </span>
          </button>
        ) : channel.kind === "hls" ? (
          <video className="absolute inset-0 h-full w-full" controls autoPlay playsInline>
            <source src={channel.src} type="application/x-mpegURL" />
          </video>
        ) : (
          <iframe
            src={
              channel.kind === "youtube"
                ? `https://www.youtube.com/embed/${channel.src}?autoplay=1&mute=1&playsinline=1`
                : channel.src
            }
            title={channel.name}
            className="absolute inset-0 h-full w-full"
            style={channel.crop ? { top: "-85px", height: "calc(100% + 85px)" } : undefined}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
      </div>

      <div className="mt-2 px-2">
        <p className="text-[10px] font-bold italic text-white/90">সরাসরি সম্প্রচার</p>
      </div>
    </div>
  );
}

export function LiveTvPlayers() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {CHANNELS.map((c) => (
        <ChannelBox key={c.name} channel={c} />
      ))}
    </div>
  );
}
