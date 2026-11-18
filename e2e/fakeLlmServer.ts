import { createServer } from "node:http";

// Sustituye al modelo de lenguaje en los tests end-to-end, para que den el mismo resultado en cada ejecución
// y no necesiten Ollama. Habla el protocolo de OpenAI y responde según el esquema JSON que se le pide.
// El modelo real se comprueba a mano; la búsqueda (embeddings y pgvector) sí es real en estos tests.
const PORT = Number(process.argv[2] ?? 3101);

const REPLIES: Record<string, unknown> = {
  respuesta: { coverage: "FULL", answer: "Respuesta de prueba del modelo [1].", missing: "" },
  // El 44 aparece en el texto de Julio César: un año inventado se descartaría.
  cronologia: { events: [{ title: "Evento propuesto por la IA", year: 44, era: "BC", month: 3, description: "Descripción propuesta." }] },
  propuesta_evento: { found: true, title: "Evento rellenado por la IA", year: 216, era: "BC", month: 8, description: "Descripción rellenada." },
  quiz: {
    questions: [{ question: "Pregunta propuesta por la IA", options: ["Correcta", "Incorrecta"], correctOptionIndex: 0, explanation: "" }],
  },
};

createServer((request, response) => {
  // Playwright espera al servidor pidiendo su raíz.
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
