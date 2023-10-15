import Fastify from "fastify";
import cors from "@fastify/cors";
import { sendMessage, sendNext } from "./chatgpt.js";

const fastify = Fastify({
  logger: true,
});
await fastify.register(cors);

fastify.get("/", (request, reply) => {
  reply.type("application/json").code(200);
  return { ok: true };
});

fastify.post("/chat", async (request, reply) => {
  const { message } = request.body;

  const data = await sendMessage(message);
  reply.type("application/json").code(200);
  return { ok: true, data };
});

fastify.post("/chat/next", async (request, reply) => {
  const data = await sendNext();
  reply.type("application/json").code(200);
  return { ok: true, data };
});

fastify.listen({ port: 3001 }, (err, address) => {
  if (err) throw err;
});
