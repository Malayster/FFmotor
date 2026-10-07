// Cloudflare Pages Functions Reverse Proxy untuk API FFmotor
// Memastikan semua panggilan /api/* di fpmotor.pages.dev diproksi terus ke Worker API tanpa sekatan polisi

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const targetUrl = new URL(
    `https://fpmotor-api.espims.workers.dev${url.pathname}${url.search}`
  );

  // Salin semua header dan teruskan body permintaan
  const newHeaders = new Headers(context.request.headers);
  newHeaders.set("host", targetUrl.host);

  // Pastikan x-ff-user-id dipelihara
  const init: RequestInit = {
    method: context.request.method,
    headers: newHeaders,
    redirect: "follow",
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(context.request.method)) {
    init.body = context.request.body;
    // @ts-expect-error duplex required for streaming body in fetch
    init.duplex = "half";
  }

  try {
    const response = await fetch(targetUrl.toString(), init);
    // Kembalikan jawapan dari Worker API dengan header CORS
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("access-control-allow-origin", "*");
    responseHeaders.set(
      "access-control-allow-headers",
      "Content-Type, Authorization, x-ff-user-id, x-ff-user-role"
    );
    responseHeaders.set(
      "access-control-allow-methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Ralat proksi Pages Functions ke Worker API",
        message: err.message,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
