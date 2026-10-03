import { describe, expect, it } from 'vitest';
import { create_empty_farm_data } from './storage';
import { compress_data, decompress_data } from './compression';

describe('Binary Compression and Serialisation', () => {
  it('correctly compresses and decompresses farm data round-trip', async () => {
    const original_data = create_empty_farm_data('Highland Farm');
    original_data.farm.cph_number = '99/888/7777';
    original_data.periods[0].categories[0].opening_stock = 120;
    original_data.periods[0].categories[0].actual_closing_stock = 115;

    const compressed_bytes = await compress_data(original_data);

    // Verify it is a binary Uint8Array
    expect(compressed_bytes).toBeInstanceOf(Uint8Array);
    // Gzip magic bytes: 0x1f (31) and 0x8b (139)
    expect(compressed_bytes[0]).toBe(0x1f);
    expect(compressed_bytes[1]).toBe(0x8b);

    // Decompress back
    const restored_data = await decompress_data(compressed_bytes);
    expect(restored_data.farm.farm_name).toBe('Highland Farm');
    expect(restored_data.farm.cph_number).toBe('99/888/7777');
    expect(restored_data.periods[0].categories[0].opening_stock).toBe(120);
    expect(restored_data.periods[0].categories[0].actual_closing_stock).toBe(115);
  });

  it('compresses data significantly smaller than raw JSON representation', async () => {
    const data = create_empty_farm_data('Estate Farm');
    const json_string = JSON.stringify(data, null, 2);
    const uncompressed_size = new TextEncoder().encode(json_string).length;

    const compressed_bytes = await compress_data(data);

    // Compressed size should be substantially smaller
    expect(compressed_bytes.length).toBeLessThan(uncompressed_size);
  });

  it('supports transparent backward compatibility with plain uncompressed JSON', async () => {
    const legacy_data = create_empty_farm_data('Legacy Holding');
    legacy_data.farm.cph_number = '11/222/3333';
    const json_string = JSON.stringify(legacy_data);
    const raw_bytes = new TextEncoder().encode(json_string);

    // Decompressing raw bytes without gzip headers
    const loaded = await decompress_data(raw_bytes);
    expect(loaded.farm.farm_name).toBe('Legacy Holding');
    expect(loaded.farm.cph_number).toBe('11/222/3333');
  });
});
