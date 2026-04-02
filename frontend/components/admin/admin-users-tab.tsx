import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUser } from "@/types/admin";
import { PencilLine, Plus, Trash2, Users } from "lucide-react";

type AdminUsersTabProps = {
    users: AdminUser[];
    onCreate: () => void;
    onEdit: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
};

const roleLabel: Record<string, string> = {
    employee: "Employé",
    manager: "Manager",
    secretary: "Secrétaire",
};

function formatDateTime(dateValue: string | null) {
    if (!dateValue) {
        return "-";
    }

    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateValue));
}

export function AdminUsersTab({ users, onCreate, onEdit, onDelete }: AdminUsersTabProps) {
    const activeUsers = users.filter((user) => user.deleted_at === null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Utilisateurs</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Liste et actions d’administration</h2>
                    <p className="mt-1 text-sm text-slate-600">Création, édition et suppression de comptes.</p>
                </div>
                <Button type="button" onClick={onCreate}>
                    <Plus className="size-4" />
                    Nouvel utilisateur
                </Button>
            </div>

            <section className="grid gap-4 md:grid-cols-3">
                <Card className="border-black/5 bg-white/90 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardDescription>Utilisateurs actifs</CardDescription>
                        <CardTitle className="text-2xl text-black">{activeUsers.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">Comptes encore disponibles.</CardContent>
                </Card>
                <Card className="border-black/5 bg-white/90 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardDescription>Comptes supprimés</CardDescription>
                        <CardTitle className="text-2xl text-black">{users.length - activeUsers.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">Comptes masqués après suppression logique.</CardContent>
                </Card>
                <Card className="border-black/5 bg-white/90 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardDescription>Total</CardDescription>
                        <CardTitle className="text-2xl text-black">{users.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">Tous les utilisateurs chargés.</CardContent>
                </Card>
            </section>

            <Card className="border-black/5 bg-white/95 shadow-sm backdrop-blur">
                <CardHeader>
                    <CardDescription>Table d’administration</CardDescription>
                    <CardTitle>Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.15em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Nom</th>
                                    <th className="px-4 py-3">Rôle</th>
                                    <th className="px-4 py-3">Statut</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.map((user) => (
                                    <tr key={user.id} className={user.deleted_at ? "bg-slate-50/60 text-slate-500" : ""}>
                                        <td className="px-4 py-3 font-medium text-slate-900">#{user.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-xs text-slate-500">{user.email ?? "Compte supprimé"}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{roleLabel[user.role] ?? user.role}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.deleted_at ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-700"}`}
                                            >
                                                {user.deleted_at ? "Supprimé" : "Actif"}
                                            </span>
                                            <div className="mt-1 text-xs text-slate-500">Créé le {formatDateTime(user.created_at)}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => onEdit(user)}
                                                    aria-label={`Éditer l'utilisateur ${user.first_name} ${user.last_name}`}
                                                >
                                                    <PencilLine className="size-4" />
                                                    Éditer
                                                </Button>
                                                {!user.deleted_at && (
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(user)}>
                                                        <Trash2 className="size-4" />
                                                        Supprimer
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}