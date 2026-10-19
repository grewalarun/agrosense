import TopBar from "@/components/TopBar";
import { Plus, CalendarDays, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const TASKS = [
  { id: 1, title: "Apply NPK fertilizer to Field 2", crop: "Wheat", field: "Field 2", dueDate: "Oct 10, 2026", priority: "High", status: "Pending" },
  { id: 2, title: "Irrigation schedule – pump oil check", crop: "All", field: "All Fields", dueDate: "Oct 11, 2026", priority: "Medium", status: "Pending" },
  { id: 3, title: "Spray fungicide on Potato crop", crop: "Potato", field: "Field 1", dueDate: "Oct 12, 2026", priority: "High", status: "Pending" },
  { id: 4, title: "Weed control in Field 3", crop: "Sugarcane", field: "Field 3", dueDate: "Oct 15, 2026", priority: "Low", status: "Pending" },
  { id: 5, title: "Soil testing for Field 4", crop: "—", field: "Field 4", dueDate: "Oct 18, 2026", priority: "Medium", status: "Pending" },
  { id: 6, title: "Prepare Field 4 for Tomato sowing", crop: "Tomato", field: "Field 4", dueDate: "Dec 28, 2026", priority: "Medium", status: "Planned" },
  { id: 7, title: "Harvest Potato crop", crop: "Potato", field: "Field 1", dueDate: "Feb 15, 2027", priority: "High", status: "Planned" },
  { id: 8, title: "Market visit – check wheat MSP rates", crop: "Wheat", field: "—", dueDate: "Oct 9, 2026", priority: "Low", status: "Done" },
];

const PLAN_MONTHS = [
  { month: "Oct 2026", items: ["Fertilize Wheat (Field 2)", "Fungicide – Potato", "Irrigation maintenance"] },
  { month: "Nov 2026", items: ["Sow Wheat in remaining area", "Sugarcane earthing up", "Pest monitoring"] },
  { month: "Dec 2026", items: ["Prepare Field 4", "Irrigate Sugarcane", "Cold wave protection"] },
  { month: "Jan 2027", items: ["Plant Tomato (Field 4)", "Wheat top dressing", "Potato earthing up"] },
  { month: "Feb 2027", items: ["Harvest Potato (Field 1)", "Wheat harvesting prep"] },
  { month: "Mar 2027", items: ["Wheat harvest", "Sugarcane harvest", "Season close accounts"] },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-accent-100 text-accent-700",
  Low: "bg-gray-100 text-gray-600",
};

const statusIcon = (s: string) => {
  if (s === "Done") return <CheckCircle2 size={14} className="text-primary-600" />;
  if (s === "Pending") return <AlertCircle size={14} className="text-accent-600" />;
  return <Clock size={14} className="text-gray-400" />;
};

export default async function PlanningPage(_: { params: Promise<{ farmId: string }> }) {
  return (
    <div>
      <TopBar title="Planning" />
      <main className="p-4 lg:p-6 space-y-5">
        {/* Task List */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">Tasks & Reminders</h3>
              <span className="badge-yellow">{TASKS.filter(t => t.status === "Pending").length} pending</span>
            </div>
            <button className="btn-primary flex items-center gap-1.5 text-xs"><Plus size={13} /> Add Task</button>
          </div>

          <div className="space-y-2">
            {TASKS.map(task => (
              <div key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${task.status === "Done" ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"}`}>
                <div className="mt-0.5">{statusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${task.status === "Done" ? "line-through text-gray-400" : "text-gray-700"}`}>{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{task.field} · {task.crop}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${priorityColor[task.priority]}`}>{task.priority}</span>
                  <span className="text-xs text-gray-400">{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Season Calendar */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-primary-600" /> Season Calendar – Rabi 2026–27
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLAN_MONTHS.map(pm => (
              <div key={pm.month} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-primary-700 mb-2">{pm.month}</p>
                <ul className="space-y-1">
                  {pm.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="text-primary-500 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
