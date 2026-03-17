"use client";

import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, UserCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmVariant = "danger" | "warning" | "info" | "promote";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

const variantConfig: Record<ConfirmVariant, {
  icon: React.ElementType;
  iconClass: string;
  buttonClass: string;
}> = {
  danger: {
    icon: Trash2,
    iconClass: "text-red-500 bg-red-500/10",
    buttonClass: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500 bg-amber-500/10",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500 bg-blue-500/10",
    buttonClass: "",
  },
  promote: {
    icon: UserCheck,
    iconClass: "text-emerald-500 bg-emerald-500/10",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((res) => {
      setResolve(() => res);
    });
  }, []);

  function handleConfirm() {
    resolve?.(true);
    setOpen(false);
  }

  function handleCancel() {
    resolve?.(false);
    setOpen(false);
  }

  const variant = options?.variant ?? "danger";
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", config.iconClass)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg">
                  {options?.title}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {options?.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={handleCancel}>
              {options?.cancelLabel ?? "Cancel"}
            </Button>
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors",
                config.buttonClass || "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {options?.confirmLabel ?? "Confirm"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
