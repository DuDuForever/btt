


export interface Visit {
  id: string;
  date: Date;
  services: string[];
  amount: number;
  paid: boolean;
  notes?: string;
  nextVisit?: Date | null;
}

export interface Client {
  id:string;
  displayId: string; // e.g., "0001"
  name: string;
  phone: string;
  visits: Visit[];
  createdAt: string;
}


// Types for writing to Firestore
export interface VisitWrite {
  id: string;
  date: string; // ISO String
  services: string[];
  amount: number;
  paid: boolean;
  notes?: string;
  nextVisit?: string | null; // ISO string or null
}

export interface ClientWrite {
  displayId: string;
  name: string;
  phone: string;
  visits: VisitWrite[];
  createdAt: string; // ISO string
}

// Type for reading premium signup requests
export interface PremiumRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    createdAt: Date; // Read as a Date object
    status: 'pending' | 'completed';
}

// Type for writing premium signup requests
export interface PremiumRequestWrite {
    name: string;
    email: string;
    phone: string;
    password?: string;
    createdAt: any; // Firestore ServerTimestamp
    status: 'pending' | 'completed';
}
