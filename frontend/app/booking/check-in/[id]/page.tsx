"use client";

import { checkInBooking } from "@/services";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
	const params = useParams<{ id: string }>();
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const runCheckIn = async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
				window.location.href = `/?redirect=${redirect}`;
				return;
			}

			const bookingId = Number(params.id);
			if (!bookingId || Number.isNaN(bookingId)) {
				setError("Identifiant de réservation invalide.");
				return;
			}

			try {
				await checkInBooking(bookingId);
				setMessage("Check-in effectué avec succès.");
			} catch (err) {
				setError(err instanceof Error ? err.message : "Une erreur s'est produite lors du check-in.");
			}
		};

		runCheckIn();
	}, [params.id]);

	return (
		<div className="grid min-h-svh place-items-center p-6">
			<div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
				{!message && !error && <p className="text-gray-700">Check-in en cours...</p>}
				{message && <p className="text-green-700">{message}</p>}
				{error && <p className="text-red-700">{error}</p>}
			</div>
		</div>
	);
}
