import { useState, useEffect } from "react";
import { Staff, Room, Shift, Assignment } from "./types";
import { getInitialData } from "./data";
import { ShiftView } from "./components/ShiftView";
import { RoomAssignmentView } from "./components/RoomAssignmentView";
import { SummaryView } from "./components/SummaryView";
import { CalendarDays, Layers, TrendingUp } from "lucide-react";

const getTodayStr = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const getOneYearAgoCutoff = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const TABS = [
  { id: "shift" as const, label: "シフト作成", icon: CalendarDays },
  { id: "assign" as const, label: "部屋割当", icon: Layers },
  { id: "summary" as const, label: "集計", icon: TrendingUp },
];

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<"shift" | "assign" | "summary">("shift");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  useEffect(() => {
    const localStaff = localStorage.getItem("clean_system_staff");
    const localRooms = localStorage.getItem("clean_system_rooms");
    const localShifts = localStorage.getItem("clean_system_shifts");
    const localAssignments = localStorage.getItem("clean_system_assignments");

    let loadedStaff: Staff[];
    let loadedRooms: Room[];
    let loadedShifts: Shift[];
    let loadedAssignments: Assignment[];

    if (localStaff && localRooms && localShifts && localAssignments) {
      loadedStaff = JSON.parse(localStaff);
      loadedRooms = JSON.parse(localRooms);
      loadedShifts = JSON.parse(localShifts);
      loadedAssignments = JSON.parse(localAssignments);
    } else {
      const seed = getInitialData();
      loadedStaff = seed.staff;
      loadedRooms = seed.rooms;
      loadedShifts = seed.shifts;
      loadedAssignments = seed.assignments;
      localStorage.setItem("clean_system_staff", JSON.stringify(loadedStaff));
      localStorage.setItem("clean_system_rooms", JSON.stringify(loadedRooms));
      localStorage.setItem("clean_system_shifts", JSON.stringify(loadedShifts));
      localStorage.setItem("clean_system_assignments", JSON.stringify(loadedAssignments));
    }

    // 1年以上前のシフト・割当を自動削除
    const cutoff = getOneYearAgoCutoff();
    const prunedShifts = loadedShifts.filter((s) => s.date >= cutoff);
    const prunedAssignments = loadedAssignments.filter((a) => a.date >= cutoff);

    if (prunedShifts.length !== loadedShifts.length) {
      localStorage.setItem("clean_system_shifts", JSON.stringify(prunedShifts));
    }
    if (prunedAssignments.length !== loadedAssignments.length) {
      localStorage.setItem("clean_system_assignments", JSON.stringify(prunedAssignments));
    }

    setStaff(loadedStaff);
    setRooms(loadedRooms);
    setShifts(prunedShifts);
    setAssignments(prunedAssignments);
  }, []);

  const saveStaff = (updated: Staff[]) => {
    setStaff(updated);
    localStorage.setItem("clean_system_staff", JSON.stringify(updated));
  };

  const saveRooms = (updated: Room[]) => {
    setRooms(updated);
    localStorage.setItem("clean_system_rooms", JSON.stringify(updated));
  };

  const saveShifts = (updated: Shift[]) => {
    setShifts(updated);
    localStorage.setItem("clean_system_shifts", JSON.stringify(updated));
  };

  const saveAssignments = (updated: Assignment[]) => {
    setAssignments(updated);
    localStorage.setItem("clean_system_assignments", JSON.stringify(updated));
  };

  const handleToggleShift = (date: string, staffId: string) => {
    const updatedShifts = [...shifts];
    const idx = updatedShifts.findIndex((s) => s.date === date);

    if (idx >= 0) {
      const shiftObj = updatedShifts[idx];
      let ids = [...shiftObj.staffIds];

      if (ids.includes(staffId)) {
        // シフト解除時、その日のその人の割当も削除
        const cleaned = assignments.filter((a) => !(a.date === date && a.staffId === staffId));
        if (cleaned.length !== assignments.length) saveAssignments(cleaned);
        ids = ids.filter((id) => id !== staffId);
      } else {
        ids.push(staffId);
      }
      updatedShifts[idx] = { ...shiftObj, staffIds: ids };
    } else {
      updatedShifts.push({ date, staffIds: [staffId] });
    }

    saveShifts(updatedShifts);
    showToast("シフトを保存しました。");
  };

  const handleAssignRoom = (date: string, roomNo: string, staffId: string) => {
    const roomObj = rooms.find((r) => r.number === roomNo);
    const appliedPrice = roomObj ? roomObj.defaultPrice : 1200;
    const updated = [...assignments];
    const existingIdx = updated.findIndex((a) => a.date === date && a.roomNumber === roomNo);

    if (existingIdx >= 0) {
      updated[existingIdx] = { ...updated[existingIdx], staffId, appliedPrice };
    } else {
      updated.push({ id: `A-${date}-${roomNo}-${Date.now()}`, date, roomNumber: roomNo, staffId, appliedPrice });
    }

    saveAssignments(updated);
    const name = staff.find((s) => s.id === staffId)?.name ?? "スタッフ";
    showToast(`${roomNo}号室に ${name} 様を割り当てました（¥${appliedPrice.toLocaleString()}）`);
  };

  const handleRemoveAssignment = (date: string, roomNo: string) => {
    saveAssignments(assignments.filter((a) => !(a.date === date && a.roomNumber === roomNo)));
    showToast(`${roomNo}号室の割り当てを解除しました。`);
  };

  const handleAddStaff = (name: string, phone: string) => {
    const maxNum = staff.length > 0
      ? Math.max(...staff.map((s) => parseInt(s.id.replace(/\D/g, "") || "0", 10)))
      : 0;
    const nextId = `S${String(maxNum + 1).padStart(2, "0")}`;
    saveStaff([...staff, { id: nextId, name, phone }]);
    showToast(`「${name}」様を登録しました。`);
  };

  const handleUpdateStaff = (id: string, name: string, phone: string) => {
    saveStaff(staff.map((s) => (s.id === id ? { ...s, name, phone } : s)));
    showToast(`「${name}」様の情報を更新しました。`);
  };

  const handleDeleteStaff = (id: string) => {
    saveStaff(staff.filter((s) => s.id !== id));
    saveShifts(shifts.map((s) => ({ ...s, staffIds: s.staffIds.filter((sid) => sid !== id) })));
    showToast("スタッフを削除しました。");
  };

  const handleUpdateRoomPrice = (roomNumber: string, price: number) => {
    saveRooms(rooms.map((r) => (r.number === roomNumber ? { ...r, defaultPrice: price } : r)));
  };

  const handleBulkUpdatePrice = (date: string, price: number) => {
    saveRooms(rooms.map((r) => ({ ...r, defaultPrice: price })));
    saveAssignments(assignments.map((a) => (a.date === date ? { ...a, appliedPrice: price } : a)));
    showToast(`単価を ¥${price.toLocaleString()} に一括設定しました。`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <span className="text-base font-bold tracking-tight text-slate-800">
              <span className="text-indigo-600">清掃</span>シフト管理
            </span>
            <nav className="flex items-center gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "shift" && (
          <ShiftView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            staff={staff}
            shifts={shifts}
            onToggleShift={handleToggleShift}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
          />
        )}
        {activeTab === "assign" && (
          <RoomAssignmentView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            staff={staff}
            rooms={rooms}
            shifts={shifts}
            assignments={assignments}
            onAssignRoom={handleAssignRoom}
            onRemoveAssignment={handleRemoveAssignment}
            onUpdateRoomPrice={handleUpdateRoomPrice}
            onBulkUpdatePrice={handleBulkUpdatePrice}
            onUpdateAssignments={saveAssignments}
          />
        )}
        {activeTab === "summary" && (
          <SummaryView selectedDate={selectedDate} staff={staff} assignments={assignments} />
        )}
      </main>

      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold pointer-events-none whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* フッター */}
      <footer className="border-t border-gray-100 py-4 text-center text-xs text-slate-400">
        © 2026 ホテル清掃シフト管理システム
      </footer>
    </div>
  );
}
