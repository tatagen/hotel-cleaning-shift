import React, { useState } from "react";
import { Staff, Shift } from "../types";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface ShiftViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  staff: Staff[];
  shifts: Shift[];
  onToggleShift: (date: string, staffId: string) => void;
  onAddStaff: (name: string, phone: string) => void;
  onUpdateStaff: (id: string, name: string, phone: string) => void;
  onDeleteStaff: (id: string) => void;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const ShiftView: React.FC<ShiftViewProps> = ({
  staff,
  shifts,
  onToggleShift,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const todayStr = formatDate(new Date());
  const [monthDate, setMonthDate] = useState<string>(todayStr);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const handleMonthShift = (dir: number) => {
    const d = new Date(monthDate);
    if (isNaN(d.getTime())) return;
    d.setMonth(d.getMonth() + dir);
    setMonthDate(formatDate(d));
  };

  const [targetYear, targetMonth] = monthDate.split("-");

  const monthDays = (() => {
    const base = new Date(monthDate);
    if (isNaN(base.getTime())) return [];
    const year = base.getFullYear();
    const month = base.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(i + 1).padStart(2, "0");
      return `${year}-${mm}-${dd}`;
    });
  })();

  const isWorkingOn = (dateStr: string, staffId: string) =>
    shifts.find((s) => s.date === dateStr)?.staffIds.includes(staffId) ?? false;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStaff(newName.trim(), newPhone.trim());
    setNewName("");
    setNewPhone("");
  };

  const startEdit = (s: Staff) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditPhone(s.phone);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateStaff(id, editName.trim(), editPhone.trim());
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* 出勤表 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-slate-700">
            {targetYear}年 {targetMonth}月 の出勤表
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthDate(todayStr)}
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

        <p className="px-5 pt-3 pb-1 text-xs text-slate-400">
          各セルをクリックすると出勤 / 休みを切り替えられます。
        </p>

        <div className="overflow-x-auto">
          <table className="border-collapse text-center">
            <thead>
              <tr className="bg-gray-50 text-[11px] text-slate-500 font-semibold">
                <th className="sticky left-0 z-10 bg-gray-50 px-5 py-2.5 text-left min-w-[148px] border-r border-gray-200">
                  スタッフ名
                </th>
                {monthDays.map((d) => {
                  const dayNum = d.split("-")[2];
                  const weekday = new Date(d).getDay();
                  const isToday = d === todayStr;
                  return (
                    <th key={d} className="px-1 py-2 min-w-[52px] border-l border-gray-100">
                      <div
                        className={`text-xs font-bold w-6 h-6 mx-auto flex items-center justify-center rounded-full ${
                          isToday
                            ? "bg-indigo-600 text-white"
                            : weekday === 0
                              ? "text-rose-500"
                              : weekday === 6
                                ? "text-blue-500"
                                : "text-slate-700"
                        }`}
                      >
                        {dayNum}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{DAY_NAMES[weekday]}</div>
                    </th>
                  );
                })}
                <th className="px-3 py-2 min-w-[72px] border-l border-gray-200 text-slate-500">出勤日数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={monthDays.length + 2} className="py-12 text-center text-sm text-slate-400">
                    スタッフが登録されていません。下のフォームから登録してください。
                  </td>
                </tr>
              ) : (
                staff.map((s) => {
                  const totalDays = monthDays.filter((d) => isWorkingOn(d, s.id)).length;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="sticky left-0 z-10 bg-white px-5 py-2 text-left font-semibold text-sm text-slate-800 border-r border-gray-100">
                        {s.name}
                      </td>
                      {monthDays.map((d) => {
                        const working = isWorkingOn(d, s.id);
                        return (
                          <td key={d} className="p-1 border-l border-gray-100">
                            <button
                              onClick={() => onToggleShift(d, s.id)}
                              className={`w-full py-2 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                                working
                                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              {working ? "出勤" : "休み"}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 font-bold text-sm text-indigo-600 border-l border-gray-200">
                        {totalDays}日
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {staff.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="sticky left-0 z-10 bg-gray-50 px-5 py-2 text-left text-[11px] font-semibold text-slate-500 border-r border-gray-200">
                    出勤人数
                  </td>
                  {monthDays.map((d) => {
                    const count = shifts.find((s) => s.date === d)?.staffIds.length ?? 0;
                    return (
                      <td key={d} className="px-1 py-2 text-[11px] font-bold text-slate-600 border-l border-gray-100">
                        {count > 0 ? count : ""}
                      </td>
                    );
                  })}
                  <td className="border-l border-gray-200" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* スタッフ登録フォーム */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-700">スタッフを新しく登録する</h2>
        <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="氏名（必須）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[160px] bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          <input
            type="tel"
            placeholder="電話番号（任意）"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="flex-1 min-w-[160px] bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </form>
      </div>

      {/* 登録済みスタッフ一覧 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-700">登録済みスタッフ一覧</h2>
        <div className="divide-y divide-gray-100">
          {staff.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              スタッフが登録されていません。上のフォームから登録してください。
            </div>
          ) : (
            staff.map((s) => {
              const isEditing = editingId === s.id;
              return (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                  {isEditing ? (
                    <div className="flex flex-1 flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 min-w-[120px] bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="flex-1 min-w-[120px] bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => saveEdit(s.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                        {s.phone && <span className="text-xs text-slate-400">{s.phone}</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-1.5 px-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          編集
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`「${s.name}」様を削除しますか？`)) {
                              onDeleteStaff(s.id);
                            }
                          }}
                          className="p-1.5 px-2.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          削除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
