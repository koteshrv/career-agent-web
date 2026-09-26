export const onRequestGet: PagesFunction = async (context) => {
  const country = context.request.headers.get('cf-ipcountry') || null;
  return new Response(JSON.stringify({ country }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-cache',
    },
  });
};
