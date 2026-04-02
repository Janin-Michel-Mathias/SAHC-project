import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardRatioBar } from "./dashboard-ratio-bar";
import type { DashboardDerivedStats } from "./dashboard.types";

type DashboardBreakdownProps = {
    stats: DashboardDerivedStats;
    backendRangeLabel: string;
};

function formatPercent(value: number) {
    return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function DashboardBreakdown({ stats, backendRangeLabel }: DashboardBreakdownProps) {
    return (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-0 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur">
                <CardHeader className="border-b border-slate-200/80 pb-5">
                    <CardDescription className="uppercase tracking-[0.2em] text-slate-500">Répartition</CardDescription>
                    <CardTitle className="text-2xl text-slate-950">Utilisation du parking par les utilisateurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <DashboardRatioBar
                        leftLabel="Utilisent le parking"
                        rightLabel="Ne l'utilisent pas"
                        leftValue={stats.usersUsingParking}
                        rightValue={stats.usersNotUsingParking}
                        leftColor="rounded-full bg-emerald-500 transition-[width] duration-500"
                        rightColor="rounded-full bg-slate-200 transition-[width] duration-500"
                    />

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Utilisateurs actifs</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.totalUsers}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Réservations actives</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.activeBookings}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Jours analysés</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.selectedDayCount}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 bg-slate-950 text-white shadow-xl shadow-slate-950/20">
                <CardHeader className="border-b border-white/10 pb-5">
                    <CardDescription className="uppercase tracking-[0.2em] text-slate-400">Focus électrique</CardDescription>
                    <CardTitle className="text-2xl text-white">Proportion de places aménagées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-300">
                            <span>Places électriques</span>
                            <span>
                                {stats.electricSpots} / {stats.totalSpots}
                            </span>
                        </div>
                        <div className="h-4 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-[width] duration-500"
                                style={{ width: `${stats.electricSpotRate}%` }}
                            />
                        </div>
                        <p className="text-sm leading-6 text-slate-300">
                            {formatPercent(stats.electricSpotRate)} du parc est aménagé pour les véhicules électriques.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Taux moyen d&apos;occupation</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{formatPercent(stats.occupancyRate)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Répartition usage</p>
                            <p className="mt-2 text-3xl font-semibold text-white">{formatPercent(stats.activeUserRate)}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                        Données récupérées via les routes manager du backend entre {backendRangeLabel}.
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}