import React, { useState } from "react";
import { Staff, Shift } from "../types";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { MonthCalendar } from "./MonthCalendar";
import { Modal } from "./Modal";

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
  setSelectedDate,
  staff,
  shifts,
  onToggleShift,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [monthDate, setMonthDate] = useState<string>(selectedDate);
  const [popupDate, setPopupDate] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const getWeekDayJP = (dateStr: string) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : days[d.getDay()];
  };

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

  const openDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setPopupDate(dateStr);
  };

  const popupOnDutyIds = popupDate ? shifts.find((s) => s.date === popupDate)?.staffIds || [] : [];

  return (
    <div className="space-y-6" id="shift-view-root">
      {/* カレンダー */}
      <MonthCalendar
        monthDate={monthDate}
        onMonthChange={setMonthDate}
        onSelectDay={openDay}
        renderDayBadge={(dateStr) => {
          const count = shifts.find((s) => s.date === dateStr)?.staffIds.length || 0;
          return count > 0 ? (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              出勤 {count}名
            </span>
          ) : null;
        }}
      />

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

      {/* 日付ポップアップ: その日の出勤チェック */}
      {popupDate && (
        <Modal
          title={`${popupDate.replace(/-/g, "/")} (${getWeekDayJP(popupDate)}) の出勤設定`}
          onClose={() => setPopupDate(null)}
        >
          <p className="text-xs text-slate-400 mb-4">
            チェックを入れた人がこの日に出勤します。チェックした人だけが「部屋割当」画面で選べます。
          </p>
          <div className="divide-y divide-slate-100">
            {staff.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">スタッフが登録されていません。</div>
            ) : (
              staff.map((s) => {
                const isWorking = popupOnDutyIds.includes(s.id);
                return (
                  <label key={s.id} className="py-3 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWorking}
                      onChange={() => onToggleShift(popupDate, s.id)}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-800">{s.name}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isWorking ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isWorking ? "出勤" : "休み"}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
