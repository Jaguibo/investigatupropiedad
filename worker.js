function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://investigatupropiedad.com.sv",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function createHubSpotContact(env, lead) {
  if (!env.HUBSPOT_ACCESS_TOKEN) return;

  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.HUBSPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        firstname: lead.nombre,
        phone: lead.whatsapp,
        lifecyclestage: "lead",
        hs_lead_status: "NEW",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn("HubSpot error:", text);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/contact") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return Response.json(
        { ok: false, message: "Method not allowed" },
        { status: 405, headers: CORS_HEADERS },
      );
    }

    let formData;

    try {
      formData = await request.formData();
    } catch (err) {
      return Response.json(
        { ok: false, message: "No se pudo leer el formulario" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const nombre = String(formData.get("Nombre") || "").trim();
    const whatsapp = String(formData.get("WhatsApp") || "").trim();
    const tipo = String(formData.get("Tipo de consulta") || "").trim();
    const comentarios = String(formData.get("Comentarios") || "").trim();

    if (!nombre || !whatsapp || !tipo || !comentarios) {
      return Response.json(
        { ok: false, message: "Faltan campos requeridos" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    try {
      const mailerRes = await fetch("https://api.mailersend.com/v1/email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.MAILERSEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: {
            email: "noreply@test-xkjn41mq97p4z781.mlsender.net",
            name: "Investiga tu Propiedad SV",
          },
          to: [
            {
              email: "contacto@investigatupropiedad.com.sv",
              name: "Contacto",
            },
          ],
          subject: `Nueva consulta registral - ${nombre}`,
          html: `
            <h2>Nueva consulta registral</h2>
            <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
            <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
            <p><strong>Tipo de consulta:</strong> ${escapeHtml(tipo)}</p>
            <p><strong>Comentarios:</strong></p>
            <p>${escapeHtml(comentarios).replace(/\n/g, "<br>")}</p>
          `,
        }),
      });

      const mailerText = await mailerRes.text();

      if (!mailerRes.ok) {
        return Response.json(
          {
            ok: false,
            status: mailerRes.status,
            mailersend_error: mailerText,
            has_token: !!env.MAILERSEND_API_KEY,
          },
          { status: 500, headers: CORS_HEADERS },
        );
      }

      await createHubSpotContact(env, {
        nombre,
        whatsapp,
        tipo,
        comentarios,
      });

      return Response.json(
        { ok: true, message: "Consulta enviada correctamente" },
        { status: 200, headers: CORS_HEADERS },
      );
    } catch (err) {
      return Response.json(
        {
          ok: false,
          message: "Error al procesar la consulta",
          error: String(err),
        },
        { status: 500, headers: CORS_HEADERS },
      );
    }
  },
};
