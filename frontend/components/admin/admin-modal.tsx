import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type AdminModalProps = {
    open: boolean;
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<AdminModalProps["size"]>, string> = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
};

export function AdminModal({
    open,
    title,
    description,
    children,
    onClose,
    footer,
    size = "md",
}: AdminModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
        >
            <div
                className={cn(
                    "w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-950/30",
                    sizeClasses[size]
                )}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
                        {description && <p className="text-sm text-slate-600">{description}</p>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fermer la modale">
                        <X className="size-4" />
                    </Button>
                </div>
                <div className="px-6 py-5">{children}</div>
                {footer && <div className="border-t border-slate-200 px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
}