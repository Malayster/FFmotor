import { eq } from "drizzle-orm";
import { DbClient } from "@ffmotor/db";
import {
  customerAccess,
  users,
  vehicles,
  products,
  productSerials,
  workOrders,
  workOrderItems,
  motorcycles,
  leads,
  predictiveBookings,
  quotations,
  quotationItems,
  bikeLocks,
  warrantyIssues,
  cashClosings,
  chatMessages,
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
  staffProfiles,
  mechanicCommissions,
  loanApplications,
  variationOrders,
  itemShots,
} from "@ffmotor/db";

async function safeInsertRows(db: DbClient, table: any, rows: any[]) {
  for (const row of rows) {
    try {
      await db.insert(table).values(row);
    } catch {
      // Row might already exist; safely continue
    }
  }
}

export async function seedInitialData(db: DbClient) {
  const now = new Date().toISOString();

  // 1. Staf Stesen Rasmi & Zero-Trust PIN
  const existingUsers = await db.select().from(users).all();
  const stationPins = [
    { email: "admin@ffmotor.my", pinCode: "8899", role: "owner" },
    { email: "aiman@ffmotor.my", pinCode: "3344", role: "kerani_1" },
    { email: "fauzi@ffmotor.my", pinCode: "2233", role: "kerani_2" },
    { email: "din@ffmotor.my", pinCode: "1122", role: "foreman" },
    { email: "zack@ffmotor.my", pinCode: "5566", role: "affiliate" },
    { email: "siti@ffmotor.my", pinCode: "3344", role: "kerani_1" },
  ] as const;
  for (const station of stationPins) {
    const row = existingUsers.find((user) => user.email === station.email);
    if (row && !row.pinCode) {
      await db.update(users).set({ pinCode: station.pinCode, role: station.role, isActive: true }).where(eq(users.id, row.id));
    }
  }

  if (existingUsers.length === 0) {
    try {
      await safeInsertRows(db, users, [
        {
          id: "usr_admin",
          name: "Tuan Farid (Owner/Admin HQ)",
          email: "admin@ffmotor.my",
          passwordHash: "password123",
          role: "owner",
          pinCode: "8899",
          phone: "0123456789",
          isActive: true,
          createdAt: now,
        },
        {
          id: "usr_kerani1",
          name: "Aiman Hakimi (Kerani 1 Kaunter / SA)",
          email: "aiman@ffmotor.my",
          passwordHash: "password123",
          role: "kerani_1",
          pinCode: "3344",
          phone: "0192233445",
          isActive: true,
          createdAt: now,
        },
        {
          id: "usr_kerani2",
          name: "Fauzi (Kerani 2 Stor / Inventori)",
          email: "fauzi@ffmotor.my",
          passwordHash: "password123",
          role: "kerani_2",
          pinCode: "2233",
          phone: "0187766554",
          isActive: true,
          createdAt: now,
        },
        {
          id: "usr_foreman",
          name: "Abang Din (Ketua Foreman)",
          email: "din@ffmotor.my",
          passwordHash: "password123",
          role: "foreman",
          pinCode: "1122",
          phone: "0139876543",
          isActive: true,
          createdAt: now,
        },
        {
          id: "usr_affiliate",
          name: "Zack (Affiliate / Jualan Showroom)",
          email: "zack@ffmotor.my",
          passwordHash: "password123",
          role: "affiliate",
          pinCode: "5566",
          phone: "0194455667",
          isActive: true,
          createdAt: now,
        },
        {
          id: "usr_mech1",
          name: "Abang Din (Ketua Foreman - Pit Bay)",
          email: "din_pit@ffmotor.my",
          passwordHash: "password123",
          role: "foreman",
          pinCode: "1122",
          phone: "0139876543",
          isActive: true,
          createdAt: now,
        },
        {
          id: "usr_cashier",
          name: "Siti (Kaunter & POS)",
          email: "siti@ffmotor.my",
          passwordHash: "password123",
          role: "kerani_1",
          pinCode: "3344",
          phone: "0172233445",
          isActive: true,
          createdAt: now,
        },
        {
          id: "usr_sales",
          name: "Zack (Penasihat Jualan)",
          email: "sales_zack@ffmotor.my",
          passwordHash: "password123",
          role: "affiliate",
          pinCode: "5566",
          phone: "0194455667",
          isActive: true,
          createdAt: now,
        },
      ]);
    } catch (e) {
      console.warn("Seeding users skipped:", e);
    }
  }

  // 2. Inventori Alat Ganti & Rak
  await safeInsertRows(db, products, [
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
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80",
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
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
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
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
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
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80",
      isHighValue: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_tyre_michelin",
      sku: "TYR-MICH-CT",
      barcode: "95551234005",
      name: "Tayar Michelin City Grip 2 (110/80-14 & 140/70-14)",
      category: "Tayar",
      brand: "Michelin",
      costPrice: 190.0,
      sellingPrice: 280.0,
      stockQty: 12,
      minAlertQty: 4,
      rackLocation: "RAK-T1 (Tayar)",
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&auto=format&fit=crop&q=80",
      isHighValue: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_spark_plug_iridium",
      sku: "PLG-NGK-CPR9",
      barcode: "95551234006",
      name: "Palam Pencucuh NGK Laser Iridium CPR9EAIX-9",
      category: "Enjin",
      brand: "NGK Japan",
      costPrice: 28.0,
      sellingPrice: 48.0,
      stockQty: 25,
      minAlertQty: 8,
      rackLocation: "RAK-A3 (Elektrik)",
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&auto=format&fit=crop&q=80",
      isHighValue: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_brake_fluid_dot4",
      sku: "BRK-MOTUL-DOT4",
      barcode: "95551234007",
      name: "Minyak Brek Motul DOT 4 Racing Brake Fluid (500ml)",
      category: "Brake",
      brand: "Motul",
      costPrice: 25.0,
      sellingPrice: 45.0,
      stockQty: 18,
      minAlertQty: 5,
      rackLocation: "RAK-C2 (Brek)",
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80",
      isHighValue: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 3. Kod Siri Keaslian Part (Product Serials)
  await safeInsertRows(db, productSerials, [
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
  await safeInsertRows(db, vehicles, [
    {
      id: "veh_1",
      plateNumber: "VDF 8899",
      plateNormalized: "VDF8899",
      brand: "Yamaha",
      model: "NVX 155 V2 ABS",
      year: 2023,
      engineNo: "G3J4E-044211",
      chassisNo: "MH3SE8820PK044211",
      ownerName: "Akmal Hakim",
      ownerPhone: "0192233445",
      currentMileage: 18450,
      lastServiceMileage: 15200,
      lastServiceDate: "2026-07-15",
      dailyKmAvg: 42.5, // 42.5 km sehari
      healthScore: 94, // Skor A (Sangat Sihat)
      passportToken: "pass_vdf8899_demo",
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

  // 5. Work Orders (Data bersih — tiada video proof)
  await safeInsertRows(db, workOrders, [
    {
      id: "wo_sample_1",
      woNumber: "WO-2026-0001",
      vehicleId: "veh_1",
      mechanicId: "usr_foreman",
      status: "in_progress",
      mileageIn: 18450,
      customerComplaint: "Bunyi bising kat CVT bila pulas trotel awal pagi",
      mechanicNotes: "Mangkuk klac dan roller dah haus teruk, belting ada kesan retak halus.",
      videoProofKey: null,
      videoDescription: null,
      approvalToken: "tok_vdf8899",
      isApprovedByCustomer: null,
      customerApprovedAt: null,
      totalPartsAmount: 95.0,
      totalLaborAmount: 35.0,
      discountAmount: 0.0,
      grandTotal: 130.0,
      paymentStatus: "unpaid",
      createdAt: now,
      completedAt: null,
    },
  ]);

  await safeInsertRows(db, workOrderItems, [
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
  await safeInsertRows(db, motorcycles, [
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
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop&q=80",
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
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80",
      status: "available",
      notes: "1 Owner, accident free, full service record FFmotor.",
      createdAt: now,
    },
    {
      id: "moto_3",
      brand: "Yamaha",
      model: "Y16ZR ABS Doxou Edition 2024",
      year: 2024,
      color: "Matte Cyan Doxou",
      engineNo: "G3J9-102944",
      chassisNo: "MH3SE90182741",
      condition: "new",
      costPrice: 9100.0,
      sellingPrice: 11118.0,
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&auto=format&fit=crop&q=80",
      status: "available",
      notes: "Edisi Terhad Doxou 2024 siap sijil nombor siri rasmi Hong Leong Yamaha.",
      createdAt: now,
    },
    {
      id: "moto_4",
      brand: "Honda",
      model: "RS-X 150 Repsol Racing Edition",
      year: 2024,
      color: "Repsol Orange Racing",
      engineNo: "K56E-882199",
      chassisNo: "PMHK5620PK882199",
      condition: "new",
      costPrice: 8400.0,
      sellingPrice: 9998.0,
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=900&auto=format&fit=crop&q=80",
      status: "available",
      notes: "Warna rasmi MotoGP Repsol Honda. Prestasi DOHC 6-kelajuan lincah.",
      createdAt: now,
    },
    {
      id: "moto_5",
      brand: "Yamaha",
      model: "NVX 155 ABS Monster Energy GP",
      year: 2023,
      color: "Monster Matte Black",
      engineNo: "G3J4E-994102",
      chassisNo: "MH3SE8820PK994102",
      condition: "used",
      currentMileage: 4200,
      costPrice: 10200.0,
      sellingPrice: 12200.0,
      plateNumber: "KEE 8899",
      listingStatus: "dijual",
      photoUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=900&auto=format&fit=crop&q=80",
      status: "available",
      notes: "Kondisi 99% seperti baru, servis berkala di FP Motor, 1 owner teliti.",
      createdAt: now,
    },
  ]);

  // 6b. Studio Shots (8 Sudut Kamera Studio Motosikal)
  const angleSlots = [
    { slot: "depan", label: "Sudut Hadapan" },
    { slot: "belakang", label: "Sudut Belakang" },
    { slot: "sisi_kiri", label: "Sisi Kiri Penuh" },
    { slot: "sisi_kanan", label: "Sisi Kanan Penuh" },
    { slot: "meter", label: "Panel Meter Digital" },
    { slot: "enjin", label: "Blok Enjin & Karburetor/FI" },
    { slot: "ekzos", label: "Sistem Ekzos" },
    { slot: "tayar_belakang", label: "Tayar & Rim Belakang" },
  ];

  const bikeShotsMap: { [id: string]: string } = {
    moto_1: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop&q=80",
    moto_2: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80",
    moto_3: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&auto=format&fit=crop&q=80",
    moto_4: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=900&auto=format&fit=crop&q=80",
    moto_5: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=900&auto=format&fit=crop&q=80",
  };

  for (const [bikeId, shotImg] of Object.entries(bikeShotsMap)) {
    for (const ang of angleSlots) {
      try {
        await db.insert(itemShots).values({
          id: `shot_${bikeId}_${ang.slot}`,
          subjectType: "motorcycle",
          subjectId: bikeId,
          slot: ang.slot,
          label: ang.label,
          image: shotImg,
          uploadedBy: "usr_foreman",
          createdAt: now,
        });
      } catch {
        // Abaikan jika sudah wujud
      }
    }
  }

  // 7. Lead Sales & Predictive Booking (Idea 3)
  await safeInsertRows(db, leads, [
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

  await safeInsertRows(db, predictiveBookings, [
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

  // 8. Sebut Harga (Quotations & Quotation Items)
  await safeInsertRows(db, quotations, [
    {
      id: "quote_1",
      quoteNumber: "QT-2026-1001",
      customerName: "Razak Manan",
      customerPhone: "0192345678",
      plateNumber: "VDF8899",
      bikeModel: "Honda RS-X 150",
      subtotal: 185.0,
      discountPercent: 5.0,
      discountAmount: 9.25,
      grandTotal: 175.75,
      requiresDirectorApproval: false,
      isApprovedByDirector: true,
      status: "sent",
      createdAt: now,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "quote_2",
      quoteNumber: "QT-2026-1002",
      customerName: "Hafizuddin Che Mat",
      customerPhone: "0134567890",
      plateNumber: "WA1234B",
      bikeModel: "Yamaha Y15ZR V2",
      subtotal: 850.0,
      discountPercent: 15.0,
      discountAmount: 127.5,
      grandTotal: 722.5,
      requiresDirectorApproval: true,
      isApprovedByDirector: false,
      status: "pending_approval",
      createdAt: now,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  await safeInsertRows(db, quotationItems, [
    {
      id: "qi_1",
      quotationId: "quote_1",
      description: "Brake Pad Hadapan Original Nissin",
      itemType: "part",
      quantity: 1,
      unitPrice: 42.0,
      totalPrice: 42.0,
    },
    {
      id: "qi_2",
      quotationId: "quote_1",
      description: "Minyak Enjin Yamalube 4T Semi-Synthetic",
      itemType: "part",
      quantity: 1,
      unitPrice: 38.0,
      totalPrice: 38.0,
    },
    {
      id: "qi_3",
      quotationId: "quote_1",
      description: "Upah Servis Brek & Tukar Minyak",
      itemType: "labor",
      quantity: 1,
      unitPrice: 105.0,
      totalPrice: 105.0,
    },
    {
      id: "qi_4",
      quotationId: "quote_2",
      description: "Pakej Superhead & Blok 62mm Ceramic",
      itemType: "part",
      quantity: 1,
      unitPrice: 650.0,
      totalPrice: 650.0,
    },
    {
      id: "qi_5",
      quotationId: "quote_2",
      description: "Upah Pasang & Dyno Tuning 2 Jam",
      itemType: "labor",
      quantity: 1,
      unitPrice: 200.0,
      totalPrice: 200.0,
    },
  ]);

  // 9. Kunci Unit Showroom (Bike Locks)
  await safeInsertRows(db, bikeLocks, [
    {
      id: "lock_1",
      bookingNo: "LK-2026-001",
      motorcycleId: "moto_1",
      customerName: "Syed Danial",
      customerPhone: "0183344556",
      customerIc: "980512-10-5431",
      depositAmount: 300.0,
      loanProvider: "Chailease Credit",
      loanStatus: "pending",
      isContractSigned: false,
      status: "locked",
      salespersonId: "usr_sales",
      lockedAt: now,
      notes: "Tunggu kelulusan slip gaji. Tempoh tahan unit sehingga Jumaat.",
    },
  ]);

  // Kemaskini status moto_1 kepada 'booked'
  await db.update(motorcycles).set({ status: "booked" }).where(eq(motorcycles.id, "moto_1")).run();

  // 10. Aduan Kualiti & Comeback (Warranty Issues)
  await safeInsertRows(db, warrantyIssues, [
    {
      id: "isu_1",
      issueCode: "ISU-2026-001",
      workOrderId: "wo_sample_1",
      plateNumber: "VDF8899",
      customerName: "Razak Manan",
      customerPhone: "0192345678",
      complaint: "Brek hadapan berdecit kuat bila membrek mengejut selepas tukar pad.",
      mechanicInCharge: "Abang Din",
      severity: "medium",
      status: "investigating",
      partReplaced: "Brake Pad Nissin",
      resolutionNotes: "Caliper pin perlu dilincirkan dengan brake grease suhu tinggi.",
      createdAt: now,
    },
  ]);

  // 11. Penutupan Laci Tunai Semalam (Cash Closings / Z-Reports)
  await safeInsertRows(db, cashClosings, [
    {
      id: "close_yesterday",
      closingDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      cashierId: "usr_cashier",
      openingFloat: 200.0,
      systemExpectedCash: 1420.0,
      physicalCashCounted: 1420.0,
      variance: 0.0,
      pettyCashTotal: 45.0,
      isBalanced: true,
      zReportNumber: "Z-20260920-001",
      notes: "Imbangan sempurna. RM45 petty cash dibelanjakan untuk refill air mineral bengkel.",
      closedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // 12. Log Templat WhatsApp Rasmi (Chat Messages)
  await safeInsertRows(db, chatMessages, [
    {
      id: "msg_1",
      customerPhone: "0192345678",
      workOrderId: "wo_sample_1",
      sender: "workshop",
      message: "Salam Razak Manan, motor VDF8899 telah siap dibaiki dan diuji di FFmotor! Jumlah: RM185.00.",
      messageType: "motor_ready",
      createdAt: now,
    },
  ]);

  // 13. Pembekal OEM (Suppliers)
  await safeInsertRows(db, suppliers, [
    {
      id: "sup_hly",
      name: "Hong Leong Yamaha Parts Hub (Central)",
      code: "SUP-YAM-01",
      contactPerson: "Tan Beng Huat",
      phone: "03-61568899",
      email: "orders@yamaha-parts.my",
      address: "Kompleks Perindustrian Sungai Buloh, Selangor",
      termsDays: 30,
      createdAt: now,
    },
    {
      id: "sup_bss",
      name: "Boon Siew Honda Genuine Parts Centre",
      code: "SUP-HON-02",
      contactPerson: "Encik Azman",
      phone: "04-5088888",
      email: "parts@boonsiewhonda.com.my",
      address: "Batu Kawan Industrial Park, Pulau Pinang",
      termsDays: 30,
      createdAt: now,
    },
    {
      id: "sup_rcb",
      name: "Racing Boy (RCB) Malaysia Distribution Hub",
      code: "SUP-RCB-03",
      contactPerson: "Kelvin Lim",
      phone: "03-80608822",
      email: "sales@racingboy.com.my",
      address: "Taman Perindustrian Puchong, Selangor",
      termsDays: 45,
      createdAt: now,
    },
  ]);

  // 14. Pesanan Belian Stok (Purchase Orders)
  await safeInsertRows(db, purchaseOrders, [
    {
      id: "po_1",
      poNumber: "PO-2026-001",
      supplierId: "sup_hly",
      status: "ordered",
      totalAmount: 1300.0,
      orderedAt: now,
      notes: "Restock 20 unit V-Belt CVT Yamaha NVX",
      createdAt: now,
    },
  ]);

  await safeInsertRows(db, purchaseOrderItems, [
    {
      id: "poi_1",
      purchaseOrderId: "po_1",
      productId: "prod_belt_nvx",
      productName: "V-Belt CVT Yamaha NVX 155 Original HLY",
      quantity: 20,
      costPrice: 65.0,
      totalPrice: 1300.0,
    },
  ]);

  // 15. Profil Staf & Komisen Mekanik (Staff Profiles & Commissions)
  await safeInsertRows(db, staffProfiles, [
    {
      id: "prof_din",
      userId: "usr_mech1", // Abang Din
      specialty: "Ketua Mekanik / Overhaul & Dyno",
      basicSalary: 2800.0,
      commissionRate: 15.0,
      activeBay: 1,
      rating: 4.9,
      totalJobsDone: 48,
    },
    {
      id: "prof_siti",
      userId: "usr_cashier",
      specialty: "Pengurusan Kaunter & POS",
      basicSalary: 1800.0,
      commissionRate: 0.0,
      activeBay: null,
      rating: 5.0,
      totalJobsDone: 120,
    },
    {
      id: "prof_zack",
      userId: "usr_sales",
      specialty: "Penasihat Jualan & Pinjaman Kredit",
      basicSalary: 1800.0,
      commissionRate: 5.0,
      activeBay: null,
      rating: 4.8,
      totalJobsDone: 18,
    },
  ]);

  await safeInsertRows(db, mechanicCommissions, [
    {
      id: "comm_1",
      mechanicId: "usr_mech1",
      workOrderId: "wo_sample_1",
      workOrderNumber: "WO-20260920-001",
      plateNumber: "VDF8899",
      laborTotal: 105.0,
      commissionPercent: 15.0,
      commissionAmount: 15.75,
      status: "accrued",
      createdAt: now,
    },
  ]);

  // 16. Saluran Pinjaman Kredit Motosikal (Loan Applications)
  await safeInsertRows(db, loanApplications, [
    {
      id: "loan_app_1",
      appNumber: "LOAN-2026-081",
      motorcycleId: "moto_1", // Y15ZR
      customerName: "Syed Danial",
      customerPhone: "0183344556",
      customerIc: "980512-10-5431",
      salaryMonthly: 2800.0,
      depositAmount: 1000.0,
      loanAmount: 8688.0,
      loanTermMonths: 36,
      monthlyInstallment: 302.73,
      loanProvider: "Chailease Berjaya Credit",
      stage: "submitted",
      salespersonId: "usr_sales",
      notes: "Slip gaji 3 bulan dan bil elektrik telah dihantar ke pegawai kredit.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "loan_app_2",
      appNumber: "LOAN-2026-082",
      motorcycleId: "moto_2", // ADV 160
      customerName: "Faridul Anwar",
      customerPhone: "0178822331",
      customerIc: "940321-08-6623",
      salaryMonthly: 4200.0,
      depositAmount: 2000.0,
      loanAmount: 10400.0,
      loanTermMonths: 48,
      monthlyInstallment: 290.33,
      loanProvider: "AEON Credit Service",
      stage: "approved",
      salespersonId: "usr_sales",
      notes: "Pinjaman telah LULUS! Menunggu pengesahan pendaftaran geran JPJ.",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 13. Variation Orders (VO) - Kelulusan Pantas Alat Ganti Tambahan
  await safeInsertRows(db, variationOrders, [
    {
      id: "vo_seed_1",
      workOrderId: "wo_sample_1",
      voNumber: "VO-2026-0012",
      title: "Penukaran Mangkok Klac & Roller CVT Terbakar",
      reason: "Semasa membuka penutup CVT, mekanik mendapati roller telah kemik dan tapak mangkok haus teruk mengakibatkan kehilangan kuasa pendikit.",
      partCode: "2DP-E6321-00",
      partName: "Mangkok Klac Racing Boy + Roller Set 10g",
      partCost: 65.0,
      laborCost: 20.0,
      totalAmount: 85.0,
      photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80",
      token: "vo_tok_akmal_cvt",
      status: "pending",
      requestedBy: "Sifu Halim (Foreman)",
      customerPhone: "0192233445",
      createdAt: now,
    },
    {
      id: "vo_seed_2",
      workOrderId: "wo_sample_1",
      voNumber: "VO-2026-0008",
      title: "Penukaran Piring Brek Depan Tebal < 3mm",
      reason: "Piring brek beralun dan melebihi had minimum ketebalan selamat JPJ.",
      partCode: "B65-F582U-00",
      partName: "Yamaha OEM Front Disc Rotor 245mm",
      partCost: 110.0,
      laborCost: 15.0,
      totalAmount: 125.0,
      photoUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80",
      token: "vo_tok_brake_rotor",
      status: "approved",
      requestedBy: "Danial (Mekanik Bay 2)",
      customerPhone: "0178899001",
      approvedAt: now,
      customerNotes: "Luluskan tukar, utamakan keselamatan jalan raya",
      createdAt: now,
    },
  ]);
}


export async function seedCustomerPins(db: DbClient) {
  const now = new Date().toISOString();
  await db.$client.prepare(`CREATE TABLE IF NOT EXISTS customer_access (
    id text PRIMARY KEY NOT NULL,
    phone text NOT NULL,
    pin_code text NOT NULL,
    name text NOT NULL,
    is_active integer NOT NULL DEFAULT 1,
    created_at text NOT NULL
  )`).run();
  const existing = await db.select().from(customerAccess).all();
  const pins = [
    { id: "cus_akmal", phone: "0192233445", pinCode: "2468", name: "Akmal Hakim" },
    { id: "cus_bra", phone: "0178899001", pinCode: "1357", name: "Pelanggan BRA 4321" },
  ];
  for (const pin of pins) {
    if (!existing.some((row) => row.phone === pin.phone)) {
      await db.insert(customerAccess).values({ ...pin, isActive: true, createdAt: now });
    }
  }
}
