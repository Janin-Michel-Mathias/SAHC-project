import { User } from "../user";

export type ParkingSpotProps = {
    id: number;
    row: string;
    col: string;
    isElectric: boolean;
    bookingId: number | null;
    bookedBy: User | null;
}

export type ParkingSpotCardProps = ParkingSpotProps & {
    onSelect?: () => void;
    currentUserId?: string | null;
}