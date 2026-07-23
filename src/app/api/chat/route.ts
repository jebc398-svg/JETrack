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

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
    return NextResponse.json(
      {
        error: "API key no configurada. Agrega OPENROUTER_API_KEY en .env.local con tu clave de OpenRouter.",
        fallback: true,
      },
      { status: 503 }
    );
  }

  try {
    const { messages } = await request.json();

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://jetrack.app",
        "X-Title": "JETrack AI Assistant",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      return NextResponse.json(
        { error: "Error al conectar con la IA. Intenta de nuevo." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
