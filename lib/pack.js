// Packing data into the part of a link after "#", which browsers never send to a server: bytes
// as URL-safe base64 and back, and squeezed through a compression stream. Shared by the Miracle
// Plan (ai/plan.js), the clinician's copy (ai/packet.js) and My Miracle's link to another device
// (my/my.js). The library build writes this file's version into every script that imports it.

// One byte at a time: spreading a long array into a single call can run out of stack
export function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

// Bytes through a CompressionStream or a DecompressionStream
export async function pipe(bytes, stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}
