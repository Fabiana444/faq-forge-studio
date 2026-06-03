import { createFileRoute } from "@tanstack/react-router";

/**
 * Snippet JS de embed. Insira no seu site:
 *   <div id="docspace-faq" data-id="UUID"></div>
 *   <script src="https://SEU-DOMINIO/embed.js" defer></script>
 *
 * Funciona em WordPress, Webflow, Wix, Shopify, HTML puro, etc.
 */
export const Route = createFileRoute("/embed.js")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const js = `(function(){
  var nodes=document.querySelectorAll("[id^='docspace-faq']");
  nodes.forEach(function(node){
    var id=node.getAttribute("data-id");
    if(!id) return;
    var iframe=document.createElement("iframe");
    iframe.src="${origin}/faq/"+id+"?embed=1";
    iframe.style.width="100%";
    iframe.style.border="0";
    iframe.style.minHeight="400px";
    iframe.loading="lazy";
    iframe.setAttribute("title","FAQ DocSpace.tec");
    node.appendChild(iframe);
    window.addEventListener("message",function(e){
      if(e.source===iframe.contentWindow && e.data && e.data.type==="docspace:height"){
        iframe.style.height=e.data.height+"px";
      }
    });
  });
})();`;
        return new Response(js, {
          status: 200,
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
