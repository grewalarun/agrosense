import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { ChevronDown } from "lucide-react";

const STEPS = [
  { emoji: "🏡", title: "Add your farm", text: "Name, location and total area." },
  { emoji: "🗺️", title: "Add fields", text: "Each plot of land on the farm, with its own area unit." },
  { emoji: "🌱", title: "Plant a crop", text: "Pick a field, crop, season and sowing date." },
  { emoji: "💰", title: "Record expenses", text: "Seeds, fertilizer, labour… always against the crop they were for." },
  { emoji: "🌾", title: "Harvest & sell", text: "Record the harvest, then sell it in one go or in parts." },
  { emoji: "📊", title: "See your profit", text: "Reports show profit by crop, field and season." },
];

const FAQS = [
  {
    q: "How is the season year worked out?",
    a: "You choose Rabi, Kharif, Zaid or Annual, and the year comes from the sowing date. Rabi and Annual crops span two years (e.g. Rabi 2026-27); Kharif and Zaid use one year (e.g. Kharif 2026). A Rabi crop sown in January still belongs to the season that started the year before.",
  },
  {
    q: "Why does every expense need a crop?",
    a: "So profit can be worked out for each crop. Pick the crop the money was spent on when you add an expense. Costs shared by several crops, like a tractor repair, can be split and entered against each crop.",
  },
  {
    q: "What does “This is the final harvest” mean?",
    a: "Ticking it marks the crop as harvested and frees the field for the next crop. Untick it for crops you pick several times, such as vegetables or cotton — the crop stays active so you can record more pickings.",
  },
  {
    q: "Can I sell my harvest in parts?",
    a: "Yes. Each harvest becomes stock. Sell it in lots to different buyers on different dates — the app keeps track of what is still unsold and won't let you sell more than you harvested. Use “Sell stock” on the crop page or “Record Sale” on the Sales page.",
  },
  {
    q: "Why is my profit negative while the crop is growing?",
    a: "Profit is revenue minus expenses. Until you sell, a crop only has expenses, so it shows a loss. It turns positive as sales are recorded. Unsold stock is not counted as money until it is sold.",
  },
  {
    q: "What does “Close season” do?",
    a: "Once a crop is harvested and sold, closing it locks its expenses, harvests and sales so the numbers can't change by mistake. You can reopen it from the crop page if you need to correct something.",
  },
  {
    q: "How do I plant the next crop on a field?",
    a: "Record the final harvest of the current crop first — the field is then free. You can also add the next crop early; it is saved as “Planned” and you start it from its page when the field is ready.",
  },
  {
    q: "Why can't I delete some records?",
    a: "To keep your numbers correct: a harvest with sales can't be deleted (delete the sales first), a crop name used by a crop cycle can't be deleted, and records of a closed season are locked. Deleting a crop cycle removes its expenses, harvests and sales together.",
  },
  {
    q: "My fields use different area units. How are reports shown?",
    a: "Each field keeps its own unit (Acre, Hectare, Bigha or Kanal) and profit per area is shown in that unit. Farm or season totals only show profit per area when all the fields use the same unit.",
  },
  {
    q: "I changed my password. Why was I logged out on my phone?",
    a: "Changing your password signs out every other device for safety. Just log in again there with the new password. The device you changed it on stays logged in.",
  },
];

export default function HelpPage() {
  return (
    <div>
      <TopBar title="Help & FAQs" />
      <main className="p-4 lg:p-6 max-w-2xl space-y-6">
        <BackLink href="/settings" label="Back to Settings" />

        <section>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">How AgroSense works</h2>
          <ol className="grid sm:grid-cols-2 gap-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-lg flex-shrink-0">{s.emoji}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800"><span className="text-primary-600">{i + 1}.</span> {s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Frequently asked questions</h2>
          <div className="card divide-y divide-gray-100 overflow-hidden">
            {FAQS.map(f => (
              <details key={f.q} className="group">
                <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-medium text-gray-700">{f.q}</span>
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 -mt-1 text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
