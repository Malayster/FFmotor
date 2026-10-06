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
 * NOTA: videoProof template DIBUANG — tiada video proof dalam sistem.
 */
export const WhatsAppTemplates = {
  // Bila motor siap dibaiki — Foreman set status ke "ready"
  motorReady: (ownerName: string, plateNumber: string, grandTotal: number, passportUrl: string) =>
    `Salam ${ownerName}, motor anda *${plateNumber}* telah SIAP dibaiki dan diuji di *FFmotor*! 🏍️💨\n\n` +
    `Jumlah bayaran: *RM ${grandTotal.toFixed(2)}*\n` +
    `Waktu operasi: 9:00 pagi - 7:00 petang.\n\n` +
    `Rekod servis & Sijil Kesihatan Motor Digital anda boleh disemak di:\n${passportUrl}\n\n` +
    `Boleh datang ambil bila-bila masa. Terima kasih!`,

  // Kemaskini status servis semasa
  serviceUpdate: (ownerName: string, plateNumber: string, status: string) =>
    `Salam ${ownerName}, kemaskini terkini motor anda *${plateNumber}* di *FFmotor*:\n\n` +
    `Status semasa: *${status}*\n\n` +
    `Sebarang pertanyaan, sila hubungi kaunter kami. Terima kasih!`,

  // Makluman menunggu alat ganti
  waitingParts: (ownerName: string, plateNumber: string, partName: string) =>
    `Salam ${ownerName}, motor anda *${plateNumber}* di *FFmotor* memerlukan alat ganti tambahan.\n\n` +
    `Alat ganti: *${partName}*\n\n` +
    `Kami sedang menyemak stok. Kami akan maklumkan segera apabila siap untuk diteruskan. Terima kasih!`,

  // Peringatan ramalan mileage (Predictive Booking)
  predictiveReminder: (ownerName: string, model: string, plateNumber: string, component: string, dueDate: string) =>
    `Salam Bro ${ownerName}, mengikut kiraan purata perbatuan harian anda di *FFmotor*, komponen *${component.toUpperCase()}* bagi motor ${model} (${plateNumber}) dijangka sampai had servis sekitar *${dueDate}*.\n\n` +
    `Kami telah simpankan 1 unit stok original siap-siap di rak kami. Balas *BOOK* untuk tetapkan masa servis anda. Terima kasih!`,
};

