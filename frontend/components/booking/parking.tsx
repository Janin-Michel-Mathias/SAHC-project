import ParkingSpot from "@/components/booking/parkingSpot";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ParkingSpotProps } from "@/types";
import { bookParkingSpot, getParkingSpots } from "@/services";

function Parking() {
    const [date, setDate] = useState(new Date());
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpotProps | null>(null);
    const [reservationDays, setReservationDays] = useState(1);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpotProps[]>([]);
    const rows = Array.from(new Set(parkingSpots.map(spot => spot.row)));
    const columns = Array.from(new Set(parkingSpots.map(spot => spot.column)));


    useEffect(() => {
        getParkingSpots(date).then(setParkingSpots);
    }, [date]);

    const closeModal = () => {
        setSelectedSpot(null);
        setReservationDays(1);
    };

    const openModal = (spot: ParkingSpotProps) => {
        if (spot.bookedBy !== null) {
            return;
        }

        setSelectedSpot(spot);
        setReservationDays(1);
    };

    const bookSpot = async (spot: ParkingSpotProps, range: number) => {
        try {
            await bookParkingSpot(date, spot.id);
            const updatedSpots = await getParkingSpots(date);
            setParkingSpots(updatedSpots);
            closeModal();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Une erreur s'est produite");
        }
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, []);

    if (parkingSpots.length === 0) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <button onClick={() => setDate(new Date(date.getTime() - 24 * 60 * 60 * 1000))} className="px-4 py-2 bg-gray-300 rounded">Précédent</button>
                <span className="mx-4">{date.toDateString()}</span>
                <button onClick={() => setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000))} className="px-4 py-2 bg-gray-300 rounded">Suivant</button>
            </div>
            <div className="flex flex-col gap-4">
                {rows.map(row => (
                    <div key={row} className="flex gap-4">
                        {columns.map(column => {
                            const spot = parkingSpots.find(spot => spot.row === row && spot.column === column);
                            return spot
                                ? <ParkingSpot key={`${row}${column}`} {...spot} onSelect={() => openModal(spot)} />
                                : <div key={`${row}${column}`} className="w-20 h-20 p-4 text-black border-1 border-gray-800 bg-gray-300" />;
                        })}
                    </div>
                ))}
            </div>

            {selectedSpot && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeModal}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === "Escape" || event.key === "Enter") {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 className="mb-2 text-xl font-semibold">Réserver la place {selectedSpot.row}{selectedSpot.column}</h2>
                        <p className="mb-6 text-sm text-gray-600">Choisissez la durée de réservation (en jours).</p>

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

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
                            <Button type="button" onClick={() => bookSpot(selectedSpot, reservationDays)}>Valider</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Parking;