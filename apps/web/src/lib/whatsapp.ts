/**
 * Format nombor telefon Malaysia ke format antarabangsa (cth: 0123456789 -> 60123456789)
 */
export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "6" + cleaned;
  } else if (!cleaned.startsWith("60") && cleaned.length >= 9) {
    cleaned = "60" + cleaned;
  }
  return cleaned;
}

/**
 * Jana pautan WhatsApp wa.me dengan teks mesej yang telah disiapkan
 */
export function createWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Templat mesej WhatsApp bengkel FFmotor
 */
export const WhatsAppTemplates = {
  // Bila video bukti 5s dimuat naik
  videoProof: (ownerName: string, plateNumber: string, grandTotal: number, trackUrl: string) =>
    `Salam ${ownerName}, mekanik kami di *FFmotor* telah memeriksa motor anda (${plateNumber}).\n\n` +
    `Kami telah merakam video bukti kerosakan (5-10s) untuk rujukan anda. Anggaran kos alat ganti: RM ${grandTotal.toFixed(2)}.\n\n` +
    `Sila tonton video dan luluskan penukaran di pautan ini:\n${trackUrl}\n\n` +
    `Terima kasih! - FFmotor Workshop`,

  // Bila motor siap dibaiki
  motorReady: (ownerName: string, plateNumber: string, grandTotal: number, passportUrl: string) =>
    `Salam ${ownerName}, motor anda *${plateNumber}* telah SIAP dibaiki dan diuji di *FFmotor*! 🏍️💨\n\n` +
    `Jumlah bayaran: *RM ${grandTotal.toFixed(2)}*\n` +
    `Waktu operasi: 9:00 pagi - 7:00 petang.\n\n` +
    `Rekod servis & Sijil Kesihatan Motor Digital anda boleh disemak di:\n${passportUrl}\n\n` +
    `Boleh datang ambil bila-bila masa. Terima kasih!`,

  // Peringatan ramalan mileage (Predictive Booking)
  predictiveReminder: (ownerName: string, model: string, plateNumber: string, component: string, dueDate: string) =>
    `Salam Bro ${ownerName}, mengikut kiraan purata perbatuan harian anda di *FFmotor*, komponen *${component.toUpperCase()}* bagi motor ${model} (${plateNumber}) dijangka sampai had servis sekitar *${dueDate}*.\n\n` +
    `Kami telah simpankan 1 unit stok original siap-siap di rak kami. Balas *BOOK* untuk tetapkan masa servis anda. Terima kasih!`,
};
