import { User } from "../user";

export type ParkingSpotProps = {
    id: number;
    row: string;
    column: string;
    isElectric: boolean;
    bookingId: number | null;
    bookedBy: User | null;
}

export type ParkingSpotCardProps = ParkingSpotProps & {
    onSelect?: () => void;
    currentUserId?: string | null;
}