import { useState, useEffect } from "react";
import { Staff, Room, Shift, Assignment } from "./types";
import { getInitialData } from "./data";
import { ShiftView } from "./components/ShiftView";
import { RoomAssignmentView } from "./components/RoomAssignmentView";
import { SummaryView } from "./components/SummaryView";
import { CalendarDays, Layers, TrendingUp, Building, RotateCcw } from "lucide-react";

const getTodayStr = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

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

  // Load state on mount
  useEffect(() => {
    const localStaff = localStorage.getItem("clean_system_staff");
    const localRooms = localStorage.getItem("clean_system_rooms");
    const localShifts = localStorage.getItem("clean_system_shifts");
    const localAssignments = localStorage.getItem("clean_system_assignments");

    if (localStaff && localRooms && localShifts && localAssignments) {
      setStaff(JSON.parse(localStaff));
      setRooms(JSON.parse(localRooms));
      setShifts(JSON.parse(localShifts));
      setAssignments(JSON.parse(localAssignments));
    } else {
      const seed = getInitialData();
      setStaff(seed.staff);
      setRooms(seed.rooms);
      setShifts(seed.shifts);
      setAssignments(seed.assignments);

      localStorage.setItem("clean_system_staff", JSON.stringify(seed.staff));
      localStorage.setItem("clean_system_rooms", JSON.stringify(seed.rooms));
      localStorage.setItem("clean_system_shifts", JSON.stringify(seed.shifts));
      localStorage.setItem("clean_system_assignments", JSON.stringify(seed.assignments));
    }
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

  const resetAllData = () => {
    if (window.confirm("スタッフ・シフト・部屋割当のすべてのデータを削除して、空の状態に戻しますか？この操作は取り消せません。")) {
      const seed = getInitialData();
      saveStaff(seed.staff);
      saveRooms(seed.rooms);
      saveShifts(seed.shifts);
      saveAssignments(seed.assignments);
      setSelectedDate(getTodayStr());
      showToast("データをすべてリセットしました。");
    }
  };

  const handleToggleShift = (date: string, staffId: string) => {
    let updatedShifts = [...shifts];
    const shiftIndex = updatedShifts.findIndex((s) => s.date === date);

    if (shiftIndex >= 0) {
      const shiftObj = updatedShifts[shiftIndex];
      let updatedStaffIds = [...shiftObj.staffIds];

      if (updatedStaffIds.includes(staffId)) {
        const hasActiveAssignments = assignments.some((a) => a.date === date && a.staffId === staffId);
        if (hasActiveAssignments) {
          const cleanedAssignments = assignments.filter((a) => !(a.date === date && a.staffId === staffId));
          saveAssignments(cleanedAssignments);
        }
        updatedStaffIds = updatedStaffIds.filter((id) => id !== staffId);
      } else {
        updatedStaffIds.push(staffId);
      }

      updatedShifts[shiftIndex] = { ...shiftObj, staffIds: updatedStaffIds };
    } else {
      updatedShifts.push({ date, staffIds: [staffId] });
    }

    saveShifts(updatedShifts);
    showToast("出勤（シフト）設定を保存しました。");
  };

  const handleAssignRoom = (date: string, roomNo: string, staffId: string) => {
    const roomObj = rooms.find((r) => r.number === roomNo);
    const appliedPrice = roomObj ? roomObj.defaultPrice : 1200;

    let updatedAssignments = [...assignments];
    const existingIndex = updatedAssignments.findIndex((a) => a.date === date && a.roomNumber === roomNo);

    if (existingIndex >= 0) {
      updatedAssignments[existingIndex] = { ...updatedAssignments[existingIndex], staffId, appliedPrice };
    } else {
      updatedAssignments.push({
        id: `A-${date}-${roomNo}-${Date.now()}`,
        date,
        roomNumber: roomNo,
        staffId,
        appliedPrice,
      });
    }

    saveAssignments(updatedAssignments);
    const cleanerName = staff.find((s) => s.id === staffId)?.name || "スタッフ";
    showToast(`${roomNo}号室に ${cleanerName} 様を割り当てました（単価 ${appliedPrice.toLocaleString()}円 適用）`);
  };

  const handleRemoveAssignment = (date: string, roomNo: string) => {
    const updated = assignments.filter((a) => !(a.date === date && a.roomNumber === roomNo));
    saveAssignments(updated);
    showToast(`${roomNo}号室の清掃割り当てを解除しました。`);
  };

  const handleAddStaff = (name: string, phone: string) => {
    const nextNum = staff.length > 0 ? Math.max(...staff.map((s) => parseInt(s.id.substring(1) || "0", 10))) + 1 : 1;
    const nextId = `S${String(nextNum).padStart(2, "0")}`;
    saveStaff([...staff, { id: nextId, name, phone }]);
    showToast(`清掃員「${name}」様を新しく登録しました。`);
  };

  const handleUpdateStaff = (id: string, name: string, phone: string) => {
    const updated = staff.map((s) => (s.id === id ? { ...s, name, phone } : s));
    saveStaff(updated);
    showToast(`スタッフ「${name}」様の情報を更新しました。`);
  };

  const handleDeleteStaff = (id: string) => {
    saveStaff(staff.filter((s) => s.id !== id));
    saveShifts(shifts.map((s) => ({ ...s, staffIds: s.staffIds.filter((sid) => sid !== id) })));
    showToast("スタッフ情報を削除しました。");
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
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans flex flex-col" id="app-root-workflow">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-slate-800">ホテル清掃シフト管理</span>
            </div>

            <nav className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("shift")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg cursor-pointer ${
                  activeTab === "shift" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                シフト作成
              </button>
              <button
                onClick={() => setActiveTab("assign")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg cursor-pointer ${
                  activeTab === "assign" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-4 h-4" />
                部屋割当
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg cursor-pointer ${
                  activeTab === "summary" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                集計
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-55 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 max-w-md text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{toastMessage}</span>
          </div>
        )}

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

      {/* フッター */}
      <footer className="bg-white border-t border-slate-100 py-5 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ホテル清掃シフト管理システム</p>
          <button
            onClick={resetAllData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-400 font-bold rounded-lg text-[11px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            全データをリセットする
          </button>
        </div>
      </footer>
    </div>
  );
}
