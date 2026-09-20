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
  status: "pending" | "inspecting" | "in_progress" | "waiting_approval" | "waiting_parts" | "ready" | "completed" | "cancelled";
  mileageIn: number;
  customerComplaint: string;
  mechanicNotes?: string;
  videoProofKey?: string;
  videoDescription?: string;
  approvalToken: string;
  isApprovedByCustomer?: boolean | null;
  totalPartsAmount?: number;
  totalLaborAmount?: number;
  grandTotal: number;
  paymentStatus: "unpaid" | "partial" | "paid";
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
  sellingPrice: number;
  stockQty: number;
  minAlertQty: number;
  rackLocation: string;
  isHighValue: boolean;
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

