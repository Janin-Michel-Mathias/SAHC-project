import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParkingSpotCardProps } from "@/types";

function ParkingSpot({row, column, isElectric, bookedBy, onSelect, currentUserId}: ParkingSpotCardProps) {
    const isBookedByCurrentUser = bookedBy !== null && `${bookedBy.id}` === currentUserId;

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={bookedBy !== null && !isBookedByCurrentUser}
            className="text-left disabled:cursor-not-allowed"
            aria-label={`Sélectionner la place ${row}${column}`}
        >
            <Card className={`w-20 h-20 p-2 text-black border-1 border-gray-800 ${bookedBy !== null ? isBookedByCurrentUser ? "bg-blue-500" : "bg-gray-500" : "bg-white hover:bg-gray-100"}`}>
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