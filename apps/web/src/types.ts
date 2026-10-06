export interface Vehicle {
  id: string;
  plateNumber: string;
  plateNormalized: string;
  brand: string;
  model: string;
  year?: number;
  engineNo?: string;
  chassisNo?: string;
  ownerName: string;
  ownerPhone: string;
  currentMileage: number;
  lastServiceMileage?: number;
  lastServiceDate?: string;
  dailyKmAvg?: number;
  healthScore: number;
  passportToken: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  vehicleId?: string;
  plateNumber?: string;
  brand?: string;
  model?: string;
  ownerName?: string;
  ownerPhone?: string;
  // waiting_approval DIBUANG — aliran kerja kini: in_progress → ready (Foreman QC fizikal)
  status: "pending" | "inspecting" | "in_progress" | "waiting_parts" | "ready" | "completed" | "cancelled";
  mileageIn: number;
  customerComplaint: string;
  mechanicNotes?: string;
  safetyFlags?: string;
  approvalToken?: string; // Kekal untuk pautan jejak pelanggan sahaja (bukan video)
  totalPartsAmount?: number;
  totalLaborAmount?: number;
  grandTotal: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  assignedBay?: number;
  mechanicId?: string;
  mechanicName?: string;
  keyTag?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  itemType: "part" | "labor";
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isRequiresApproval: boolean;
  isApproved: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  markupPct?: number;
  sellingPrice: number;
  stockQty: number;
  minAlertQty: number;
  rackLocation: string;
  binLocation?: string;
  grade?: 'OEM' | 'Aftermarket' | 'Terpakai';
  isHighValue: boolean;
  moq?: number; // Minimum Order Quantity
  imageUrl?: string;
  aliases?: string[]; // Dialek & nama pasar (cth: ["matgat", "mudguard", "fender"])
}

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engineNo: string;
  chassisNo: string;
  condition: "new" | "used";
  currentMileage: number;
  costPrice: number;
  sellingPrice: number;
  status: "available" | "booked" | "loan_pending" | "sold";
  notes?: string;
  images?: string[];
  shotLabels?: string[];
  depositMin?: number;
  monthlyEstimated?: number;
  specs?: string[];
}

export interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  type: "bike_purchase" | "service_maintenance" | "parts_hunting";
  targetItem: string;
  budget?: number;
  status: "new" | "contacted" | "test_ride" | "loan_submitted" | "won" | "lost";
  notes?: string;
  createdAt: string;
}

export interface PredictiveBooking {
  id: string;
  componentType: string;
  estimatedMileageDue: number;
  predictedServiceDate: string;
  status: string;
  whatsappMessageContent?: string;
  plateNumber: string;
  brand: string;
  model: string;
  ownerName: string;
  ownerPhone: string;
  currentMileage: number;
  dailyKmAvg: number;
  reservedProductName?: string;
  reservedProductStock?: number;
  reservedProductRack?: string;
}

