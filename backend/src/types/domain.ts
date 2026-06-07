export const Roles = {
  USER: "USER",
  VENUE_OWNER: "VENUE_OWNER",
  ADMIN: "ADMIN"
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const VenueStatuses = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

export const BookingStatuses = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED"
} as const;

export const PaymentStatuses = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED"
} as const;
