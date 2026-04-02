function formatPercent(value: number) {
    return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

type DashboardRatioBarProps = {
    leftLabel: string;
    rightLabel: string;
    leftValue: number;
    rightValue: number;
    leftColor: string;
    rightColor: string;
};

export function DashboardRatioBar({
    leftLabel,
    rightLabel,
    leftValue,
    rightValue,
    leftColor,
    rightColor,
}: DashboardRatioBarProps) {
    const total = leftValue + rightValue;
    const leftWidth = total === 0 ? 0 : (leftValue / total) * 100;
    const rightWidth = total === 0 ? 0 : 100 - leftWidth;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full bg-slate-100 ring-1 ring-black/5">
                <div className={leftColor} style={{ width: `${leftWidth}%` }} />
                <div className={rightColor} style={{ width: `${rightWidth}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-slate-900">
                <span>{formatPercent(total === 0 ? 0 : (leftValue / total) * 100)}</span>
                <span>{formatPercent(total === 0 ? 0 : (rightValue / total) * 100)}</span>
            </div>
        </div>
    );
}