import Link from "next/link";
import CropPicker from "@/components/CropPicker";
import { getCycleRows } from "@/lib/api/cycles";
import { getTranslations } from "next-intl/server";
import { cropEmoji } from "@/lib/crops";
import { getFormatters } from "@/i18n/server";

export default async function AddHarvestPage(props: PageProps<"/farms/[farmId]/harvests/add">) {
  const { farmId } = await props.params;
  const [{ cycles }, t, f] = await Promise.all([getCycleRows(farmId), getTranslations("harvests"), getFormatters()]);
  const growing = cycles.filter(c => c.status === "ACTIVE" && c.field);

  return (
    <CropPicker
      title={t("pickTitle")}
      intro={t("pickIntro")}
      backHref={`/farms/${farmId}/harvests`}
      items={growing.map(c => ({
        href: `/farms/${farmId}/fields/${c.field!._id}/harvest?cycleId=${c.cycleId}`,
        crop: f.crop(c.crop?.name ?? "Crop"),
        emoji: cropEmoji(c.crop?.name),
        field: c.field!.name,
        detail: t("pickDetail", { season: f.season(c.seasonType, c.seasonYear), date: f.date(c.startDate) })
          + (c.actualYield > 0 ? t("pickSoFar", { qty: c.actualYield, unit: f.unit(c.yieldUnit) }) : ""),
      }))}
      empty={t.rich("pickEmpty", { link: chunks => <Link href={`/farms/${farmId}/crop-cycles/add`} className="text-primary-600 underline">{chunks}</Link> })}
    />
  );
}
