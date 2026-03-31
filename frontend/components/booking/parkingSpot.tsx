import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ParkingSpotProps = {
    id: number;
    row: string;
    column: string;
    isElectric: boolean;
    isBooked: boolean;
}

type ParkingSpotCardProps = ParkingSpotProps & {
    onSelect?: () => void;
}

function ParkingSpot({row, column, isElectric, isBooked, onSelect}: ParkingSpotCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={isBooked}
            className="text-left disabled:cursor-not-allowed"
            aria-label={`Sélectionner la place ${row}${column}`}
        >
            <Card className={`w-20 h-20 p-2 text-black border-1 border-gray-800 ${isBooked ? "bg-gray-500" : "bg-white hover:bg-gray-100"}`}>
                <CardHeader className="h-1/3">
                    <CardTitle>{row}{column}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{isElectric ? "🔌" : ""}</p>
                </CardContent>
            </Card>
        </button>
    )
}

export default ParkingSpot;