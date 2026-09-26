import { BrandLogo, LOGO_OPTIONS, type LogoConcept } from './BrandLogo';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export type ColorPalette = 'indigo' | 'emerald' | 'cyan' | 'violet' | 'monochrome' | 'cyber' | 'classic-orange';

export const PALETTE_OPTIONS: {
  id: ColorPalette;
  name: string;
  badge: string;
  description: string;
  dotColor: string;
}[] = [
  {
    id: 'indigo',
    name: 'Electric Indigo',
    badge: 'Linear / Stripe',
    description: 'Crisp obsidian dark mode with glowing electric indigo accents',
    dotColor: '#6366f1',
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    badge: 'Cursor / Copilot',
    description: 'High-tech luminous cyan on deep obsidian zinc',
    dotColor: '#06b6d4',
  },
  {
    id: 'violet',
    name: 'Nordic Violet',
    badge: 'Raycast / AI',
    description: 'Deep futuristic violet on obsidian graphite',
    dotColor: '#8b5cf6',
  },
  {
    id: 'emerald',
    name: 'Emerald Jade',
    badge: 'Hired / Growth',
    description: 'High-contrast emerald mint on deep graphite — feels active & verified',
    dotColor: '#10b981',
  },
  {
    id: 'monochrome',
    name: 'Obsidian Monochrome',
    badge: 'Vercel / Resend',
    description: 'Pitch black #000000 with pure white typography and razor-thin borders',
    dotColor: '#ffffff',
  },
  {
    id: 'cyber',
    name: 'Cyber Tangerine',
    badge: 'Coral / Modern Warm',
    description: 'Vibrant modern neon coral-orange on clean zinc (NOT muddy brown)',
    dotColor: '#ff6433',
  },
  {
    id: 'classic-orange',
    name: 'Classic Orange',
    badge: 'Original',
    description: 'The original warm sepia baseline for comparison',
    dotColor: '#ea580c',
  },
];

interface ThemeAndLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConcept: LogoConcept;
  onSelectConcept: (concept: LogoConcept) => void;
  activePalette: ColorPalette;
  onSelectPalette: (palette: ColorPalette) => void;
}

export function ThemeAndLogoModal({
  isOpen,
  onClose,
  activeConcept,
  onSelectConcept,
  activePalette,
  onSelectPalette,
}: ThemeAndLogoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Design & Brand Studio
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch color palettes and logos in real-time to pick your favorite look.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SECTION 1: COLOR PALETTES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
              <span>1. Choose Color Theme</span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              Active: {activePalette}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PALETTE_OPTIONS.map((pal) => {
              const isSelected = activePalette === pal.id;
              return (
                <div
                  key={pal.id}
                  onClick={() => onSelectPalette(pal.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                      : 'border-border/70 hover:border-border hover:bg-muted/30'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mt-0.5 shrink-0 shadow-xs border border-white/20"
                    style={{ backgroundColor: pal.dotColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {pal.name}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded-xs border border-border/50 shrink-0">
                        {pal.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {pal.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: LOGO CONCEPTS */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>2. Choose Brand Logo & Tab Icon</span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              Active: {activeConcept}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LOGO_OPTIONS.map((opt) => {
              const isSelected = activeConcept === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectConcept(opt.id)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                      : 'border-border/70 hover:border-border hover:bg-muted/30'
                  }`}
                >
                  <div className="shrink-0 p-2 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center">
                    <BrandLogo concept={opt.id} className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {opt.name}
                      </span>
                      {isSelected && (
                        <span className="shrink-0 text-emerald-500 flex items-center gap-0.5 text-[10px] font-bold">
                          <Check className="h-3 w-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LIVE HEADER PREVIEW BAR */}
        <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
            Live Header Preview
          </span>
          <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-2.5 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <BrandLogo concept={activeConcept} className="h-6 w-6" />
              <div className="flex items-center">
                <span className="font-medium text-base tracking-tight text-foreground/80">Career</span>
                <span className="font-bold text-base tracking-tight text-foreground">Agent</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse ml-1.5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
                {activePalette}
              </span>
              <Button size="sm" className="h-7 text-xs px-3 font-semibold">
                Apply Directly
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="cursor-pointer text-xs font-semibold px-6">
            Keep This Style
          </Button>
        </div>
      </div>
    </div>
  );
}
