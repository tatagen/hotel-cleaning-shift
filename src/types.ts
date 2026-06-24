export interface Staff {
  id: string;
  name: string;
  phone: string;
}

export interface Room {
  number: string; // "201", "202", ...
  defaultPrice: number; // e.g. 1200
}

export interface Shift {
  date: string; // YYYY-MM-DD
  staffIds: string[]; // List of staff IDs on duty on this date
}

export interface Assignment {
  id: string; // UUID or unique hash
  date: string; // YYYY-MM-DD
  roomNumber: string; // "201", etc.
  staffId: string; // assigned staff ID
  appliedPrice: number; // price at assignment time
}
