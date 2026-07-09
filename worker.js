export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/contact") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, message: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const formData = await request.formData();

    const nombre = String(formData.get("Nombre") || "").trim();
    const whatsapp = String(formData.get("WhatsApp") || "").trim();
    const tipo = String(formData.get("Tipo de consulta") || "").trim();
    const comentarios = String(formData.get("Comentarios") || "").trim();

    console.log({ nombre, whatsapp, tipo, comentarios });

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Formulario recibido correctamente",
        data: { nombre, whatsapp, tipo, comentarios },
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  },
};
