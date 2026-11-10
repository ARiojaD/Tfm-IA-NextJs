import { createServer } from "node:http";

// Stands in for the language model in the end-to-end tests, so they give the same result on every run and
// need no Ollama. Speaks the OpenAI protocol and always answers citing the first fragment it was given.
// The real model is checked by hand; the search (embeddings and pgvector) is real in these tests.
const PORT = Number(process.argv[2] ?? 3101);

createServer((request, response) => {
  // Playwright waits for the server by requesting its root.
  if (request.method !== "POST") {
    response.end("ok");
    return;
  }
  request.resume();
  request.on("end", () => {
    response.setHeader("content-type", "application/json");
    response.end(
      JSON.stringify({
        id: "chat-e2e",
        object: "chat.completion",
        created: 1,
        model: "fake",
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: JSON.stringify({ coverage: "FULL", answer: "Respuesta de prueba del modelo [1].", missing: "" }),
            },
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    );
  });
}).listen(PORT, "127.0.0.1");
