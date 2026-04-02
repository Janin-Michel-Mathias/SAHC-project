import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParkingSpotCardProps } from "@/types";
import { PlugZap } from "lucide-react";

function ParkingSpot({ row, column, isElectric, bookedBy, onSelect, currentUserId }: ParkingSpotCardProps) {
    console.log("Rendering ParkingSpot", { row, column, isElectric, bookedBy, currentUserId });
    const isBookedByCurrentUser = bookedBy !== null && `${bookedBy.id}` === currentUserId;
    const isDisabled = bookedBy !== null && !isBookedByCurrentUser;

    const cardStateClass = bookedBy !== null
        ? isBookedByCurrentUser
            ? "border-emerald-300 bg-emerald-50 text-emerald-950"
            : "border-slate-300 bg-slate-200/80 text-slate-600"
        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50";

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={isDisabled}
            className="text-left disabled:cursor-not-allowed disabled:opacity-90"
            aria-label={`Sélectionner la place ${row}${column}`}
        >
            <Card className={`h-30 w-25 border shadow-sm transition ${cardStateClass}`}>
                <CardHeader className="px-3 pb-1 pt-3">
                    <CardTitle className="text-sm font-semibold tracking-wide">
                        <span className="block text-lg leading-tight">{row}{column}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                            <span>
                                {bookedBy === null ? "Libre" : isBookedByCurrentUser ? "Vous" : "Réservée"}
                            </span>
                            {isElectric && <PlugZap className="size-3.5 text-amber-500" />}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </button>
    )
}

export default ParkingSpot;