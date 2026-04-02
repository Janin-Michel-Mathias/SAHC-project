import type { Role } from "@/types/user/roles";

type AdminBookingUser = {
    id: number;
    email: string | null;
    first_name: string;
    last_name: string;
    role: string;
};

type AdminParkingSpot = {
    id: number;
    row: string;
    col: string;
    isElectric: boolean;
};

export type AdminBooking = {
    id: number;
    date: string;
    has_checked_in: boolean;
    checked_in_at: string | null;
    is_cancelled: boolean;
    created_at: string;
    cancelled_at: string | null;
    user: AdminBookingUser;
    parking_spot: AdminParkingSpot;
};

export type AdminUser = {
    id: number;
    email: string | null;
    first_name: string;
    last_name: string;
    role: Role | "";
    created_at: string;
    deleted_at: string | null;
};

export type AdminBookingInput = {
    date: string;
    userId: number;
    parkingSpotId: number;
};

export type AdminBookingUpdateInput = {
    date?: string;
    newParkingSpotId?: number;
};

export type AdminUserInput = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: Role;
};

export type AdminUserUpdateInput = Omit<Partial<AdminUserInput>, "password">;

async function adminRequest<T>(path: string, init?: RequestInit) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}admin${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Une erreur s'est produite");
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export function getAdminBookings() {
    return adminRequest<AdminBooking[]>("/bookings");
}

export function getAdminUsers() {
    return adminRequest<AdminUser[]>("/users");
}

export function createAdminBooking(input: AdminBookingInput) {
    return adminRequest<AdminBooking>("/bookings", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateAdminBooking(id: number, input: AdminBookingUpdateInput) {
    return adminRequest<AdminBooking>(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export function cancelAdminBooking(id: number) {
    return adminRequest<void>(`/bookings/${id}`, {
        method: "DELETE",
    });
}

export function createAdminUser(input: AdminUserInput) {
    return adminRequest<AdminUser>("/users", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateAdminUser(id: number, input: AdminUserUpdateInput) {
    return adminRequest<AdminUser>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export function deleteAdminUser(id: number) {
    return adminRequest<void>(`/users/${id}`, {
        method: "DELETE",
    });
}