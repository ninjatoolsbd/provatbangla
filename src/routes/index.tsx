import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ESTA EXTENSÃO FOI PIRATEADA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BlockedPage,
});

function BlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-center text-white selection:bg-red-500/30">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-red-600/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-red-500/50 bg-red-500/10 backdrop-blur-sm">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
      </div>

      <h1 className="mb-6 text-4xl font-black tracking-tight uppercase sm:text-6xl md:text-7xl">
        ESTA EXTENSÃO FOI <span className="text-red-600">PIRATEADA</span>
      </h1>

      <div className="mb-10 max-w-2xl space-y-6">
        <p className="text-lg leading-relaxed text-zinc-400 sm:text-xl">
          A chave utilizada nesta extensão foi bloqueada por uso não autorizado. Fale com o contato oficial abaixo para adquirir a versão original. 
          <span className="mt-4 block font-bold text-white">
            FALAR COM O CONTATO OFICIAL (91) 98583-7992 ou no botão abaixo
          </span>
        </p>
      </div>

      <a
        href="https://wa.me/91985837992"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-red-600 px-8 py-4 text-lg font-bold transition-all hover:bg-red-700 hover:ring-4 hover:ring-red-600/20 active:scale-95"
      >
        <span className="relative z-10">CHAMAR NO WHATSAPP</span>
        <ExternalLink className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        <div className="absolute inset-0 translate-y-full bg-gradient-to-t from-black/20 to-transparent transition-transform group-hover:translate-y-0" />
      </a>

      <div className="mt-16 text-xs font-medium tracking-widest text-zinc-600 uppercase">
        Segurança & Licenciamento
      </div>
    </div>
  );
}

