export interface User {
  id: string;
  nik: string;
  name: string;
  role: "admin" | "staff" | "tech_support" | "psd" | "viewer";
  branch?: string;
  email?: string;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface Vehicle {
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  odometer: number;
  transmission: "MT" | "AT" | "CVT";
  fuelType: string;
  lastServiceDate?: Date;
  lastServiceItems?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customer: Customer;
  vehicle: Vehicle;
  branch: string;
  category: string;
  subCategory: string;
  description: string;
  attachments: string[];
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  assignedDepartment?: string;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: Date;
  oldStatus?: string;
  newStatus?: string;
}

export interface MediaAttachment {
  name: string;
  type: string;
  data: string; // base64 encoded
  size: number;
}

export interface TechnicalReport {
  id: string;
  ticketId: string;
  rootCauseAnalysis: string;
  repairActions: string;
  partsUsed: string[];
  conclusion: string;
  technician: string;
  createdBy: string;
  createdAt: Date;
  mediaAttachments?: MediaAttachment[];
}
