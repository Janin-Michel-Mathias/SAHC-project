import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminBooking } from "@/types/admin";
import { CalendarDays, PencilLine, Plus, Trash2 } from "lucide-react";

type AdminBookingsTabProps = {
    bookings: AdminBooking[];
    onCreate: () => void;
    onEdit: (booking: AdminBooking) => void;
    onDelete: (booking: AdminBooking) => void;
};

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(dateValue));
}

function formatDateTime(dateValue: string | null) {
    if (!dateValue) {
        return "-";
    }

    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateValue));
}

export function AdminBookingsTab({ bookings, onCreate, onEdit, onDelete }: AdminBookingsTabProps) {
    const activeBookings = bookings.filter((booking) => !booking.is_cancelled);
    const cancelledBookings = bookings.filter((booking) => booking.is_cancelled);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Réservations</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Liste et actions d’administration</h2>
                    <p className="mt-1 text-sm text-slate-600">Création, édition et annulation de réservations.</p>
                </div>
                <Button type="button" onClick={onCreate}>
                    <Plus className="size-4" />
                    Nouvelle réservation
                </Button>
            </div>

            <section className="grid gap-4 md:grid-cols-3">
                <Card className="border-black/5 bg-white/90 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardDescription>Réservations actives</CardDescription>
                        <CardTitle className="text-2xl text-black">{activeBookings.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">Réservations non annulées.</CardContent>
                </Card>
                <Card className="border-black/5 bg-white/90 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardDescription>Réservations annulées</CardDescription>
                        <CardTitle className="text-2xl text-black">{cancelledBookings.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">Réservations archivées mais visibles.</CardContent>
                </Card>
                <Card className="border-black/5 bg-white/90 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardDescription>Total</CardDescription>
                        <CardTitle className="text-2xl text-black">{bookings.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">Toutes les réservations chargées.</CardContent>
                </Card>
            </section>

            <Card className="border-black/5 bg-white/95 shadow-sm backdrop-blur">
                <CardHeader>
                    <CardDescription>Table d’administration</CardDescription>
                    <CardTitle>Réservations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.15em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Utilisateur</th>
                                    <th className="px-4 py-3">Place</th>
                                    <th className="px-4 py-3">Statut</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className={booking.is_cancelled ? "bg-slate-50/60 text-slate-500" : ""}>
                                        <td className="px-4 py-3 font-medium text-slate-900">#{booking.id}</td>
                                        <td className="px-4 py-3 text-slate-900">{formatDate(booking.date)}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">
                                                {booking.user.first_name} {booking.user.last_name}
                                            </div>
                                            <div className="text-xs text-slate-500">{booking.user.email ?? "Compte supprimé"}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                <CalendarDays className="size-3.5" />
                                                {booking.parking_spot.row}
                                                {booking.parking_spot.col}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${booking.is_cancelled ? "bg-slate-200 text-slate-700" : booking.has_checked_in ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                                            >
                                                {booking.is_cancelled ? "Annulée" : booking.has_checked_in ? "Présentée" : "Active"}
                                            </span>
                                            <div className="mt-1 text-xs text-slate-500">Créée le {formatDateTime(booking.created_at)}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => onEdit(booking)}>
                                                    <PencilLine className="size-4" />
                                                    Modifier
                                                </Button>
                                                {!booking.is_cancelled && (
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(booking)}>
                                                        <Trash2 className="size-4" />
                                                        Supprimer
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Aucune réservation trouvée.
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