import ParkingSpot from "@/components/booking/parkingSpot";
import { useEffect, useState } from "react";
import { ParkingSpotProps } from "@/types";
import { bookParkingSpot, cancelParkingSpot, getParkingSpots, getSelfBookingSummary } from "@/services";
import BookingModal from "@/components/booking/bookingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Car, ChevronLeft, ChevronRight, PlugZap, TicketCheck } from "lucide-react";

function formatCurrentDate(value: Date) {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(value);
}

function Parking() {
    const [date, setDate] = useState(new Date());
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpotProps | null>(null);
    const [modalMode, setModalMode] = useState<"book" | "cancel">("book");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [reservationDays, setReservationDays] = useState(1);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpotProps[]>([]);
    const [remainingBookings, setRemainingBookings] = useState<number | null>(null);
    const rows = Array.from(new Set(parkingSpots.map((spot) => spot.row))).sort();
    const columns = Array.from(new Set(parkingSpots.map((spot) => spot.column))).sort();

    const refreshData = async (targetDate: Date) => {
        const [spots, selfSummary] = await Promise.all([
            getParkingSpots(targetDate),
            getSelfBookingSummary(),
        ]);

        setParkingSpots(spots);
        setRemainingBookings(selfSummary.remainingBookings);
    };

    useEffect(() => {
        refreshData(date).catch((error) => {
            alert(error instanceof Error ? error.message : "Une erreur s'est produite");
        });
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

    const bookSpot = async (spot: ParkingSpotProps) => {
        try {
            await bookParkingSpot(date, spot.id);
            await refreshData(date);
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
            await refreshData(date);
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

    const bookedCount = parkingSpots.filter((spot) => spot.bookedBy !== null).length;
    const availableCount = Math.max(0, parkingSpots.length - bookedCount);
    const electricCount = parkingSpots.filter((spot) => spot.isElectric).length;
    const occupancyRate = parkingSpots.length === 0 ? 0 : (bookedCount / parkingSpots.length) * 100;

    const formattedOccupancy = `${occupancyRate.toLocaleString("fr-FR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })} %`;

    if (parkingSpots.length === 0) {
        return (
            <Card className="border-dashed border-slate-300 bg-white/70 shadow-sm">
                <CardContent className="p-8 text-center text-sm text-slate-600">Chargement des places de parking...</CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        <CalendarDays className="size-3.5" />
                        Date sélectionnée
                    </div>
                    <p className="text-lg font-semibold text-slate-950">{formatCurrentDate(date)}</p>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        <TicketCheck className="size-3.5" />
                        Réservations restantes: {remainingBookings ?? "..."}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDate(new Date(date.getTime() - 24 * 60 * 60 * 1000))}
                        className="rounded-xl"
                    >
                        <ChevronLeft className="size-4" />
                        Précédent
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000))}
                        className="rounded-xl"
                    >
                        Suivant
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <span className="size-2 rounded-full bg-white ring-1 ring-slate-300" />
                    Disponible
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Votre réservation
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <span className="size-2 rounded-full bg-slate-400" />
                    Réservée
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <PlugZap className="size-3.5 text-amber-500" />
                    Place électrique
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <Car className="size-3.5 text-slate-500" />
                    Cliquez sur une place pour agir
                </span>
            </div>

            <div className="flex flex-col gap-4 overflow-x-auto rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="grid min-w-max gap-3" style={{ gridTemplateColumns: `auto repeat(${columns.length}, minmax(5.5rem, 1fr))` }}>
                    <div />
                    {columns.map((column) => (
                        <div key={column} className="flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
                            Place {column}
                        </div>
                    ))}

                    {rows.map((row) => (
                        <div key={row} className="contents">
                            <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
                                Ligne {row}
                            </div>
                        {columns.map(column => {
                            const spot = parkingSpots.find((currentSpot) => currentSpot.row === row && currentSpot.column === column);
                            return spot
                                ? <ParkingSpot key={`${row}${column}`} {...spot} currentUserId={currentUserId} onSelect={() => openModal(spot)} />
                                : <div key={`${row}${column}`} className="h-24 w-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50" />;
                        })}
                        </div>
                    ))}
                </div>
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
                            : bookSpot(selectedSpot)
                    }
                />
            )}
        </div>
    );
}

export default Parking;