"use client"

import { useEffect, useState } from "react";
import Parking from "@/components/booking/parking";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-5 text-sm text-slate-600 shadow-lg shadow-slate-900/5 backdrop-blur">
            Chargement de la vue réservation...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur md:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Réservations
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Plan du parking
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Consulte les disponibilités, choisis une place et gère tes réservations depuis une vue unifiée.
            </p>
          </div>
        </header>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6">
          <Parking />
        </section>
      </div>
    </div>
  )
}
