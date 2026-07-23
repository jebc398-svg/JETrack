import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const BASE_SYSTEM = `Eres el asistente virtual de JETrack, una plataforma de gestión de servicios técnicos y field service. 
Tu nombre es JETrack AI.

IMPORTANTE: Tienes acceso a los datos reales del sistema que se te proporcionan abajo como "CONTEXTO DE DATOS DEL SISTEMA". Usa esos datos para responder preguntas sobre tickets, clientes, cotizaciones, técnicos y métricas. Responde SIEMPRE con datos reales, nunca inventes información.

Si el usuario pregunta por datos que existen en el contexto, respóndelos con precisión usando los números y detalles proporcionados.

Puedes ayudar con:
- Consultas sobre tickets de servicio, estados, prioridades
- Gestión de clientes, técnicos y cotizaciones
- Reportes y métricas de rendimiento
- Calendario y programación de trabajos
- Consejos de productividad y mejores prácticas para gestión de servicios técnicos

Responde siempre en español, sé conciso, profesional y útil.
Máximo 4-5 oraciones por respuesta para mantener la conversación fluida.`;

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
          max_tokens: 500,
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
