import React, { useState } from "react";
import { Staff, Room, Shift, Assignment } from "../types";
import { Sparkles } from "lucide-react";
import { MonthCalendar } from "./MonthCalendar";
import { Modal } from "./Modal";

interface RoomAssignmentViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  staff: Staff[];
  rooms: Room[];
  shifts: Shift[];
  assignments: Assignment[];
  onAssignRoom: (date: string, roomNumber: string, staffId: string) => void;
  onRemoveAssignment: (date: string, roomNumber: string) => void;
  onUpdateRoomPrice: (roomNumber: string, price: number) => void;
  onBulkUpdatePrice: (date: string, price: number) => void;
  onUpdateAssignments: (assignments: Assignment[]) => void;
}

export const RoomAssignmentView: React.FC<RoomAssignmentViewProps> = ({
  selectedDate,
  setSelectedDate,
  staff,
  rooms,
  shifts,
  assignments,
  onAssignRoom,
  onRemoveAssignment,
  onUpdateRoomPrice,
  onBulkUpdatePrice,
  onUpdateAssignments,
}) => {
  const [monthDate, setMonthDate] = useState<string>(selectedDate);
  const [popupDate, setPopupDate] = useState<string | null>(null);
  const [bulkPriceInput, setBulkPriceInput] = useState("");

  const formatYen = (num: number) => `¥${num.toLocaleString("ja-JP")}`;

  const getWeekDayJP = (dateStr: string) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : days[d.getDay()];
  };

  const floors = [
    { label: "4F", roomNumbers: ["401", "402", "403", "405"] },
    { label: "3F", roomNumbers: ["301", "302", "303", "305"] },
    { label: "2F", roomNumbers: ["201", "202", "203", "205"] },
  ];

  const openDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setPopupDate(dateStr);
  };

  const handlePriceChange = (roomNo: string, priceStr: string) => {
    const num = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return;
    onUpdateRoomPrice(roomNo, num);
  };

  const handleBulkPriceApply = (date: string) => {
    const num = parseInt(bulkPriceInput.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return;
    onBulkUpdatePrice(date, num);
    setBulkPriceInput("");
  };

  const handleAutoAssign = (date: string, onDutyStaff: Staff[]) => {
    if (onDutyStaff.length === 0) {
      window.alert("この日の出勤スタッフがいません。「シフト作成」画面で出勤メンバーを登録してください。");
      return;
    }
    if (!window.confirm("出勤中のメンバーで全12室を均等に自動割り当てします。すでに入力済みの割当は上書きされますがよろしいですか？")) {
      return;
    }

    const updated = assignments.filter((a) => a.date !== date);
    rooms.forEach((room, index) => {
      const assignedStaff = onDutyStaff[index % onDutyStaff.length];
      updated.push({
        id: `A-${date}-${room.number}-${Date.now()}-${index}`,
        date,
        roomNumber: room.number,
        staffId: assignedStaff.id,
        appliedPrice: room.defaultPrice,
      });
    });
    onUpdateAssignments(updated);
  };

  // ポップアップ内で使うその日のデータ
  const popupShift = popupDate ? shifts.find((s) => s.date === popupDate) : undefined;
  const popupOnDutyStaff = popupDate ? staff.filter((s) => (popupShift?.staffIds || []).includes(s.id)) : [];
  const popupAssignments = popupDate ? assignments.filter((a) => a.date === popupDate) : [];

  return (
    <div className="space-y-6" id="room-assignment-view-root">
      {/* カレンダー */}
      <MonthCalendar
        monthDate={monthDate}
        onMonthChange={setMonthDate}
        onSelectDay={openDay}
        renderDayBadge={(dateStr) => {
          const dayAssignments = assignments.filter((a) => a.date === dateStr);
          if (dayAssignments.length === 0) return null;
          const total = dayAssignments.reduce((sum, a) => sum + a.appliedPrice, 0);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                {dayAssignments.length}/{rooms.length}部屋
              </span>
              <span className="text-[10px] font-bold text-slate-500">{formatYen(total)}</span>
            </div>
          );
        }}
      />

      {/* 日付ポップアップ: その日の部屋割当 */}
      {popupDate && (
        <Modal
          title={`${popupDate.replace(/-/g, "/")} (${getWeekDayJP(popupDate)}) の部屋割当`}
          onClose={() => setPopupDate(null)}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
                割当済み: {popupAssignments.length} / {rooms.length}部屋
              </span>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">
                合計: {formatYen(popupAssignments.reduce((sum, a) => sum + a.appliedPrice, 0))}
              </span>
            </div>

            {popupOnDutyStaff.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-sm">
                この日に出勤しているスタッフがいません。先に「シフト作成」画面で出勤メンバーを登録してください。
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                <p className="text-xs text-slate-500">本日出勤: {popupOnDutyStaff.map((s) => s.name).join("、")}</p>
                <button
                  onClick={() => handleAutoAssign(popupDate, popupOnDutyStaff)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  均等に自動割り当て
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 bg-indigo-50 rounded-2xl p-4">
              <span className="text-xs font-bold text-indigo-900 whitespace-nowrap">この日の単価を一括設定:</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">¥</span>
                <input
                  type="text"
                  value={bulkPriceInput}
                  onChange={(e) => setBulkPriceInput(e.target.value)}
                  placeholder="例: 1300"
                  className="w-24 bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => handleBulkPriceApply(popupDate)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer whitespace-nowrap"
              >
                全12部屋に適用
              </button>
              <span className="text-[11px] text-indigo-500">※ 今後の基準単価としても保存されます</span>
            </div>

            <div className="space-y-5">
              {floors.map((floor) => (
                <div key={floor.label} className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{floor.label}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {floor.roomNumbers.map((roomNo) => {
                      const roomObj = rooms.find((r) => r.number === roomNo) || { number: roomNo, defaultPrice: 1200 };
                      const assignment = popupAssignments.find((a) => a.roomNumber === roomNo);

                      return (
                        <div
                          key={roomNo}
                          className={`bg-white rounded-2xl border p-3.5 space-y-2.5 ${
                            assignment ? "border-indigo-200" : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-slate-800">{roomNo}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400">¥</span>
                              <input
                                type="text"
                                value={roomObj.defaultPrice}
                                onChange={(e) => handlePriceChange(roomNo, e.target.value)}
                                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-right text-xs font-semibold focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <select
                            value={assignment ? assignment.staffId : ""}
                            onChange={(e) => {
                              if (e.target.value === "") {
                                onRemoveAssignment(popupDate, roomNo);
                              } else {
                                onAssignRoom(popupDate, roomNo, e.target.value);
                              }
                            }}
                            className={`w-full text-sm p-2 rounded-lg border outline-none font-medium ${
                              assignment
                                ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            <option value="">-- 未割当 --</option>
                            {popupOnDutyStaff.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>

                          {assignment && (
                            <p className="text-[11px] text-slate-400 text-right">
                              適用単価: {formatYen(assignment.appliedPrice)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
