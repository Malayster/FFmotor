import { DbClient } from "@ffmotor/db";
import { vehicles, predictiveBookings, products } from "@ffmotor/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function runPredictiveMileageCron(db: DbClient) {
  console.log("[CRON] Menjalankan enjin ramalan mileage & tempahan alat ganti berkala...");

  const allVehicles = await db.select().from(vehicles).all();
  const allProducts = await db.select().from(products).all();

  const now = new Date();

  for (const veh of allVehicles) {
    const dailyKm = veh.dailyKmAvg || 35.0;
    const currentKm = veh.currentMileage || 0;

    // Check 1: Belting CVT (setiap 20,000 km pada motor auto/scooter)
    if (veh.model.toLowerCase().includes("nvx") || veh.model.toLowerCase().includes("vario") || veh.model.toLowerCase().includes("adv")) {
      const nextBeltKm = Math.ceil(currentKm / 20000) * 20000;
      const kmRemaining = nextBeltKm - currentKm;

      if (kmRemaining > 0 && kmRemaining <= 2500) {
        // Ramal tarikh tiba
        const daysToDue = Math.round(kmRemaining / dailyKm);
        const predictedDate = new Date(now.getTime() + daysToDue * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // Cari part belt yang sepadan
        const beltProduct = allProducts.find(p => p.category === "Belt CVT" || p.name.toLowerCase().includes("belt"));

        // Semak jika ramalan ini sudah wujud
        const existing = await db
          .select()
          .from(predictiveBookings)
          .where(eq(predictiveBookings.vehicleId, veh.id))
          .all();

        const alreadyExists = existing.some(e => e.componentType === "belting_cvt" && e.estimatedMileageDue === nextBeltKm);

        if (!alreadyExists) {
          await db.insert(predictiveBookings).values({
            id: `pred_${nanoid(8)}`,
            vehicleId: veh.id,
            componentType: "belting_cvt",
            estimatedMileageDue: nextBeltKm,
            predictedServiceDate: predictedDate,
            reservedProductId: beltProduct ? beltProduct.id : null,
            status: "part_reserved",
            whatsappMessageContent: `Salam Bro ${veh.ownerName}, mengikut rekod perbatuan harian anda, belting ${veh.model} (${veh.plateNumber}) dijangka sampai had 20,000 km pada sekitar ${predictedDate}. Kami telah simpankan 1 unit Belt Original. Balas 'BOOK' untuk tetapkan slot servis.`,
            createdAt: now.toISOString(),
          });
          console.log(`[CRON] Auto-reserve belting untuk ${veh.plateNumber} pada ${predictedDate}`);
        }
      }
    }
  }

  return { success: true, processedCount: allVehicles.length };
}

