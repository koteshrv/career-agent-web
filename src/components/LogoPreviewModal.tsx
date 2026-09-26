import { BrandLogo, LOGO_OPTIONS, type LogoConcept } from './BrandLogo';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';

interface LogoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConcept: LogoConcept;
  onSelectConcept: (concept: LogoConcept) => void;
}

export function LogoPreviewModal({
  isOpen,
  onClose,
  activeConcept,
  onSelectConcept,
}: LogoPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Select CareerAgent Logo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any of the 4 design concepts to test it live on the header.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Concepts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {LOGO_OPTIONS.map((opt) => {
            const isSelected = activeConcept === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onSelectConcept(opt.id)}
                className={`relative flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                    : 'border-border/80 hover:border-border hover:bg-muted/40'
                }`}
              >
                <div className="shrink-0 p-2.5 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center">
                  <BrandLogo concept={opt.id} className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {opt.name}
                    </span>
                    {isSelected && (
                      <span className="shrink-0 text-emerald-500 flex items-center gap-0.5 text-[10px] font-bold uppercase">
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

        {/* Live Header Preview Demo */}
        <div className="p-4 bg-muted/30 border border-border/80 rounded-xl space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
            Live Header Preview
          </span>
          <div className="flex items-center space-x-2.5 bg-background border border-border rounded-lg px-4 py-2.5 shadow-2xs">
            <BrandLogo concept={activeConcept} className="h-6 w-6" />
            <span className="font-bold text-base tracking-tight text-foreground">
              CareerAgent
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-md font-mono">
              Concept: {activeConcept}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="cursor-pointer text-xs font-semibold px-5">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
