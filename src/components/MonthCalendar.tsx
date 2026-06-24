import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthCalendarProps {
  monthDate: string; // YYYY-MM-DD（表示する月を決める代表日）
  onMonthChange: (dateStr: string) => void;
  onSelectDay: (dateStr: string) => void;
  renderDayBadge: (dateStr: string) => React.ReactNode;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  monthDate,
  onMonthChange,
  onSelectDay,
  renderDayBadge,
}) => {
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const todayStr = new Date().toISOString().split("T")[0];

  const targetYear = monthDate.split("-")[0];
  const targetMonth = monthDate.split("-")[1];

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleMonthShift = (direction: number) => {
    const date = new Date(monthDate);
    if (isNaN(date.getTime())) return;
    date.setMonth(date.getMonth() + direction);
    onMonthChange(formatDate(date));
  };

  const calendarCells = useMemo(() => {
    const baseDate = new Date(monthDate);
    if (isNaN(baseDate.getTime())) return [];

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: { dateStr: string | null; dayNum: number | null }[] = [];
    for (let i = 0; i < startDayOfWeek; i++) cells.push({ dateStr: null, dayNum: null });
    for (let i = 1; i <= totalDays; i++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(i).padStart(2, "0");
      cells.push({ dateStr: `${year}-${mm}-${dd}`, dayNum: i });
    }
    return cells;
  }, [monthDate]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* 月ナビゲーション */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <span className="text-sm font-bold text-slate-700">
          {targetYear}年 {targetMonth}月
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMonthChange(todayStr)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs cursor-pointer"
          >
            今月
          </button>
          <button
            onClick={() => handleMonthShift(-1)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="前月"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMonthShift(1)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="翌月"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center py-2 text-xs font-bold">
        {dayNames.map((name, idx) => (
          <div key={name} className={idx === 0 ? "text-rose-500" : idx === 6 ? "text-blue-500" : "text-slate-500"}>
            {name}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7">
        {calendarCells.map((cell, idx) => {
          if (!cell.dateStr) {
            return (
              <div
                key={`empty-${idx}`}
                className={`min-h-[88px] bg-slate-50/60 border-b border-slate-100 ${
                  idx % 7 !== 6 ? "border-r" : ""
                }`}
              />
            );
          }

          const isToday = cell.dateStr === todayStr;
          const weekday = new Date(cell.dateStr).getDay();

          return (
            <button
              key={cell.dateStr}
              onClick={() => onSelectDay(cell.dateStr!)}
              className={`min-h-[88px] p-2 flex flex-col items-start gap-1 text-left border-b border-slate-100 hover:bg-indigo-50/60 transition-colors cursor-pointer ${
                idx % 7 !== 6 ? "border-r" : ""
              }`}
            >
              <span
                className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday
                    ? "bg-indigo-600 text-white"
                    : weekday === 0
                      ? "text-rose-500"
                      : weekday === 6
                        ? "text-blue-500"
                        : "text-slate-700"
                }`}
              >
                {cell.dayNum}
              </span>
              {renderDayBadge(cell.dateStr)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
