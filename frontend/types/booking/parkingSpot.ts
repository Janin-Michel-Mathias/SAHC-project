import { User } from "../user";

export type ParkingSpotProps = {
    id: number;
    row: string;
    column: string;
    isElectric: boolean;
    bookedBy: User | null;
}

export type ParkingSpotCardProps = ParkingSpotProps & {
    onSelect?: () => void;
}