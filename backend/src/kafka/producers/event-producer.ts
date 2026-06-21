import { kafka } from "../kafka";

const producer = kafka.producer();
let connected = false;

export type DomainEvent = {
  type: "BOOKING_CONFIRMED" | "PAYMENT_SUCCESS" | "BOOKING_CANCELLED";
  payload: Record<string, unknown>;
  occurredAt?: string;
};

export const publishEvent = async (topic: string, event: DomainEvent) => {
  if (!connected) {
    await producer.connect();
    connected = true;
  }

  await producer.send({
    topic,
    messages: [
      {
        key: event.type,
        value: JSON.stringify({ ...event, occurredAt: event.occurredAt ?? new Date().toISOString() })
      }
    ]
  });
};
