import { createServer } from "node:http";

// Stands in for the language model in the end-to-end tests, so they give the same result on every run and
// need no Ollama. Speaks the OpenAI protocol and replies according to the JSON schema it is asked for.
// The real model is checked by hand; the search (embeddings and pgvector) is real in these tests.
const PORT = Number(process.argv[2] ?? 3101);

const REPLIES: Record<string, unknown> = {
  respuesta: { coverage: "FULL", answer: "Respuesta de prueba del modelo [1].", missing: "" },
  // 44 appears in the text of Julio César: an invented year would be discarded.
  cronologia: { events: [{ title: "Evento propuesto por la IA", year: 44, era: "BC", month: 3, description: "Descripción propuesta." }] },
  quiz: {
    questions: [{ question: "Pregunta propuesta por la IA", options: ["Correcta", "Incorrecta"], correctOptionIndex: 0, explanation: "" }],
  },
};

createServer((request, response) => {
  // Playwright waits for the server by requesting its root.
  if (request.method !== "POST") {
    response.end("ok");
    return;
  }
  let body = "";
  request.on("data", (chunk: Buffer) => (body += chunk.toString()));
  request.on("end", () => {
    const { response_format: format } = JSON.parse(body) as { response_format: { json_schema: { name: string } } };
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
              content: JSON.stringify(REPLIES[format.json_schema.name]),
            },
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    );
  });
}).listen(PORT, "127.0.0.1");
