import React, { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Save, ZoomIn, ZoomOut, Image as ImageIcon, X, Palette, Type } from 'lucide-react';
import type * as FabricType from 'fabric';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import frameAsset from "@/assets/photocard-frame.png.asset.json";

interface PhotocardDesignerProps {
  initialTitle: string;
  initialImage: string;
  postId: string;
  onSave?: (url: string) => void;
  onClose?: () => void;
}

const SITE_ORIGIN = "https://cheer-collective-code.lovable.app";
const CARD_W = 1086;
const CARD_H = 1448;
const WIN_X = 26;
const WIN_Y = 23;
const WIN_W = 1034;
const WIN_H = 680;

const banglaDate = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  const digits = "০১২৩৪৫৬৭৮৯";
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];
  const bn = (n: number) => String(n).split("").map((c) => digits[Number(c)]).join("");
  return `${bn(d.getDate())} ${months[d.getMonth()]}, ${bn(d.getFullYear())}`;
};

export function PhotocardDesigner({ initialTitle, initialImage, postId, onSave, onClose }: PhotocardDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricType.Canvas | null>(null);
  const fabricRef = useRef<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [headerText, setHeaderText] = useState(banglaDate());
  const [line1, setLine1] = useState(initialTitle.slice(0, 35));
  const [line2, setLine2] = useState(initialTitle.slice(35, 75));
  const [line3, setLine3] = useState(initialTitle.slice(75, 115));
  const [activeObject, setActiveObject] = useState<FabricType.FabricObject | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    if (!canvasRef.current) return;

    let canvas: FabricType.Canvas;

    const initFabric = async () => {
      const fabric = await import('fabric');
      fabricRef.current = fabric;
      
      canvas = new fabric.Canvas(canvasRef.current!, {
        width: CARD_W,
        height: CARD_H,
        backgroundColor: '#8f0101',
      });
      fabricCanvasRef.current = canvas;

      // Add Gradient Shade (behind text, on top of image)
      const addShade = () => {
        const shade = new fabric.Rect({
          left: WIN_X,
          top: WIN_Y + WIN_H - 320,
          width: WIN_W,
          height: 320,
          selectable: false,
          evented: false,
          fill: new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 0, y2: 320 },
            colorStops: [
              { offset: 0, color: 'rgba(0,0,0,0)' },
              { offset: 1, color: 'rgba(0,0,0,0.88)' }
            ]
          })
        });
        (shade as any).name = 'shade';
        canvas.add(shade);
      };

      // Load News Image
      const loadImage = async () => {
        try {
          const img = await fabric.FabricImage.fromURL(initialImage, { crossOrigin: 'anonymous' });
          img.set({
            left: WIN_X,
            top: WIN_Y,
            selectable: true,
            evented: true,
          });
          
          // Auto scale to fill window
          const scale = Math.max(WIN_W / img.width!, WIN_H / img.height!);
          img.scale(scale);
          
          // Clip image to the window
          const clipPath = new fabric.Rect({
            left: WIN_X,
            top: WIN_Y,
            width: WIN_W,
            height: WIN_H,
            absolutePositioned: true,
          });
          img.clipPath = clipPath;
          
          canvas.add(img);
          canvas.sendObjectToBack(img);
        } catch (e) {
          console.error("Failed to load news image", e);
        }
      };

      // Load Frame Image
      const loadFrame = async () => {
        try {
          const frameUrl = `${SITE_ORIGIN}${frameAsset.url}`;
          const frame = await fabric.FabricImage.fromURL(frameUrl, { crossOrigin: 'anonymous' });
          frame.set({
            left: 0,
            top: 0,
            scaleX: CARD_W / frame.width!,
            scaleY: CARD_H / frame.height!,
            selectable: false,
            evented: false,
          });
          canvas.add(frame);
          (frame as any).name = 'frame';
          canvas.bringObjectToFront(frame);
        } catch (e) {
          console.error("Failed to load template frame", e);
        }
      };

      // Add Date Badge Text
      const addDateText = () => {
        const dateTxt = new fabric.IText(headerText, {
          fontFamily: 'SolaimanLipi',
          fontSize: 34,
          fontWeight: 'bold',
          fill: '#ffffff',
          left: 875,
          top: 103,
          originX: 'center',
          originY: 'center',
          selectable: true,
        });
        (dateTxt as any).name = 'headerText';
        canvas.add(dateTxt);
        canvas.bringObjectToFront(dateTxt);
      };

      // Add Headline Text Layers
      const addText = () => {
        const textStyle = {
          fontFamily: 'SolaimanLipi',
          fontSize: 52,
          fontWeight: 'bold' as const,
          fill: '#ffffff',
          left: WIN_X + 40,
          textAlign: 'center' as const,
          width: WIN_W - 80,
          selectable: true,
        };

        const t1 = new fabric.Textbox(line1, { ...textStyle, top: WIN_Y + WIN_H - 220 });
        (t1 as any).name = 'line1';

        const t2 = new fabric.Textbox(line2, { ...textStyle, top: WIN_Y + WIN_H - 160 });
        (t2 as any).name = 'line2';

        const t3 = new fabric.Textbox(line3, { ...textStyle, top: WIN_Y + WIN_H - 100 });
        (t3 as any).name = 'line3';

        canvas.add(t1, t2, t3);
      };

      await loadImage();
      addShade();
      await loadFrame();
      addDateText();
      addText();
      canvas.renderAll();

      canvas.on('selection:created', (e) => setActiveObject(e.selected[0] || null));
      canvas.on('selection:updated', (e) => setActiveObject(e.selected[0] || null));
      canvas.on('selection:cleared', () => setActiveObject(null));
    };

    initFabric();

    return () => {
      if (canvas) canvas.dispose();
    };
  }, []);

  // Update text when state changes (if not edited via canvas directly)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const t1 = canvas.getObjects().find(o => (o as any).name === 'line1') as any;
    const t2 = canvas.getObjects().find(o => (o as any).name === 'line2') as any;
    const t3 = canvas.getObjects().find(o => (o as any).name === 'line3') as any;
    const th = canvas.getObjects().find(o => (o as any).name === 'headerText') as any;

    if (t1 && t1.text !== line1) t1.set('text', line1);
    if (t2 && t2.text !== line2) t2.set('text', line2);
    if (t3 && t3.text !== line3) t3.set('text', line3);
    if (th && th.text !== headerText) th.set('text', headerText);
    
    canvas.renderAll();
  }, [line1, line2, line3, headerText]);

  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      setIsSaving(true);
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });
      
      const base64Data = dataUrl.split(',')[1];
      
      const { uploadPhotocard } = await import("@/lib/photocard.functions");
      const res = await uploadPhotocard({
        data: {
          postId,
          dataBase64: base64Data,
        }
      });
      
      toast.success("ফটোকোর্ড সফলভাবে সেভ হয়েছে");
      onSave?.(res.photocardUrl);
    } catch (error: any) {
      toast.error("সেভ করতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!fabricCanvasRef.current) return;
    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1.5,
    });
    const link = document.createElement('a');
    link.download = `photocard-${postId}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background lg:flex-row">
      {/* Sidebar Controls - Newscard Style */}
      <div className="w-full border-r bg-card p-6 lg:w-96 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-primary" />
            <h2 className="text-xl font-bold font-display">ফটোকোর্ড এডিটর</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="size-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-lg bg-secondary/30 p-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">হেডার টেক্সট (তারিখ)</Label>
              <Input 
                value={headerText} 
                onChange={(e) => setHeaderText(e.target.value)} 
                className="h-9 bg-background border-primary/20 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">শিরোনাম লাইন ১</Label>
              <Input 
                value={line1} 
                onChange={(e) => setLine1(e.target.value)} 
                className="h-9 bg-background border-primary/20 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">শিরোনাম লাইন ২</Label>
              <Input 
                value={line2} 
                onChange={(e) => setLine2(e.target.value)} 
                className="h-9 bg-background border-primary/20 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">শিরোনাম লাইন ৩</Label>
              <Input 
                value={line3} 
                onChange={(e) => setLine3(e.target.value)} 
                className="h-9 bg-background border-primary/20 focus-visible:ring-primary"
              />
            </div>
          </div>

          {activeObject && (
            <div className="space-y-4 rounded-lg border border-primary/20 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2">
                <Type className="size-4 text-primary" />
                <Label className="text-xs font-bold uppercase tracking-wider text-primary">এলিমেন্ট কন্ট্রোল</Label>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-medium">
                  <span>ফন্ট সাইজ</span>
                  <span className="text-primary">{Math.round((activeObject as any).fontSize || 0)}px</span>
                </div>
                <Slider 
                  value={[(activeObject as any).fontSize || 52]} 
                  max={150} 
                  min={10} 
                  step={1} 
                  onValueChange={(val) => {
                    if (activeObject && 'set' in activeObject) {
                      (activeObject as any).set('fontSize', val[0]);
                      fabricCanvasRef.current?.renderAll();
                    }
                  }}
                  className="py-2"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-medium">জুম ইন/আউট</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                     const canvas = fabricCanvasRef.current;
                     if (canvas) canvas.setZoom(canvas.getZoom() * 1.1);
                  }}>
                    <ZoomIn className="size-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                     const canvas = fabricCanvasRef.current;
                     if (canvas) canvas.setZoom(canvas.getZoom() / 1.1);
                  }}>
                    <ZoomOut className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5" onClick={handleDownload}>
              <Download className="mr-2 size-4" />
              ডাউনলোড
            </Button>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              সেভ করুন
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f0f2f5] p-4 lg:p-8">
        <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white rounded-sm overflow-hidden" style={{ width: 'fit-content' }}>
          <canvas ref={canvasRef} className="max-h-[85vh] max-w-full object-contain" />
        </div>
        <div className="mt-6 flex items-center gap-4 text-[11px] text-muted-foreground bg-white/50 px-4 py-2 rounded-full border border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            টিপস: আপনি সরাসরি ক্যানভাসে এলিমেন্টগুলো ড্র্যাগ বা ডাবল ক্লিক করে এডিট করতে পারবেন।
          </div>
        </div>
      </div>
    </div>
  );
}
