import type { ComponentType } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type MetricCardTone = "neutral" | "green" | "amber" | "blue";

type DashboardMetricCardProps = {
    title: string;
    value: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    tone?: MetricCardTone;
};

export function DashboardMetricCard({
    title,
    value,
    description,
    icon: Icon,
    tone = "neutral",
}: DashboardMetricCardProps) {
    const toneClasses = {
        neutral: "from-slate-50 to-white text-slate-900 ring-slate-200",
        green: "from-emerald-50 to-white text-emerald-950 ring-emerald-200",
        amber: "from-amber-50 to-white text-amber-950 ring-amber-200",
        blue: "from-sky-50 to-white text-sky-950 ring-sky-200",
    }[tone];

    return (
        <Card className={`border-0 bg-gradient-to-br shadow-lg shadow-slate-900/5 ring-1 ${toneClasses}`}>
            <CardHeader className="flex-row items-start justify-between gap-4 border-b border-black/5 pb-4">
                <div>
                    <CardDescription className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                        {title}
                    </CardDescription>
                    <CardTitle className="mt-2 text-4xl font-semibold tracking-tight text-inherit">{value}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-600">{description}</CardContent>
        </Card>
    );
}