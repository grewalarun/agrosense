import TopBar from "@/components/TopBar";
import { User, Bell, Shield, Palette, Globe, HelpCircle, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", desc: "Name, email, phone number", color: "bg-primary-100 text-primary-600" },
      { icon: Shield, label: "Security", desc: "Password and 2FA", color: "bg-blue-100 text-blue-600" },
    ],
  },
  {
    title: "App Preferences",
    items: [
      { icon: Bell, label: "Notifications", desc: "Alerts and reminders", color: "bg-accent-100 text-accent-700" },
      { icon: Palette, label: "Appearance", desc: "Theme and display", color: "bg-purple-100 text-purple-600" },
      { icon: Globe, label: "Language & Region", desc: "Hindi / English · Metric units", color: "bg-green-100 text-green-600" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & FAQ", desc: "Guides and tutorials", color: "bg-gray-100 text-gray-600" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div>
      <TopBar title="Settings" />
      <main className="p-4 lg:p-6 max-w-2xl">
        {/* Profile card */}
        <div className="card p-4 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            AG
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800">Arun Grewal</h2>
            <p className="text-sm text-gray-500">arun@grewalfarm.com</p>
            <p className="text-xs text-gray-400 mt-0.5">Farm Owner · Grewal Farm</p>
          </div>
          <button className="btn-secondary text-xs">Edit</button>
        </div>

        {/* Season selector */}
        <div className="card p-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-2">CURRENT SEASON</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <div>
                <p className="font-semibold text-gray-800">Rabi 2026–27</p>
                <p className="text-xs text-gray-500">Oct 2026 – Apr 2027</p>
              </div>
            </div>
            <button className="btn-secondary text-xs">Change</button>
          </div>
        </div>

        {SECTIONS.map(section => (
          <div key={section.title} className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">{section.title}</p>
            <div className="card overflow-hidden">
              {section.items.map((item, i) => (
                <button key={item.label}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${i > 0 ? "border-t border-gray-50" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color} flex-shrink-0`}>
                    <item.icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="card p-4 mt-4 border-red-100 bg-red-50">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Danger Zone</p>
          <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Delete Account</button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">AgroSense v1.0.0 · Made for Indian Farmers 🇮🇳</p>
      </main>
    </div>
  );
}
