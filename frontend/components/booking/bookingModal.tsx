import { Button } from "@/components/ui/button";
import { ParkingSpotProps } from "@/types";

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
    reservationDays,
    setReservationDays,
    mode,
    onClose,
    onConfirm,
}: BookingModalProps) {
    const isCancelMode = mode === "cancel";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
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
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="mb-2 text-xl font-semibold">
                    {isCancelMode
                        ? `Annuler la réservation ${selectedSpot.row}${selectedSpot.column}`
                        : `Réserver la place ${selectedSpot.row}${selectedSpot.column}`}
                </h2>
                <p className="mb-6 text-sm text-gray-600">
                    {isCancelMode
                        ? "Cette place est réservée par vous. Voulez-vous annuler cette réservation ?"
                        : "Choisissez la durée de réservation (en jours)."}
                </p>

                {!isCancelMode && (
                    <div className="mb-6 flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReservationDays((current) => Math.max(1, current - 1))}
                        >
                            -
                        </Button>
                        <input
                            type="number"
                            min={1}
                            value={reservationDays}
                            onChange={(event) => {
                                const nextValue = Number(event.target.value);
                                setReservationDays(Number.isNaN(nextValue) ? 1 : Math.max(1, nextValue));
                            }}
                            className="h-8 w-20 rounded-md border border-gray-300 px-2 text-center text-black"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReservationDays((current) => current + 1)}
                        >
                            +
                        </Button>
                        <span className="text-sm text-gray-700">jour(s)</span>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button type="button" variant={isCancelMode ? "destructive" : "default"} onClick={onConfirm}>
                        {isCancelMode ? "Confirmer l'annulation" : "Valider"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default BookingModal;