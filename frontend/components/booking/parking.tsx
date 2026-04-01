import ParkingSpot from "@/components/booking/parkingSpot";
import { useEffect, useState } from "react";
import { ParkingSpotProps } from "@/types";
import { bookParkingSpot, cancelParkingSpot, getParkingSpots } from "@/services";
import BookingModal from "@/components/booking/bookingModal";

function Parking() {
    const [date, setDate] = useState(new Date());
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpotProps | null>(null);
    const [modalMode, setModalMode] = useState<"book" | "cancel">("book");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [reservationDays, setReservationDays] = useState(1);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpotProps[]>([]);
    const rows = Array.from(new Set(parkingSpots.map(spot => spot.row)));
    const columns = Array.from(new Set(parkingSpots.map(spot => spot.column)));


    useEffect(() => {
        getParkingSpots(date).then(setParkingSpots);
    }, [date]);

    useEffect(() => {
        setCurrentUserId(localStorage.getItem("userId"));
    }, []);

    const closeModal = () => {
        setSelectedSpot(null);
        setModalMode("book");
        setReservationDays(1);
    };

    const openModal = (spot: ParkingSpotProps) => {
        const isBookedByCurrentUser =
            spot.bookedBy !== null && `${spot.bookedBy.id}` === currentUserId;

        if (spot.bookedBy !== null && !isBookedByCurrentUser) {
            return;
        }

        setModalMode(isBookedByCurrentUser ? "cancel" : "book");
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

    const cancelSpot = async (spot: ParkingSpotProps) => {
        if (spot.bookingId === null) {
            alert("Réservation introuvable pour cette place");
            return;
        }

        try {
            await cancelParkingSpot(spot.bookingId);
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
                                ? <ParkingSpot key={`${row}${column}`} {...spot} currentUserId={currentUserId} onSelect={() => openModal(spot)} />
                                : <div key={`${row}${column}`} className="w-20 h-20 p-4 text-black border-1 border-gray-800 bg-gray-300" />;
                        })}
                    </div>
                ))}
            </div>

            {selectedSpot && (
                <BookingModal
                    selectedSpot={selectedSpot}
                    reservationDays={reservationDays}
                    setReservationDays={setReservationDays}
                    mode={modalMode}
                    onClose={closeModal}
                    onConfirm={() =>
                        modalMode === "cancel"
                            ? cancelSpot(selectedSpot)
                            : bookSpot(selectedSpot, reservationDays)
                    }
                />
            )}
        </div>
    );
}

export default Parking;