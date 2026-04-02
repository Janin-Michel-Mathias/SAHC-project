import { Button } from "@/components/ui/button";
import { AdminModal } from "@/components/admin/admin-modal";
import type { AdminBooking, AdminUser } from "@/types/admin";
import { useEffect, useState } from "react";

export type BookingDraft = {
    date: string;
    userId: string;
    parkingSpotId: string;
};

type AdminBookingModalProps = {
    open: boolean;
    title: string;
    description: string;
    users: AdminUser[];
    initialValues: BookingDraft;
    onClose: () => void;
    onSubmit: (values: BookingDraft) => void | Promise<void>;
    submitLabel: string;
    isSubmitting?: boolean;
};

function toInputDateValue(date: Date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

export function AdminBookingModal({
    open,
    title,
    description,
    users,
    initialValues,
    onClose,
    onSubmit,
    submitLabel,
    isSubmitting = false,
}: AdminBookingModalProps) {
    const [draft, setDraft] = useState<BookingDraft>(initialValues);
    const formId = "admin-booking-form";

    useEffect(() => {
        if (open) {
            setDraft(initialValues);
        }
    }, [open, initialValues]);

    return (
        <AdminModal
            open={open}
            title={title}
            description={description}
            onClose={onClose}
            size="lg"
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" form={formId} disabled={isSubmitting}>
                        {submitLabel}
                    </Button>
                </div>
            }
        >
            <form
                id={formId}
                className="grid gap-4 sm:grid-cols-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    void onSubmit(draft);
                }}
            >
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Date</span>
                    <input
                        type="date"
                        value={draft.date || toInputDateValue(new Date())}
                        onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                        required
                    />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Utilisateur</span>
                    <select
                        value={draft.userId}
                        onChange={(event) => setDraft((current) => ({ ...current, userId: event.target.value }))}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                        required
                    >
                        <option value="">Sélectionner un utilisateur</option>
                        {users
                            .filter((user) => user.deleted_at === null)
                            .map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name} ({user.email ?? "sans email"})
                                </option>
                            ))}
                    </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Place de parking</span>
                    <input
                        type="number"
                        min="1"
                        value={draft.parkingSpotId}
                        onChange={(event) => setDraft((current) => ({ ...current, parkingSpotId: event.target.value }))}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                        placeholder="8"
                        required
                    />
                </label>
            </form>
        </AdminModal>
    );
}