import { createFileRoute } from "@tanstack/react-router";

/**
 * API pública JSON para integração externa (WordPress, sites estáticos, etc).
 * Retorna a FAQ pública pelo id. CORS liberado para uso em qualquer origem.
 *
 * GET /api/public/faqs/:id  -> { id, title, template, config, items }
 */
export const Route = createFileRoute("/api/public/faqs/$id")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
      GET: async ({ params }) => {
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await supabaseAdmin
          .from("faqs")
          .select("id,title,template,config,items,visibility,updated_at,user_id")
          .eq("id", params.id)
          .eq("visibility", "public")
          .maybeSingle();

        const headers = {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        };

        if (error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers,
          });
        if (!data)
          return new Response(
            JSON.stringify({ error: "FAQ não encontrada ou privada" }),
            { status: 404, headers },
          );

        // Verifica se o dono tem acesso aprovado
        const { data: owner } = await supabaseAdmin
          .from("profiles")
          .select("access_status")
          .eq("id", (data as { user_id: string }).user_id)
          .maybeSingle();
        if (!owner || owner.access_status !== "approved") {
          return new Response(
            JSON.stringify({
              error: "Conta do autor pendente ou suspensa. Entre em contato com o suporte do DocSpace.tec.",
            }),
            { status: 403, headers },
          );
        }

        const { user_id: _omit, ...payload } = data as Record<string, unknown>;
        return new Response(JSON.stringify(payload), { status: 200, headers });
      },
    },
  },
});
