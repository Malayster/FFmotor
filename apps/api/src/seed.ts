import { DbClient } from "@ffmotor/db";
import { users, vehicles, products, productSerials, workOrders, workOrderItems, motorcycles, leads, predictiveBookings } from "@ffmotor/db";

export async function seedInitialData(db: DbClient) {
  const existingUsers = await db.select().from(users).all();
  if (existingUsers.length > 0) return;

  const now = new Date().toISOString();

  // 1. Staf
  await db.insert(users).values([
    {
      id: "usr_admin",
      name: "Tuan Farid (Owner/Admin)",
      email: "admin@ffmotor.my",
      passwordHash: "password123",
      role: "admin",
      phone: "0123456789",
      isActive: true,
      createdAt: now,
    },
    {
      id: "usr_mech1",
      name: "Abang Din (Ketua Mekanik)",
      email: "din@ffmotor.my",
      passwordHash: "password123",
      role: "mechanic",
      phone: "0139876543",
      isActive: true,
      createdAt: now,
    },
    {
      id: "usr_cashier",
      name: "Siti (Kaunter & POS)",
      email: "siti@ffmotor.my",
      passwordHash: "password123",
      role: "cashier",
      phone: "0172233445",
      isActive: true,
      createdAt: now,
    },
    {
      id: "usr_sales",
      name: "Zack (Penasihat Jualan)",
      email: "zack@ffmotor.my",
      passwordHash: "password123",
      role: "sales",
      phone: "0194455667",
      isActive: true,
      createdAt: now,
    },
  ]);

  // 2. Inventori Alat Ganti & Rak
  await db.insert(products).values([
    {
      id: "prod_oil_yamalube",
      sku: "OIL-YAM-4T",
      barcode: "95551234001",
      name: "Minyak Enjin Yamalube 4T Semi-Synthetic 10W-40 (1L)",
      category: "Minyak",
      brand: "Yamalube",
      costPrice: 24.0,
      sellingPrice: 38.0,
      stockQty: 48,
      minAlertQty: 10,
      rackLocation: "RAK-A1 (Minyak)",
      isHighValue: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_belt_nvx",
      sku: "BLT-NVX-ORI",
      barcode: "95551234002",
      name: "V-Belt CVT Yamaha NVX 155 Original HLY",
      category: "Belt CVT",
      brand: "Yamaha Genuine",
      costPrice: 65.0,
      sellingPrice: 95.0,
      stockQty: 8,
      minAlertQty: 3,
      rackLocation: "RAK-B2 (Transmisi)",
      isHighValue: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_brake_pad_front",
      sku: "BRK-PAD-RSX",
      barcode: "95551234003",
      name: "Brake Pad Hadapan Honda RS-X / RS150R Original",
      category: "Brake",
      brand: "Nissin / Honda",
      costPrice: 22.0,
      sellingPrice: 42.0,
      stockQty: 15,
      minAlertQty: 5,
      rackLocation: "RAK-C1 (Brek)",
      isHighValue: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_chain_did",
      sku: "CHN-DID-428",
      barcode: "95551234004",
      name: "Rantai & Sprocket D.I.D 428HD Gold (Heavy Duty)",
      category: "Rantai & Sprocket",
      brand: "D.I.D Japan",
      costPrice: 85.0,
      sellingPrice: 135.0,
      stockQty: 6,
      minAlertQty: 2,
      rackLocation: "RAK-D3 (Rantai)",
      isHighValue: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 3. Kod Siri Keaslian Part (Product Serials)
  await db.insert(productSerials).values([
    {
      id: "ser_yam_001",
      productId: "prod_oil_yamalube",
      serialNumber: "YAM-2026-987621",
      batchNo: "BATCH-2026-A",
      supplierName: "Hong Leong Yamaha Parts Hub",
      status: "installed",
      scannedCount: 2,
      lastScannedAt: now,
      installedWorkOrderId: "wo_sample_1",
      createdAt: now,
    },
    {
      id: "ser_belt_001",
      productId: "prod_belt_nvx",
      serialNumber: "BLT-NVX-ORI-88992",
      batchNo: "BATCH-2026-B",
      supplierName: "Hong Leong Yamaha Authorized Dealer",
      status: "in_stock",
      scannedCount: 0,
      createdAt: now,
    },
    {
      id: "ser_did_001",
      productId: "prod_chain_did",
      serialNumber: "DID-JPN-7733190",
      batchNo: "BATCH-JPN-44",
      supplierName: "D.I.D Malaysia Official Distributor",
      status: "in_stock",
      scannedCount: 1,
      lastScannedAt: now,
      createdAt: now,
    },
  ]);

  // 4. Kenderaan (Digital Passport Enabled)
  await db.insert(vehicles).values([
    {
      id: "veh_1",
      plateNumber: "VHG 8821",
      plateNormalized: "VHG8821",
      brand: "Yamaha",
      model: "NVX 155 ABS",
      year: 2023,
      engineNo: "G3J4E-044211",
      chassisNo: "MH3SE8820PK044211",
      ownerName: "Akmal Hakim",
      ownerPhone: "0112345678",
      currentMileage: 18450,
      lastServiceMileage: 15200,
      lastServiceDate: "2026-07-15",
      dailyKmAvg: 42.5, // 42.5 km sehari
      healthScore: 94, // Skor A (Sangat Sihat)
      passportToken: "pass_vhg8821_demo",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "veh_2",
      plateNumber: "BRA 4321",
      plateNormalized: "BRA4321",
      brand: "Honda",
      model: "RS-X 150",
      year: 2022,
      engineNo: "K56E-109282",
      chassisNo: "PMHK5610PK109282",
      ownerName: "Faizal Roslan",
      ownerPhone: "0178899001",
      currentMileage: 29800,
      lastServiceMileage: 25000,
      lastServiceDate: "2026-06-01",
      dailyKmAvg: 38.0,
      healthScore: 82, // Skor B
      passportToken: "pass_bra4321_demo",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 5. Work Orders (Termasuk Video Jobcard Bukti 5s)
  await db.insert(workOrders).values([
    {
      id: "wo_sample_1",
      woNumber: "WO-2026-0001",
      vehicleId: "veh_1",
      mechanicId: "usr_mech1",
      status: "waiting_approval", // Menunggu kelulusan video pelanggan!
      mileageIn: 18450,
      customerComplaint: "Bunyi bising kat CVT bila pulas trotel awal pagi",
      mechanicNotes: "Mangkuk klac dan roller dah haus teruk, belting ada kesan retak halus.",
      videoProofKey: "https://assets.mixkit.co/videos/preview/mixkit-motorcycle-engine-mechanic-repairing-part-42006-large.mp4", // Demo video stream
      videoDescription: "Tengok ni bro, roller dah berlekuk dan belt ada retak. Bahaya kalau putus atas highway.",
      approvalToken: "tok_akmal_demo",
      isApprovedByCustomer: false,
      totalPartsAmount: 95.0,
      totalLaborAmount: 35.0,
      discountAmount: 0.0,
      grandTotal: 130.0,
      paymentStatus: "unpaid",
      createdAt: now,
    },
  ]);

  await db.insert(workOrderItems).values([
    {
      id: "woi_1",
      workOrderId: "wo_sample_1",
      itemType: "part",
      productId: "prod_belt_nvx",
      description: "V-Belt CVT Yamaha NVX 155 Original HLY",
      quantity: 1,
      unitPrice: 95.0,
      totalPrice: 95.0,
      isRequiresApproval: true,
      isApproved: false,
      createdAt: now,
    },
    {
      id: "woi_2",
      workOrderId: "wo_sample_1",
      itemType: "labor",
      description: "Upah Buka & Pasang Servis CVT + Cuci Mangkuk",
      quantity: 1,
      unitPrice: 35.0,
      totalPrice: 35.0,
      isRequiresApproval: false,
      isApproved: true,
      createdAt: now,
    },
  ]);

  // 6. Showroom Motosikal (Jual Motor)
  await db.insert(motorcycles).values([
    {
      id: "moto_1",
      brand: "Yamaha",
      model: "Y15ZR V2 SE (Special Edition)",
      year: 2024,
      color: "Cyan Metallic",
      engineNo: "G3E9-992182",
      chassisNo: "MH3SE89218276",
      condition: "new",
      costPrice: 8200.0,
      sellingPrice: 9688.0,
      status: "available",
      notes: "Stok baharu tiba minggu ini. Pakej helmet percuma & rainsuit.",
      createdAt: now,
    },
    {
      id: "moto_2",
      brand: "Honda",
      model: "ADV 160 ABS",
      year: 2023,
      color: "Matte Charcoal Grey",
      engineNo: "KF54E-881920",
      chassisNo: "MH3KF54881920",
      condition: "used",
      currentMileage: 8200,
      costPrice: 10500.0,
      sellingPrice: 12400.0,
      status: "available",
      notes: "1 Owner, accident free, full service record FFmotor.",
      createdAt: now,
    },
  ]);

  // 7. Lead Sales & Predictive Booking (Idea 3)
  await db.insert(leads).values([
    {
      id: "lead_1",
      customerName: "Syed Danial",
      customerPhone: "0183344556",
      type: "bike_purchase",
      targetItem: "Yamaha Y15ZR V2 Cyan Metallic",
      budget: 9500.0,
      status: "loan_submitted",
      assignedTo: "usr_sales",
      notes: "Dah submit slip gaji 3 bulan ke Chailease. Menunggu kelulusan.",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.insert(predictiveBookings).values([
    {
      id: "pred_1",
      vehicleId: "veh_1", // Akmal Hakim NVX
      componentType: "belting_cvt",
      estimatedMileageDue: 20000,
      predictedServiceDate: "2026-10-25",
      reservedProductId: "prod_belt_nvx",
      status: "part_reserved",
      whatsappMessageContent: "Bro Akmal, ikut ramalan mileage harian, belting NVX abang dijangka cecah 20,000 km hujung bulan depan. Kami dah simpankan 1 unit Belt Ori siap-siap. Nak booking slot servis?",
      createdAt: now,
    },
  ]);
}
