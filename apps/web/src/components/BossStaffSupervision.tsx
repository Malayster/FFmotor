import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Plus,
  Calendar,
  Sparkles,
  FileText,
  DollarSign,
  Activity,
  ArrowRight
} from "lucide-react";

interface StaffTask {
  id: string;
  timeDue: string;
  title: string;
  assignedTo: string;
  status: "completed" | "pending" | "overdue";
  kanbanStage?: "todo" | "in_progress" | "completed";
  priority?: "urgent" | "high" | "medium";
  completedAt?: string;
  category: "cashier" | "service" | "loan" | "inventory";
}

interface ActivityLog {
  id: string;
  time: string;
  staffName: string;
  action: string;
  type: "intake" | "pos" | "return" | "discount" | "catalog";
}

export const BossStaffSupervision: React.FC = () => {
  const [tasks, setTasks] = useState<StaffTask[]>([
    {
      id: "TSK-01",
      timeDue: "8:30 AM",
      title: "Kira & sahkan duit apungan awal laci (Floating Cash RM200)",
      assignedTo: "Aiman Hakimi (Kasir)",
      status: "completed",
      kanbanStage: "completed",
      priority: "medium",
      completedAt: "8:32 AM",
      category: "cashier",
    },
    {
      id: "TSK-02",
      timeDue: "10:00 AM",
      title: "Semak amaran stok minyak hitam & jana pesanan pembekal",
      assignedTo: "Siti Sarah (SA)",
      status: "completed",
      kanbanStage: "completed",
      priority: "high",
      completedAt: "9:55 AM",
      category: "inventory",
    },
    {
      id: "TSK-03",
      timeDue: "11:30 AM",
      title: "Follow-up WhatsApp 3 pelanggan sebut harga tertangguh semalam",
      assignedTo: "Siti Sarah (SA)",
      status: "completed",
      kanbanStage: "completed",
      priority: "medium",
      completedAt: "11:15 AM",
      category: "service",
    },
    {
      id: "TSK-04",
      timeDue: "2:30 PM",
      title: "Kemas kini status pinjaman Aeon Credit motor Yamaha NVX Encik Razif",
      assignedTo: "Siti Sarah (SA)",
      status: "overdue",
      kanbanStage: "in_progress",
      priority: "urgent",
      category: "loan",
    },
    {
      id: "TSK-05",
      timeDue: "4:30 PM",
      title: "Semak kualiti pandu uji & tekanan angin 8 motor siap sebelum serah kunci",
      assignedTo: "Sifu Halim (Foreman)",
      status: "completed",
      kanbanStage: "completed",
      priority: "high",
      completedAt: "4:20 PM",
      category: "service",
    },
    {
      id: "TSK-06",
      timeDue: "6:30 PM",
      title: "Tutup laci Z-Report harian & serah wang tunai peti besi",
      assignedTo: "Aiman Hakimi (Kasir)",
      status: "pending",
      kanbanStage: "todo",
      priority: "urgent",
      category: "cashier",
    },
  ]);

  const [logs] = useState<ActivityLog[]>([
    { id: "LOG-01", time: "02:10 PM", staffName: "Aiman Hakimi", action: "Merekod pulangan tukar saiz bearing RM 18.00 (Customer walk-in)", type: "return" },
    { id: "LOG-02", time: "01:45 PM", staffName: "Siti Sarah", action: "Kemaskini harga promo showroom Yamaha NVX 155 ke frontend katalog", type: "catalog" },
    { id: "LOG-03", time: "11:20 AM", staffName: "Aiman Hakimi", action: "Kutip bayaran siap servis Plat VJE 8821 (RM 145.00 DuitNow QR)", type: "pos" },
    { id: "LOG-04", time: "10:15 AM", staffName: "Siti Sarah", action: "Daftar masuk servis 12-titik diagnosis motor Plat VJE 8821 (Yamaha NVX)", type: "intake" },
    { id: "LOG-05", time: "08:32 AM", staffName: "Aiman Hakimi", action: "Buka syif pagi dengan floating cash RM 200.00", type: "pos" },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Siti Sarah (SA)");
  const [newTaskTime, setNewTaskTime] = useState("3:00 PM");
  const [newTaskPriority, setNewTaskPriority] = useState<"urgent" | "high" | "medium">("high");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const completedCount = tasks.filter((t) => t.status === "completed" || t.kanbanStage === "completed").length;
  const overdueCount = tasks.filter((t) => t.status === "overdue").length;
  const inProgressCount = tasks.filter((t) => t.kanbanStage === "in_progress").length;
  const todoCount = tasks.filter((t) => (t.status === "pending" || t.status === "overdue") && t.kanbanStage !== "in_progress" && t.kanbanStage !== "completed").length;
  const complianceRate = Math.round((completedCount / tasks.length) * 100);

  const moveTaskStage = (id: string, newStage: "todo" | "in_progress" | "completed") => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            kanbanStage: newStage,
            status: newStage === "completed" ? "completed" : t.status === "overdue" && newStage === "todo" ? "overdue" : "pending",
            completedAt: newStage === "completed" ? new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }) : undefined,
          };
        }
        return t;
      })
    );
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "completed" ? "pending" : "completed";
          return {
            ...t,
            status: nextStatus,
            kanbanStage: nextStatus === "completed" ? "completed" : "todo",
            completedAt: nextStatus === "completed" ? new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }) : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: StaffTask = {
      id: `TSK-0${tasks.length + 1}`,
      timeDue: newTaskTime,
      title: newTaskTitle.trim(),
      assignedTo: newTaskAssignee,
      status: "pending",
      kanbanStage: "todo",
      priority: newTaskPriority,
      category: "service",
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Penyeliaan Bos */}
      <div className="spike-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-zinc-900">Papan Penyeliaan & Audit Tugasan Staf</h2>
              <p className="text-xs text-zinc-400">
                Pantau sama ada kerani dan mekanik telah menyempurnakan SOP harian bengkel atau ada tugas yang tertunggak.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Kad Statistik Ringkas & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "kanban"
                  ? "spike-btn-red text-xs py-1.5 px-3"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              <span>⊞ Papan Kanban</span>
              <span className="text-[10px] opacity-75 font-mono">({tasks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "spike-btn-red text-xs py-1.5 px-3"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              <span>☰ Senarai Semak</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="bg-white px-3 py-2 rounded-xl border border-zinc-200 text-center">
              <span className="text-[10px] text-zinc-500 block">Jumlah Task</span>
              <span className="text-sm font-black ">{tasks.length}</span>
            </div>

            <div className="bg-white px-3 py-2 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-400 block font-bold">✓ Siap</span>
              <span className="text-sm font-black text-emerald-400">{completedCount}</span>
            </div>

            <div className="bg-white px-3 py-2 rounded-xl border border-red-500/30 text-center bg-red-600/5">
              <span className="text-[10px] text-red-400 block font-bold">⚠ Tertunggak</span>
              <span className="text-sm font-black text-red-500">{overdueCount}</span>
            </div>

            <div className="bg-white px-3 py-2 rounded-xl border border-red-500/30 text-center">
              <span className="text-[10px] text-red-400 block font-bold">Pematuhan</span>
              <span className="text-sm font-black ">{complianceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolum Kiri: Papan Kanban atau Senarai Semak (7 Kolum) */}
        <div className="lg:col-span-7 spike-card p-6 space-y-4 shadow-none">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h3 className="text-sm font-black ">
                {viewMode === "kanban" ? "Papan Kanban Tugasan Staf (BottleCRM Standard)" : "Senarai Semak Tugasan Staf (Checklist SOP)"}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {viewMode === "kanban" ? "Gerakkan tugasan mengikut fasa pelaksanaan kerja harian." : "Klik kotak untuk tandakan siap atau buka semula."}
              </p>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-600/10 px-2.5 py-1 rounded-full border border-red-500/20">
              Live Sync
            </span>
          </div>

          {viewMode === "kanban" ? (
            /* 3-Column Kanban Board */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Kolum 1: Akan Datang / To-Do */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-3 space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    <span className="text-xs font-bold text-zinc-200">Akan Datang</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                    {tasks.filter((t) => t.kanbanStage === "todo" || (!t.kanbanStage && t.status !== "completed")).length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
                  {tasks
                    .filter((t) => t.kanbanStage === "todo" || (!t.kanbanStage && t.status !== "completed"))
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-[#111114] border border-zinc-200 hover:border-red-600 transition space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                            task.priority === "urgent" || task.status === "overdue"
                              ? "bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse"
                              : task.priority === "high"
                              ? "bg-white/10 border border-white/20"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}>
                            {task.priority || "Medium"}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">{task.timeDue}</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-200 line-clamp-2">{task.title}</p>
                        <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200">
                          <span>{task.assignedTo.split(" ")[0]}</span>
                          <button
                            type="button"
                            onClick={() => moveTaskStage(task.id, "in_progress")}
                            className="spike-btn-red text-[10px] py-0.5 px-2 flex items-center gap-1 transition"
                          >
                            <span>Mula</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Kolum 2: Sedang Dijalankan / In-Progress */}
              <div className="bg-white rounded-2xl border border-red-500/40 p-3 space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-400">Sedang Dibuat</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-red-600/20 text-red-300 px-1.5 py-0.5 rounded">
                    {tasks.filter((t) => t.kanbanStage === "in_progress").length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
                  {tasks
                    .filter((t) => t.kanbanStage === "in_progress")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-[#111114] border border-red-500/40 hover:border-red-400 transition space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                            task.status === "overdue"
                              ? "bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse"
                              : "bg-red-600 text-white"
                          }`}>
                            {task.status === "overdue" ? "Tertunggak" : task.priority || "High"}
                          </span>
                          <span className="text-[10px] font-mono text-red-400">{task.timeDue}</span>
                        </div>
                        <p className="text-xs font-bold line-clamp-2">{task.title}</p>
                        <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200">
                          <span>{task.assignedTo.split(" ")[0]}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveTaskStage(task.id, "todo")}
                              className="text-zinc-400 hover:text-red-600 px-1.5 py-0.5 rounded text-[10px]"
                              title="Kembali ke To-Do"
                            >
                              ↩
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTaskStage(task.id, "completed")}
                              className="bg-zinc-950 hover:bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Siap</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((t) => t.kanbanStage === "in_progress").length === 0 && (
                    <div className="p-4 text-center text-[11px] text-zinc-500 border border-dashed border-zinc-200 rounded-xl">
                      Tiada task aktif sedang berjalan
                    </div>
                  )}
                </div>
              </div>

              {/* Kolum 3: Selesai / Completed */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-3 space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Selesai</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                    {tasks.filter((t) => t.kanbanStage === "completed" || t.status === "completed").length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
                  {tasks
                    .filter((t) => t.kanbanStage === "completed" || t.status === "completed")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-[#111114]/60 border border-zinc-200 space-y-2 opacity-80 hover:opacity-100 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{task.completedAt || "Siap"}</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">{task.timeDue}</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-400 line-through line-clamp-2">{task.title}</p>
                        <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200">
                          <span>{task.assignedTo.split(" ")[0]}</span>
                          <button
                            type="button"
                            onClick={() => moveTaskStage(task.id, "in_progress")}
                            className="text-zinc-400 hover:text-red-400 text-[10px] underline"
                          >
                            Buka Semula
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Traditional Checklist View */
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                    task.status === "completed"
                      ? "bg-white border-zinc-200 text-zinc-400"
                      : task.status === "overdue"
                      ? "bg-red-600/10 border-red-500/40 text-zinc-200"
                      : "bg-white border-zinc-200 text-zinc-200 hover:border-red-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : task.status === "overdue" ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold block ${
                            task.status === "completed" ? "line-through text-zinc-500" : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                          task.priority === "urgent" || task.status === "overdue"
                            ? "bg-red-600/20 text-red-400"
                            : task.priority === "high"
                            ? "bg-white/10 "
                            : "bg-zinc-800 text-zinc-300"
                        }`}>
                          {task.priority || "Medium"}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                        Tanggungjawab: {task.assignedTo} • Masa: {task.timeDue}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono ${
                        task.status === "completed"
                          ? "bg-emerald-50 text-emerald-400"
                          : task.status === "overdue"
                          ? "bg-red-600/20 text-red-400 font-black animate-pulse"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {task.status === "completed"
                        ? `Siap (${task.completedAt})`
                        : task.status === "overdue"
                        ? "Tertunggak!"
                        : "Menunggu"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Borang Tambah Task Baru Oleh Bos */}
          <form onSubmit={handleAddTask} className="pt-3 border-t border-zinc-200 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="+ Arahan task baharu untuk staf hari ini..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-[200px] bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="bg-white border border-zinc-200 rounded-xl px-2 py-2 text-xs focus:outline-none"
            >
              <option value="Siti Sarah (SA)">Siti Sarah (SA)</option>
              <option value="Aiman Hakimi (Kasir)">Aiman (Kasir)</option>
              <option value="Sifu Halim (Foreman)">Halim (Foreman)</option>
            </select>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="bg-white border border-zinc-200 rounded-xl px-2 py-2 text-xs text-red-400 focus:outline-none"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
            <input
              type="text"
              placeholder="Masa (cth: 3:00 PM)"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-24 bg-white border border-zinc-200 rounded-xl px-2 py-2 text-xs text-zinc-300 text-center font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="spike-btn-red text-xs py-2 px-3.5 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Task</span>
            </button>
          </form>
        </div>

        {/* Kolum Kanan: Log Jejak Audit Masa Nyata Staf (5 Kolum) */}
        <div className="lg:col-span-5 spike-card p-6 space-y-4 shadow-none">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-black ">Jejak Audit Aktiviti Staf (Live Log)</h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Hari Ini</span>
          </div>

          <p className="text-xs text-zinc-400">
            Audit automatik setiap tindakan penting (daftar motor, jualan POS, ubah harga katalog, pulangan barang):
          </p>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-white border border-zinc-200 text-xs space-y-1 hover:border-red-600/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold ">{log.staffName}</span>
                  <span className="font-mono text-[10px] text-zinc-400">{log.time}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{log.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

