import { env } from "./config/env";
import { redis } from "./config/redis";
import { createApp } from "./app";
import { startNotificationConsumer } from "./kafka/consumers/notification.consumer";

const app = createApp();

app.listen(env.PORT, async () => {
  // await redis.connect().catch((error) => console.warn("Redis unavailable at startup", error.message));
  // if (env.NODE_ENV !== "test") {
  //   startNotificationConsumer().catch((error) => console.warn("Kafka consumer not started", error.message));
  // }
  console.log(`BookMyVenue API running on port ${env.PORT}`);
});
