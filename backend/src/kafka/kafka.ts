import { Kafka } from "kafkajs";
import { env } from "../config/env";

export const kafka = new Kafka({
  clientId: "bookmyvenue-api",
  brokers: env.KAFKA_BROKERS.split(",")
});
