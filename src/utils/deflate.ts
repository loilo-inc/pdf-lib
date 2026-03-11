export async function deflateAsync(
  data: Uint8Array | string,
): Promise<Uint8Array> {
  if (typeof data === "string") {
    data = new TextEncoder().encode(data);
  }
  const input = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(data);
      ctrl.close();
    },
  });
  const compressor = new CompressionStream("deflate");
  const output = input.pipeThrough(compressor);
  const reader = output.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  const result = new Uint8Array(size);
  let offs = 0;
  for (const chunk of chunks) {
    result.set(chunk, offs);
    offs += chunk.length;
  }
  return result;
}
