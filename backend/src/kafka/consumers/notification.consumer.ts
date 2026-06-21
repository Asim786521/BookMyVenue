import { kafka } from "../kafka";
import { kafkaTopics } from "../topics/topics";

export const startNotificationConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "bookmyvenue-notifications" });
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaTopics.notificationEvents, fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString();
      if (value) console.log("notification-event", value);
    }
  });
};
