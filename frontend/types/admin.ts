import { Role } from "./user/roles";

export type AdminBooking = {
    id: number;
    date: string;
    has_checked_in: boolean;
    checked_in_at: string | null;
    is_cancelled: boolean;
    created_at: string;
    cancelled_at: string | null;
    user: {
        id: number;
        email: string | null;
        first_name: string;
        last_name: string;
        role: string;
    };
    parking_spot: {
        id: number;
        row: string;
        col: string;
        isElectric: boolean;
    };
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
