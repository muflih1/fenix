export type SignType = 
  | "3D_ACRYLIC_CHANNEL_LETTERS"
  | "NEON_FLEX"
  | "LED_LIGHTBOX"
  | "P10_OUTDOOR_MATRIX"
  | "PYLON_SIGN"
  | "VINYL_GRAPHICS";

export type WorkflowStage = 
  | "QUOTATION"
  | "CUSTOMER_APPROVED"
  | "SITE_SURVEY"
  | "DESIGN_MOCKUP"
  | "PRODUCTION"
  | "INSTALLATION"
  | "COMPLETED"
  | "CANCELLED";

export type ProductionSubStatus = 
  | "CNC_CUTTING"
  | "LETTER_BENDING"
  | "LED_WIRING"
  | "TESTING_QC"
  | "PACKAGING";

export type Priority = "NORMAL" | "HIGH" | "URGENT";

export type InventoryCategory = 
  | "LED_MODULES"
  | "POWER_SUPPLIES"
  | "ACRYLIC_SHEETS"
  | "ALUMINUM_PROFILES"
  | "VINYL_FLEX"
  | "CONTROLLERS"
  | "FASTENERS";

export interface Dimensions {
  width: number;
  height: number;
  depth?: number;
  unit: "ft" | "inch" | "mm";
}

export interface JobBOMItem {
  inventoryItemId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface Financials {
  estimatedMaterialCost: number;
  laborCost: number;
  overheadCost: number;
  markupPercent: number;
  totalQuoteAmount: number;
  depositPaid: number;
  finalBalancePaid: number;
  paymentStatus: "PENDING_DEPOSIT" | "PARTIAL" | "PAID_IN_FULL";
}

export interface SitePhoto {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
}

export interface SiteSurveyData {
  scheduledDate?: string;
  surveyorName?: string;
  assignedDesignerName?: string;
  surveyStatus?: "NOT_SCHEDULED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  wallType?: string;
  accessMethod?: string;
  wallThicknessInches?: number;
  electricalHookupAvailable?: boolean;
  powerDistanceFt?: number;
  sitePhotos?: SitePhoto[];
  surveyNotes?: string;
  revisionRequested?: boolean;
  revisionNotes?: string;
  revisionRequestedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  signType: SignType;
  dimensions: Dimensions;
  installationType: "INDOOR" | "OUTDOOR_FACADE" | "ROOFTOP" | "PYLON_GROUND";
  siteAddress: string;
  stage: WorkflowStage;
  productionSubStatus?: ProductionSubStatus;
  priority: Priority;
  designMockupUrl?: string;
  assignedDesignerName?: string;
  assignedTeam?: string;
  estimatedDate?: string;
  installationDate?: string;
  notes?: string;
  surveyData?: SiteSurveyData;
  bom: JobBOMItem[];
  financials: Financials;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  stockQuantity: number;
  minReorderLevel: number;
  unit: string;
  unitCostPrice: number;
  sellingPrice?: number;
  supplier: string;
  binLocation: string;
  updatedAt: string;
}

export interface StockLog {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: "INWARD_PURCHASE" | "OUTWARD_JOB_CONSUMPTION" | "ADJUSTMENT";
  quantityChanged: number;
  jobId?: string;
  notes: string;
  timestamp: string;
}
