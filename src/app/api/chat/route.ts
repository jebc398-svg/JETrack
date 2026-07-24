import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const BASE_SYSTEM = `Eres el asistente virtual de JETrack, una plataforma de gestión de servicios técnicos y field service. 
Tu nombre es JETrack AI.

IMPORTANTE: Tienes acceso a los datos REALES y COMPLETOS del sistema en "CONTEXTO DE DATOS". Cada ticket incluye: cliente, técnico, fechas, estado, prioridad, ubicación, notas. Cada cliente incluye: email, teléfono, empresa. Cada cotización incluye: items, total, estado. Cada técnico incluye: especialidad, zona, disponibilidad, rating.

REGLAS:
- Usa SIEMPRE los datos reales del contexto. NUNCA inventes información.
- Si el usuario pregunta por un ticket específico (por ID o nombre), busca en el listado de tickets y responde con TODOS los campos: cliente, técnico, fechas, estado, prioridad, ubicación, notas.
- Si pregunta por un cliente, muestra sus tickets y cotizaciones.
- Si pregunta por un técnico, muestra sus tickets asignados y disponibilidad.
- Si pregunta por una cotización, muestra sus items, total, cliente y ticket vinculado.
- Puedes hacer cálculos: sumar totales, contar por estado, comparar fechas, etc.
- Responde en español, sé conciso pero completo. Usa los datos exactos.`;

const MODELS = [
  "google/gemini-2.0-flash-001:free",
  "google/gemini-2.5-flash",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
    return NextResponse.json(
      { error: "API key no configurada.", fallback: true },
      { status: 503 }
    );
  }

  try {
    const { messages, dataContext } = await request.json();

    const systemPrompt = dataContext
      ? `${BASE_SYSTEM}\n\n--- CONTEXTO DE DATOS DEL SISTEMA ---\n${dataContext}\n--- FIN DEL CONTEXTO ---`
      : BASE_SYSTEM;

    let lastError = "";

    for (const model of MODELS) {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://jetrack.app",
          "X-Title": "JETrack AI Assistant",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply =
          data.choices?.[0]?.message?.content ||
          "No pude generar una respuesta.";
        return NextResponse.json({ reply });
      }

      const errText = await response.text();
      lastError = `${model}: ${response.status} - ${errText}`;
      console.error("OpenRouter error:", lastError);
    }

    return NextResponse.json(
      { error: `Error al conectar con la IA: ${lastError.substring(0, 200)}` },
      { status: 502 }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor." },
      { status: 500 }
    );
  }
}
