import CropPicker from "@/components/CropPicker";
import { getCycleRows } from "@/lib/api/cycles";
import { getTranslations } from "next-intl/server";
import { cropEmoji } from "@/lib/crops";
import { getFormatters } from "@/i18n/server";

export default async function AddSalePage(props: PageProps<"/farms/[farmId]/sales/add">) {
  const { farmId } = await props.params;
  const [{ cycles }, t, f] = await Promise.all([getCycleRows(farmId), getTranslations("sales"), getFormatters()]);
  // Sales come out of harvested stock, so only crops with unsold stock can be sold
  const withStock = cycles
    .filter(c => c.status !== "CLOSED" && c.field)
    .map(c => ({ cycle: c, remaining: Object.values(c.harvested).reduce((sum, h) => sum + h.remaining, 0) }))
    .filter(({ remaining }) => remaining > 0);

  return (
    <CropPicker
      title={t("pickTitle")}
      intro={t("pickIntro")}
      backHref={`/farms/${farmId}/sales`}
      items={withStock.map(({ cycle: c, remaining }) => ({
        href: `/farms/${farmId}/fields/${c.field!._id}/harvest?cycleId=${c.cycleId}&sell=1`,
        crop: f.crop(c.crop?.name ?? "Crop"),
        emoji: cropEmoji(c.crop?.name),
        field: c.field!.name,
        detail: t("pickDetail", { season: f.season(c.seasonType, c.seasonYear), qty: remaining, unit: f.unit(c.yieldUnit) }),
      }))}
      empty={t("pickEmpty")}
    />
  );
}
