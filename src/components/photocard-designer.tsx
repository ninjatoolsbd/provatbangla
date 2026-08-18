import React, { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Save, ZoomIn, ZoomOut, Image as ImageIcon, Palette } from 'lucide-react';
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

export function PhotocardDesigner({ initialTitle, initialImage, postId, onSave, onClose }: PhotocardDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricType.Canvas | null>(null);
  const fabricRef = useRef<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [line1, setLine1] = useState(initialTitle.slice(0, 40));
  const [line2, setLine2] = useState(initialTitle.slice(40, 80));
  const [line3, setLine3] = useState(initialTitle.slice(80, 120));
  const [activeObject, setActiveObject] = useState<FabricType.FabricObject | null>(null);

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

      // Load Background Image
      const loadImage = async () => {
        try {
          const img = await fabric.FabricImage.fromURL(initialImage, { crossOrigin: 'anonymous' });
          img.set({
            left: WIN_X,
            top: WIN_Y,
            scaleX: WIN_W / img.width!,
            scaleY: WIN_H / img.height!,
            selectable: true,
            evented: true,
          });
          
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
          canvas.bringObjectToFront(frame);
        } catch (e) {
          console.error("Failed to load template frame", e);
        }
      };

      // Add Text Layers
      const addText = () => {
        const textStyle = {
          fontFamily: 'SolaimanLipi',
          fontSize: 52,
          fontWeight: 'bold' as const,
          fill: '#ffffff',
          left: WIN_X + 40,
          textAlign: 'center' as const,
          width: WIN_W - 80,
        };

        const t1 = new fabric.Textbox(line1, {
          ...textStyle,
          top: WIN_Y + WIN_H - 220,
        });
        (t1 as any).name = 'line1';

        const t2 = new fabric.Textbox(line2, {
          ...textStyle,
          top: WIN_Y + WIN_H - 160,
        });
        (t2 as any).name = 'line2';

        const t3 = new fabric.Textbox(line3, {
          ...textStyle,
          top: WIN_Y + WIN_H - 100,
        });
        (t3 as any).name = 'line3';

        canvas.add(t1, t2, t3);
      };

      await loadImage();
      await loadFrame();
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

  // Update text when state changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const t1 = canvas.getObjects().find(o => (o as any).name === 'line1') as any;
    const t2 = canvas.getObjects().find(o => (o as any).name === 'line2') as any;
    const t3 = canvas.getObjects().find(o => (o as any).name === 'line3') as any;

    if (t1) t1.set('text', line1);
    if (t2) t2.set('text', line2);
    if (t3) t3.set('text', line3);
    
    canvas.renderAll();
  }, [line1, line2, line3]);

  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      setIsSaving(true);
      // Ensure we export at full size
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
          config: { line1, line2, line3 }
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
      multiplier: 2, // High res download
    });
    const link = document.createElement('a');
    link.download = `photocard-${postId}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background lg:flex-row">
      {/* Sidebar Controls */}
      <div className="w-full border-r bg-card p-6 lg:w-80 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold font-display">ফটোকোর্ড এডিটর</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">লাইন ১ (উপ-শিরোনাম)</Label>
            <Input 
              value={line1} 
              onChange={(e) => setLine1(e.target.value)} 
              placeholder="হেডলাইন লাইন ১"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">লাইন ২ (প্রধান হাইলাইট)</Label>
            <Input 
              value={line2} 
              onChange={(e) => setLine2(e.target.value)} 
              placeholder="হেডলাইন লাইন ২"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">লাইন ৩ (শেষাংশ)</Label>
            <Input 
              value={line3} 
              onChange={(e) => setLine3(e.target.value)} 
              placeholder="হেডলাইন লাইন ৩"
            />
          </div>

          {activeObject && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-xs font-bold uppercase text-muted-foreground">সিলেক্টেড এলিমেন্ট সেটিংস</Label>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>ফন্ট সাইজ</span>
                  <span>{Math.round((activeObject as any).fontSize || 0)}</span>
                </div>
                <Slider 
                  defaultValue={[52]} 
                  max={120} 
                  min={20} 
                  step={1} 
                  onValueChange={(val) => {
                    if (activeObject && 'set' in activeObject) {
                      (activeObject as any).set('fontSize', val[0]);
                      fabricCanvasRef.current?.renderAll();
                    }
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" title="Zoom In" onClick={() => {
                   const canvas = fabricCanvasRef.current;
                   if (canvas) canvas.setZoom(canvas.getZoom() * 1.1);
                }}>
                  <ZoomIn className="size-4" />
                </Button>
                <Button variant="outline" size="icon" title="Zoom Out" onClick={() => {
                   const canvas = fabricCanvasRef.current;
                   if (canvas) canvas.setZoom(canvas.getZoom() / 1.1);
                }}>
                  <ZoomOut className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-6">
            <Button variant="outline" className="w-full" onClick={handleDownload}>
              <Download className="mr-2 size-4" />
              ডাউনলোড
            </Button>
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              সেভ করুন
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex flex-1 flex-col items-center justify-center bg-secondary/20 p-4 lg:p-10">
        <div className="relative shadow-2xl overflow-hidden bg-white" style={{ width: 'fit-content' }}>
          <canvas ref={canvasRef} className="max-h-[80vh] max-w-full object-contain" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          টিপস: আপনি মাউস দিয়ে ছবি বা টেক্সট পজিশন পরিবর্তন করতে পারবেন।
        </p>
      </div>
    </div>
  );
}

function X({ className, onClick }: { className?: string, onClick?: () => void }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      onClick={onClick}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
