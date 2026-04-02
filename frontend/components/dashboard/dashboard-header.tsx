import { Gauge, Users } from "lucide-react";

import { Card } from "@/components/ui/card";

type DashboardHeaderProps = {
    periodLabel: string;
};

export function DashboardHeader({ periodLabel }: DashboardHeaderProps) {
    return (
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        <Gauge className="size-4" />
                        Vue manager
                    </div>
                    <div className="space-y-3">
                        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                            Pilotage des usages du parking en un coup d&apos;oeil.
                        </h1>
                        <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                            Cette page synthétise les indicateurs demandés pour les managers à partir des données du backend :
                            utilisateurs actifs, taux de remplissage moyen, répartition des usages et proportion des places électriques.
                        </p>
                    </div>
                </div>

                <Card className="grid gap-3 border-0 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                        <Users className="size-4" />
                        Période active
                    </div>
                    <div className="text-2xl font-semibold tracking-tight">{periodLabel}</div>
                    <p className="text-sm leading-6 text-slate-300">
                        Les métriques ci-dessous sont recalculées à chaque changement de période.
                    </p>
                </Card>
            </div>
        </header>
    );
}