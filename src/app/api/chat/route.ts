import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Eres el asistente virtual de JETrack, una plataforma de gestión de servicios técnicos y field service. 
Tu nombre es JETrack AI.

Puedes ayudar con:
- Consultas sobre tickets de servicio, estados, prioridades
- Gestión de clientes, técnicos y cotizaciones
- Reportes y métricas de rendimiento
- Calendario y programación de trabajos
- Consejos de productividad y mejores prácticas para gestión de servicios técnicos

Responde siempre en español, sé conciso, profesional y útil. 
Si no tienes información específica de los datos del usuario, responde con consejos generales sobre la gestión de servicios técnicos.
Máximo 3-4 oraciones por respuesta para mantener la conversación fluida.`;

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
      {
        error: "API key no configurada.",
        fallback: true,
      },
      { status: 503 }
    );
  }

  try {
    const { messages } = await request.json();

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
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
          max_tokens: 300,
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
      {
        error: `Ningún modelo disponible. Último error: ${lastError.substring(0, 200)}`,
      },
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
