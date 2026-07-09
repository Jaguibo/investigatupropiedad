export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/contact") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method !== "POST") {
      return Response.json(
        { ok: false, message: "Method not allowed" },
        { status: 405 },
      );
    }

    const formData = await request.formData();

    const nombre = String(formData.get("Nombre") || "").trim();
    const whatsapp = String(formData.get("WhatsApp") || "").trim();
    const tipo = String(formData.get("Tipo de consulta") || "").trim();
    const comentarios = String(formData.get("Comentarios") || "").trim();

    if (!nombre || !whatsapp || !tipo || !comentarios) {
      return Response.json(
        { ok: false, message: "Faltan campos requeridos" },
        { status: 400 },
      );
    }

    const res = await fetch("https://api.mailersend.com/v1/email", {
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
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp}</p>
          <p><strong>Tipo de consulta:</strong> ${tipo}</p>
          <p><strong>Comentarios:</strong></p>
          <p>${comentarios.replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      return Response.json({ ok: false, error: text }, { status: 500 });
    }

    return Response.json({ ok: true, message: "Correo enviado correctamente" });
  },
};
