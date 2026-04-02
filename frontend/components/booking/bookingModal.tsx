import { Button } from "@/components/ui/button";
import { ParkingSpotProps } from "@/types";
import { CalendarClock, PlugZap, XCircle } from "lucide-react";

type BookingModalProps = {
    selectedSpot: ParkingSpotProps;
    reservationDays: number;
    setReservationDays: React.Dispatch<React.SetStateAction<number>>;
    mode: "book" | "cancel";
    onClose: () => void;
    onConfirm: () => void;
};

function BookingModal({
    selectedSpot,
    mode,
    onClose,
    onConfirm,
}: BookingModalProps) {
    const isCancelMode = mode === "cancel";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Escape" || event.key === "Enter") {
                    onClose();
                }
            }}
        >
            <div
                className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl shadow-slate-950/20"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {isCancelMode ? <XCircle className="size-3.5" /> : <CalendarClock className="size-3.5" />}
                        {isCancelMode ? "Annulation" : "Réservation"}
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {isCancelMode
                            ? `Annuler la réservation ${selectedSpot.row}${selectedSpot.column}`
                            : `Réserver la place ${selectedSpot.row}${selectedSpot.column}`}
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                        Place sélectionnée: <span className="font-medium text-slate-900">{selectedSpot.row}{selectedSpot.column}</span>
                        {selectedSpot.isElectric && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <PlugZap className="size-3" />
                                Électrique
                            </span>
                        )}
                    </p>
                </div>

                <p className="mb-6 text-sm text-slate-600">
                    {isCancelMode
                        ? "Cette place est réservée par vous. Voulez-vous annuler cette réservation ?"
                        : "Confirmez-vous la réservation de cette place ?"}
                </p>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
                    <Button type="button" variant={isCancelMode ? "destructive" : "default"} onClick={onConfirm}>
                        {isCancelMode ? "Confirmer l'annulation" : "Valider"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default BookingModal;