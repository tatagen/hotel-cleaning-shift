import React, { useState } from "react";
import { Staff, Assignment } from "../types";
import { MonthCalendar } from "./MonthCalendar";
import { Modal } from "./Modal";

interface SummaryViewProps {
  selectedDate: string;
  staff: Staff[];
  assignments: Assignment[];
}

const formatYen = (num: number) => `¥${num.toLocaleString("ja-JP")}`;

const getWeekDayJP = (dateStr: string) => {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "" : days[d.getDay()];
};

export const SummaryView: React.FC<SummaryViewProps> = ({ selectedDate, staff, assignments }) => {
  const [monthDate, setMonthDate] = useState<string>(selectedDate);
  const [popupDate, setPopupDate] = useState<string | null>(null);

  const [targetYear, targetMonth] = monthDate.split("-");
  const monthPrefix = `${targetYear}-${targetMonth}`;
  const monthAssignments = assignments.filter((a) => a.date.startsWith(monthPrefix));

  const rows = staff.map((s) => {
    const sa = monthAssignments.filter((a) => a.staffId === s.id);
    return { staff: s, roomCount: sa.length, total: sa.reduce((sum, a) => sum + a.appliedPrice, 0) };
  });

  const grandTotalRooms = monthAssignments.length;
  const grandTotalAmount = monthAssignments.reduce((sum, a) => sum + a.appliedPrice, 0);
  const popupAssignments = popupDate ? assignments.filter((a) => a.date === popupDate) : [];

  return (
    <div className="space-y-6">
      {/* カレンダー */}
      <MonthCalendar
        monthDate={monthDate}
        onMonthChange={setMonthDate}
        onSelectDay={setPopupDate}
        renderDayBadge={(dateStr) => {
          const da = assignments.filter((a) => a.date === dateStr);
          if (da.length === 0) return null;
          const total = da.reduce((sum, a) => sum + a.appliedPrice, 0);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">
                {da.length}部屋
              </span>
              <span className="text-[10px] font-semibold text-slate-500">{formatYen(total)}</span>
            </div>
          );
        }}
      />

      {/* 月別スタッフ集計表 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-slate-700">
            {targetYear}年{targetMonth}月 スタッフ別 清掃実績・報酬集計
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-slate-500 font-semibold border-b border-gray-200 uppercase tracking-wide">
              <th className="py-3 px-5">スタッフ名</th>
              <th className="py-3 px-5 text-right">清掃部屋数</th>
              <th className="py-3 px-5 text-right">合計金額</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-400">
                  スタッフが登録されていません。
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.staff.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-5 font-semibold text-slate-800">{r.staff.name}</td>
                  <td className="py-3 px-5 text-right text-slate-600">{r.roomCount}部屋</td>
                  <td className="py-3 px-5 text-right font-bold text-indigo-600">{formatYen(r.total)}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-indigo-50 border-t border-indigo-100 font-bold text-sm">
                <td className="py-3 px-5 text-slate-700">合計</td>
                <td className="py-3 px-5 text-right text-slate-700">{grandTotalRooms}部屋</td>
                <td className="py-3 px-5 text-right text-indigo-700">{formatYen(grandTotalAmount)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 日付詳細ポップアップ */}
      {popupDate && (
        <Modal
          title={`${popupDate.replace(/-/g, "/")} (${getWeekDayJP(popupDate)}) の清掃実績`}
          onClose={() => setPopupDate(null)}
        >
          {popupAssignments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">この日の清掃実績はありません。</p>
          ) : (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-500 font-semibold border-b border-gray-200 uppercase tracking-wide">
                    <th className="py-2.5 px-2">部屋番号</th>
                    <th className="py-2.5 px-2">担当スタッフ</th>
                    <th className="py-2.5 px-2 text-right">単価</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {popupAssignments
                    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
                    .map((a) => {
                      const name = staff.find((s) => s.id === a.staffId)?.name ?? "削除済スタッフ";
                      return (
                        <tr key={a.id} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-2 font-bold text-slate-800">{a.roomNumber}</td>
                          <td className="py-2.5 px-2 text-slate-700">{name}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-indigo-600">{formatYen(a.appliedPrice)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-slate-700">この日の合計</span>
                <span className="text-base font-bold text-indigo-700">
                  {formatYen(popupAssignments.reduce((sum, a) => sum + a.appliedPrice, 0))}
                </span>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
