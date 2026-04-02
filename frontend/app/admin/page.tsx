"use client";

import {
    cancelAdminBooking,
    createAdminBooking,
    createAdminUser,
    deleteAdminUser,
    getAdminBookings,
    getAdminUsers,
    updateAdminBooking,
    updateAdminUser,
} from "@/services";
import type { AdminBooking, AdminUser } from "@/types/admin";
import { useEffect, useMemo, useState } from "react";
import { AdminBookingsTab } from "@/components/admin/admin-bookings-tab";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminTabs, type AdminTab } from "@/components/admin/admin-tabs";
import { AdminBookingModal, type BookingDraft } from "@/components/admin/admin-booking-modal";
import { AdminUsersTab } from "@/components/admin/admin-users-tab";
import { AdminUserModal, type UserDraft } from "@/components/admin/admin-user-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, RefreshCw, Shield } from "lucide-react";

const emptyBookingDraft: BookingDraft = {
    date: new Date().toISOString().slice(0, 10),
    userId: "",
    parkingSpotId: "",
};

const emptyUserDraft: UserDraft = {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "employee",
};

function toInputDate(dateValue: string) {
    return dateValue.slice(0, 10);
}

function mapBookingToDraft(booking: AdminBooking): BookingDraft {
    return {
        date: toInputDate(booking.date),
        userId: String(booking.user.id),
        parkingSpotId: String(booking.parking_spot.id),
    };
}

function mapUserToDraft(user: AdminUser): UserDraft {
    return {
        email: user.email ?? "",
        password: "",
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role === "" ? "employee" : user.role,
    };
}

function buildUserUpdatePayload(originalUser: AdminUser, values: UserDraft) {
    const payload: Partial<Pick<UserDraft, "email" | "first_name" | "last_name" | "role">> = {};

    if ((originalUser.email ?? "") !== values.email) {
        payload.email = values.email;
    }

    if (originalUser.first_name !== values.first_name) {
        payload.first_name = values.first_name;
    }

    if (originalUser.last_name !== values.last_name) {
        payload.last_name = values.last_name;
    }

    if ((originalUser.role || "employee") !== values.role) {
        payload.role = values.role;
    }

    return Object.keys(payload).length > 0 ? payload : null;
}

export default function Page() {
    const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingModalMode, setBookingModalMode] = useState<"create" | "edit">("create");
    const [bookingDraft, setBookingDraft] = useState<BookingDraft>(emptyBookingDraft);
    const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(null);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [userModalMode, setUserModalMode] = useState<"create" | "edit">("create");
    const [userDraft, setUserDraft] = useState<UserDraft>(emptyUserDraft);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [bookingToDelete, setBookingToDelete] = useState<AdminBooking | null>(null);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);
    const [isDeletingBooking, setIsDeletingBooking] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    const activeBookings = useMemo(() => bookings.filter((booking) => !booking.is_cancelled), [bookings]);
    const activeUsers = useMemo(() => users.filter((user) => user.deleted_at === null), [users]);

    const loadData = async () => {
        const [nextBookings, nextUsers] = await Promise.all([getAdminBookings(), getAdminUsers()]);
        setBookings(nextBookings);
        setUsers(nextUsers);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (!token) {
            window.location.href = "/?redirect=/admin";
            return;
        }

        if (role !== "secretary") {
            window.location.href = "/booking";
            return;
        }

        const bootstrap = async () => {
            setIsAuthorized(true);

            try {
                await loadData();
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Impossible de charger l'administration.");
            } finally {
                setIsLoading(false);
            }
        };

        bootstrap();
    }, []);

    const openCreateBooking = () => {
        setEditingBooking(null);
        setBookingDraft(emptyBookingDraft);
        setBookingModalMode("create");
        setBookingModalOpen(true);
    };

    const openEditBooking = (booking: AdminBooking) => {
        setEditingBooking(booking);
        setBookingDraft(mapBookingToDraft(booking));
        setBookingModalMode("edit");
        setBookingModalOpen(true);
    };

    const openCreateUser = () => {
        setEditingUser(null);
        setUserDraft(emptyUserDraft);
        setUserModalMode("create");
        setUserModalOpen(true);
    };

    const openEditUser = (user: AdminUser) => {
        setEditingUser(user);
        setUserDraft(mapUserToDraft(user));
        setUserModalMode("edit");
        setUserModalOpen(true);
    };

    const closeBookingModal = () => {
        setBookingModalOpen(false);
        setEditingBooking(null);
        setBookingDraft(emptyBookingDraft);
        setBookingModalMode("create");
    };

    const closeUserModal = () => {
        setUserModalOpen(false);
        setEditingUser(null);
        setUserDraft(emptyUserDraft);
        setUserModalMode("create");
    };

    const refresh = async () => {
        setError(null);
        setStatusMessage(null);

        try {
            await loadData();
            setStatusMessage("Données actualisées.");
        } catch (refreshError) {
            setError(refreshError instanceof Error ? refreshError.message : "Impossible de rafraîchir les données.");
        }
    };

    const handleBookingSubmit = async (values: BookingDraft) => {
        setError(null);
        setStatusMessage(null);
        setIsSubmittingBooking(true);

        try {
            const payload = {
                date: new Date(values.date).toISOString(),
                userId: Number(values.userId),
                parkingSpotId: Number(values.parkingSpotId),
            };

            if (bookingModalMode === "create") {
                await createAdminBooking(payload);
                setStatusMessage("Réservation créée avec succès.");
            } else if (editingBooking) {
                await updateAdminBooking(editingBooking.id, {
                    date: payload.date,
                    newParkingSpotId: payload.parkingSpotId,
                });
                setStatusMessage("Réservation mise à jour avec succès.");
            }

            await loadData();
            closeBookingModal();
        } catch (bookingError) {
            setError(bookingError instanceof Error ? bookingError.message : "Une erreur s'est produite.");
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    const handleUserSubmit = async (values: UserDraft) => {
        setError(null);
        setStatusMessage(null);
        setIsSubmittingUser(true);

        try {
            if (userModalMode === "create") {
                await createAdminUser(values);
                setStatusMessage("Utilisateur créé avec succès.");
            } else if (editingUser) {
                const updatePayload = buildUserUpdatePayload(editingUser, values);

                if (!updatePayload) {
                    setStatusMessage("Aucune modification détectée.");
                    closeUserModal();
                    return;
                }

                await updateAdminUser(editingUser.id, updatePayload);
                setStatusMessage("Utilisateur mis à jour avec succès.");
            }

            await loadData();
            closeUserModal();
        } catch (userError) {
            setError(userError instanceof Error ? userError.message : "Une erreur s'est produite.");
        } finally {
            setIsSubmittingUser(false);
        }
    };

    const handleBookingDelete = async () => {
        if (!bookingToDelete) {
            return;
        }

        setError(null);
        setStatusMessage(null);
        setIsDeletingBooking(true);

        try {
            await cancelAdminBooking(bookingToDelete.id);
            await loadData();
            setStatusMessage("Réservation annulée.");
            setBookingToDelete(null);
        } catch (bookingError) {
            setError(bookingError instanceof Error ? bookingError.message : "Une erreur s'est produite.");
        } finally {
            setIsDeletingBooking(false);
        }
    };

    const handleUserDelete = async () => {
        if (!userToDelete) {
            return;
        }

        setError(null);
        setStatusMessage(null);
        setIsDeletingUser(true);

        try {
            await deleteAdminUser(userToDelete.id);
            await loadData();
            setStatusMessage("Utilisateur supprimé.");
            setUserToDelete(null);
        } catch (userError) {
            setError(userError instanceof Error ? userError.message : "Une erreur s'est produite.");
        } finally {
            setIsDeletingUser(false);
        }
    };

    const activeBookingCount = activeBookings.length;
    const activeUserCount = activeUsers.length;

    if (isLoading) {
        return (
            <div className="grid min-h-svh place-items-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-6">
                <div className="rounded-2xl border border-black/5 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
                    Chargement de l’administration...
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.1),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                                <Shield className="size-3.5" />
                                Espace secrétaire
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Administration des réservations et des utilisateurs
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                                    Gérez les réservations et les comptes dans deux espaces dédiés avec création, édition et suppression en modales.
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={refresh}
                            className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                        >
                            <RefreshCw className="size-4" />
                            Actualiser
                        </Button>
                    </div>
                </section>

                {(error || statusMessage) && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                            error
                                ? "border-red-200 bg-red-50 text-red-800"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}
                    >
                        {error ? (
                            <span className="inline-flex items-center gap-2">
                                <AlertCircle className="size-4" />
                                {error}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="size-4" />
                                {statusMessage}
                            </span>
                        )}
                    </div>
                )}

                <div className="space-y-5">
                    <div className="flex justify-center">
                        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>

                    {activeTab === "bookings" ? (
                        <AdminBookingsTab
                            bookings={bookings}
                            onCreate={openCreateBooking}
                            onEdit={openEditBooking}
                            onDelete={setBookingToDelete}
                        />
                    ) : (
                        <AdminUsersTab
                            users={users}
                            onCreate={openCreateUser}
                            onEdit={openEditUser}
                            onDelete={setUserToDelete}
                        />
                    )}
                </div>
            </div>

            <AdminBookingModal
                open={bookingModalOpen}
                title={bookingModalMode === "create" ? "Créer une réservation" : "Modifier la réservation"}
                description="Renseignez la date, l'utilisateur et la place de parking à affecter."
                users={users}
                initialValues={bookingDraft}
                onClose={closeBookingModal}
                onSubmit={handleBookingSubmit}
                submitLabel={bookingModalMode === "create" ? "Créer" : "Enregistrer"}
                isSubmitting={isSubmittingBooking}
            />

            <AdminUserModal
                open={userModalOpen}
                title={userModalMode === "create" ? "Créer un utilisateur" : "Modifier l'utilisateur"}
                description="Renseignez les informations du compte. Le mot de passe n'est demandé qu'à la création."
                initialValues={userDraft}
                onClose={closeUserModal}
                onSubmit={handleUserSubmit}
                submitLabel={userModalMode === "create" ? "Créer" : "Enregistrer"}
                isSubmitting={isSubmittingUser}
                showPassword={userModalMode === "create"}
            />

            <AdminConfirmModal
                open={bookingToDelete !== null}
                title="Supprimer la réservation"
                description={bookingToDelete ? `Annuler définitivement la réservation #${bookingToDelete.id} du ${bookingToDelete.date.slice(0, 10)} ?` : ""}
                confirmLabel="Supprimer"
                onClose={() => setBookingToDelete(null)}
                onConfirm={handleBookingDelete}
                isSubmitting={isDeletingBooking}
            />

            <AdminConfirmModal
                open={userToDelete !== null}
                title="Supprimer l'utilisateur"
                description={userToDelete ? `Supprimer le compte ${userToDelete.first_name} ${userToDelete.last_name} (${userToDelete.email ?? "sans email"}) ?` : ""}
                confirmLabel="Supprimer"
                onClose={() => setUserToDelete(null)}
                onConfirm={handleUserDelete}
                isSubmitting={isDeletingUser}
            />
        </div>
    );
}
