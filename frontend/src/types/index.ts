export type Role = "USER" | "VENUE_OWNER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Venue = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  capacity: number;
  price: string;
  amenities: string[];
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  slots?: VenueSlot[];
};

export type VenueSlot = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  available?: boolean;
};

export type Booking = {
  id: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  date: string;
  amount: string;
  venue: Venue;
  slot: VenueSlot;
};
