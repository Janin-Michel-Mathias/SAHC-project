import { Button } from "@/components/ui/button";
import { AdminModal } from "@/components/admin/admin-modal";
import type { Role } from "@/types/user/roles";
import { useEffect, useState } from "react";

export type UserDraft = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: Role;
};

type AdminUserModalProps = {
    open: boolean;
    title: string;
    description: string;
    initialValues: UserDraft;
    onClose: () => void;
    onSubmit: (values: UserDraft) => void | Promise<void>;
    submitLabel: string;
    isSubmitting?: boolean;
    showPassword?: boolean;
};

export function AdminUserModal({
    open,
    title,
    description,
    initialValues,
    onClose,
    onSubmit,
    submitLabel,
    isSubmitting = false,
    showPassword = true,
}: AdminUserModalProps) {
    const [draft, setDraft] = useState<UserDraft>(initialValues);
    const formId = "admin-user-form";

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
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    void onSubmit(draft);
                }}
            >
                <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                    <span>Email</span>
                    <input
                        type="email"
                        value={draft.email}
                        onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                        placeholder="prenom.nom@entreprise.fr"
                        required
                    />
                </label>
                {showPassword && (
                    <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                        <span>Mot de passe</span>
                        <input
                            type="password"
                            value={draft.password}
                            onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                            placeholder="••••••••"
                            required
                        />
                    </label>
                )}
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Prénom</span>
                    <input
                        type="text"
                        value={draft.first_name}
                        onChange={(event) => setDraft((current) => ({ ...current, first_name: event.target.value }))}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                        required
                    />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Nom</span>
                    <input
                        type="text"
                        value={draft.last_name}
                        onChange={(event) => setDraft((current) => ({ ...current, last_name: event.target.value }))}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                        required
                    />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                    <span>Rôle</span>
                    <select
                        value={draft.role}
                        onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as Role }))}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                    >
                        <option value="employee">Employé</option>
                        <option value="manager">Manager</option>
                        <option value="secretary">Secrétaire</option>
                    </select>
                </label>
            </form>
        </AdminModal>
    );
}