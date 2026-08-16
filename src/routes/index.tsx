import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ESTA EXTENSÃO FOI PIRATEADA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PiracyNotice,
});

function PiracyNotice() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="animate-in fade-in zoom-in duration-500 max-w-2xl w-full space-y-8 rounded-2xl border bg-card p-8 shadow-2xl md:p-12">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4 ring-8 ring-destructive/5">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-5xl uppercase italic">
            ESTA EXTENSÃO FOI PIRATEADA
          </h1>
          
          <div className="h-1 w-24 bg-destructive mx-auto rounded-full" />
          
          <p className="text-lg leading-relaxed text-muted-foreground font-medium">
            A chave utilizada nesta extensão foi bloqueada por uso não autorizado. 
            Fale com o contato oficial abaixo para adquirir a versão original.
          </p>
          
          <div className="rounded-lg bg-muted/50 p-6 text-foreground font-semibold border border-dashed border-muted-foreground/30">
            FALAR COM O CONTATO OFICIAL (91) 98583-7992 ou no botão abaixo
          </div>
        </div>

        <div className="pt-4">
          <Button 
            asChild
            size="lg"
            className="w-full h-16 text-xl font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <a 
              href="https://wa.me/5591985837992" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3"
            >
              <MessageCircle className="h-6 w-6 fill-current" />
              CHAMAR NO WHATSAPP
            </a>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest pt-4">
          Acesso Negado • Sistema Bloqueado
        </p>
      </div>
    </div>
  );
}
