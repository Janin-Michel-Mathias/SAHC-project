import { Button } from "@/components/ui/button";
import { AdminModal } from "@/components/admin/admin-modal";

type AdminConfirmModalProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting?: boolean;
};

export function AdminConfirmModal({
    open,
    title,
    description,
    confirmLabel,
    onClose,
    onConfirm,
    isSubmitting = false,
}: AdminConfirmModalProps) {
    return (
        <AdminModal
            open={open}
            title={title}
            description={description}
            onClose={onClose}
            size="sm"
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
                        {confirmLabel}
                    </Button>
                </div>
            }
        >
            <p className="text-sm leading-6 text-slate-700">Cette action est irréversible.</p>
        </AdminModal>
    );
}