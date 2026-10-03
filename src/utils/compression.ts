import type { MasterFarmFile } from '../types/livestock';

/**
 * Compresses MasterFarmFile into a gzip-compressed binary Uint8Array
 */
export async function compress_data(data: MasterFarmFile): Promise<Uint8Array> {
  const json_string = JSON.stringify(data);
  const encoder = new TextEncoder();
  const raw_bytes = encoder.encode(json_string);

  const stream = new Response(raw_bytes).body!;
  const compressed_stream = stream.pipeThrough(new CompressionStream('gzip'));
  const compressed_buffer = await new Response(compressed_stream).arrayBuffer();

  return new Uint8Array(compressed_buffer);
}

/**
 * Decompresses binary buffer into a MasterFarmFile.
 * Features automated format detection: handles both gzip binary and legacy plain-text JSON.
 */
export async function decompress_data(input: ArrayBuffer | Uint8Array): Promise<MasterFarmFile> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // Check for leading whitespace before identifying format
  let offset = 0;
  while (
    offset < bytes.length &&
    (bytes[offset] === 0x20 || bytes[offset] === 0x09 || bytes[offset] === 0x0a || bytes[offset] === 0x0d)
  ) {
    offset++;
  }

  // Check for plain uncompressed JSON (starts with '{' = 0x7B)
  if (bytes[offset] === 0x7b) {
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as MasterFarmFile;
  }

  // Gzip binary stream (standard magic bytes 0x1F, 0x8B)
  try {
    const stream = new Response(bytes as any).body!;
    const decompressed_stream = stream.pipeThrough(new DecompressionStream('gzip'));
    const decompressed_buffer = await new Response(decompressed_stream).arrayBuffer();
    const text = new TextDecoder().decode(decompressed_buffer);
    return JSON.parse(text) as MasterFarmFile;
  } catch (err) {
    // Fallback: try decoding as plain text if decompression encounters an issue
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as MasterFarmFile;
  }
}
