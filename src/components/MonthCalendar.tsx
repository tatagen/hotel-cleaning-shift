import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthCalendarProps {
  monthDate: string;
  onMonthChange: (dateStr: string) => void;
  onSelectDay: (dateStr: string) => void;
  renderDayBadge: (dateStr: string) => React.ReactNode;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  monthDate,
  onMonthChange,
  onSelectDay,
  renderDayBadge,
}) => {
  const todayStr = formatDate(new Date());
  const [targetYear, targetMonth] = monthDate.split("-");

  const handleMonthShift = (dir: number) => {
    const d = new Date(monthDate);
    if (isNaN(d.getTime())) return;
    d.setMonth(d.getMonth() + dir);
    onMonthChange(formatDate(d));
  };

  const calendarCells = useMemo(() => {
    const base = new Date(monthDate);
    if (isNaN(base.getTime())) return [];
    const year = base.getFullYear();
    const month = base.getMonth();
    const startDow = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: { dateStr: string | null; dayNum: number | null }[] = [];
    for (let i = 0; i < startDow; i++) cells.push({ dateStr: null, dayNum: null });
    for (let i = 1; i <= totalDays; i++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(i).padStart(2, "0");
      cells.push({ dateStr: `${year}-${mm}-${dd}`, dayNum: i });
    }
    return cells;
  }, [monthDate]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 月ナビゲーション */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="text-sm font-bold text-slate-700">
          {targetYear}年 {targetMonth}月
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMonthChange(todayStr)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
          >
            今月
          </button>
          <button
            onClick={() => handleMonthShift(-1)}
            className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-500 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMonthShift(1)}
            className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-500 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 text-center py-2.5 text-xs font-semibold">
        {DAY_NAMES.map((name, idx) => (
          <div
            key={name}
            className={idx === 0 ? "text-rose-500" : idx === 6 ? "text-blue-500" : "text-slate-500"}
          >
            {name}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7">
        {calendarCells.map((cell, idx) => {
          const isLastCol = idx % 7 === 6;
          if (!cell.dateStr) {
            return (
              <div
                key={`empty-${idx}`}
                className={`min-h-[88px] bg-gray-50/50 border-b border-gray-100 ${!isLastCol ? "border-r border-gray-100" : ""}`}
              />
            );
          }

          const isToday = cell.dateStr === todayStr;
          const weekday = new Date(cell.dateStr).getDay();

          return (
            <button
              key={cell.dateStr}
              onClick={() => onSelectDay(cell.dateStr!)}
              className={`min-h-[88px] p-2 flex flex-col items-start gap-1 text-left border-b border-gray-100 hover:bg-indigo-50/50 transition-colors cursor-pointer ${
                !isLastCol ? "border-r border-gray-100" : ""
              }`}
            >
              <span
                className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
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
