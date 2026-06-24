import React, { useState } from "react";
import { Staff, Shift } from "../types";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Check } from "lucide-react";

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

export const ShiftView: React.FC<ShiftViewProps> = ({
  selectedDate,
  staff,
  shifts,
  onToggleShift,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [monthDate, setMonthDate] = useState<string>(selectedDate);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

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
    setMonthDate(formatDate(date));
  };

  const monthDays = (() => {
    const baseDate = new Date(monthDate);
    if (isNaN(baseDate.getTime())) return [];
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const days: string[] = [];
    for (let i = 1; i <= lastDay; i++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(i).padStart(2, "0");
      days.push(`${year}-${mm}-${dd}`);
    }
    return days;
  })();

  const isWorkingOn = (dateStr: string, staffId: string) =>
    shifts.find((s) => s.date === dateStr)?.staffIds.includes(staffId) || false;

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
    <div className="space-y-6" id="shift-view-root">
      {/* 出勤管理表（縦：スタッフ／横：日付） */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-700">
            {targetYear}年 {targetMonth}月 の出勤表
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthDate(todayStr)}
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

        <p className="px-4 pt-3 text-xs text-slate-400">
          各セルをクリックすると「出勤」「休み」を切り替えられます。
        </p>

        <div className="overflow-x-auto">
          <table className="border-collapse text-center">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-500 font-bold">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2 text-left min-w-[140px] border-r border-slate-200">
                  スタッフ名
                </th>
                {monthDays.map((d) => {
                  const dayNum = d.split("-")[2];
                  const weekday = new Date(d).getDay();
                  const isToday = d === todayStr;
                  return (
                    <th key={d} className="px-1 py-2 min-w-[52px] border-l border-slate-100">
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
                      <div className="text-[9px] text-slate-400 mt-0.5">{dayNames[weekday]}</div>
                    </th>
                  );
                })}
                <th className="px-3 py-2 min-w-[80px] border-l border-slate-200">出勤日数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={monthDays.length + 2} className="py-10 text-center text-sm text-slate-400">
                    スタッフが登録されていません。下のフォームから登録してください。
                  </td>
                </tr>
              ) : (
                staff.map((s) => {
                  const totalDays = monthDays.filter((d) => isWorkingOn(d, s.id)).length;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="sticky left-0 z-10 bg-white px-4 py-2 text-left font-bold text-sm text-slate-800 border-r border-slate-100">
                        {s.name}
                      </td>
                      {monthDays.map((d) => {
                        const isWorking = isWorkingOn(d, s.id);
                        return (
                          <td key={d} className="p-1 border-l border-slate-100">
                            <button
                              onClick={() => onToggleShift(d, s.id)}
                              className={`w-full py-2 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                isWorking
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-50 text-slate-300 border border-slate-150 hover:bg-slate-100"
                              }`}
                            >
                              {isWorking ? "出勤" : "休み"}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 font-bold text-sm text-indigo-700 border-l border-slate-200">
                        {totalDays}日
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {staff.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="sticky left-0 z-10 bg-slate-50 px-4 py-2 text-left text-[11px] font-bold text-slate-500 border-r border-slate-200">
                    出勤人数
                  </td>
                  {monthDays.map((d) => {
                    const count = shifts.find((s) => s.date === d)?.staffIds.length || 0;
                    return (
                      <td key={d} className="px-1 py-2 text-[11px] font-bold text-slate-600 border-l border-slate-100">
                        {count}
                      </td>
                    );
                  })}
                  <td className="border-l border-slate-200"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* スタッフ新規登録 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-700">スタッフを新しく登録する</h2>
        <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="氏名（必須）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[160px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            required
          />
          <input
            type="tel"
            placeholder="電話番号（任意）"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="flex-1 min-w-[160px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </form>
      </div>

      {/* スタッフ一覧（管理） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-700">登録済みスタッフ一覧</h2>
        <div className="divide-y divide-slate-100">
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
                        className="flex-1 min-w-[120px] bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="flex-1 min-w-[120px] bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => saveEdit(s.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-800">{s.name}</span>
                        {s.phone && <span className="text-xs text-slate-400">{s.phone}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-1.5 px-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          編集
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`${s.name}様を削除しますか？`)) {
                              onDeleteStaff(s.id);
                            }
                          }}
                          className="p-1.5 px-2.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
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
