import type { FormEvent } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DashboardPeriod } from "./dashboard.types";

type DashboardRangeFormProps = {
    period: DashboardPeriod;
    isRefreshing: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onPeriodChange: (value: DashboardPeriod) => void;
    onPrevious: () => void;
    onNext: () => void;
};

const periods: Array<{ value: DashboardPeriod; label: string; description: string }> = [
    { value: "week", label: "Semaine", description: "Vue de la semaine en cours" },
    { value: "month", label: "Mois", description: "Vue du mois en cours" },
];

export function DashboardRangeForm({
    period,
    isRefreshing,
    onSubmit,
    onPeriodChange,
    onPrevious,
    onNext,
}: DashboardRangeFormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur lg:flex-row lg:items-end lg:justify-between"
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[34rem]">
                {periods.map((item) => {
                    const selected = period === item.value;

                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onPeriodChange(item.value)}
                            className={`rounded-2xl border p-4 text-left transition ${
                                selected
                                    ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            <div className="text-sm font-semibold uppercase tracking-[0.18em]">{item.label}</div>
                            <div className={`mt-1 text-sm ${selected ? "text-slate-300" : "text-slate-500"}`}>
                                {item.description}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={onPrevious} disabled={isRefreshing} className="h-11 rounded-2xl px-4 color-slate-700 hover:text-gray-900">
                    <ChevronLeft className="size-4" />
                    Précédent
                </Button>
                <Button type="button" variant="outline" onClick={onNext} disabled={isRefreshing} className="h-11 rounded-2xl px-4 color-slate-700 hover:text-gray-900">
                    Suivant
                    <ChevronRight className="size-4" />
                </Button>
                <Button type="submit" disabled={isRefreshing} className="h-11 rounded-2xl px-5">
                    <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Actualiser
                </Button>
            </div>
        </form>
    );
}