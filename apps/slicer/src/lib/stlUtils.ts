export interface STLMetrics {
  volumeCm3: number;
  weightGrams: number;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Robust, dependency-free STL metrics calculation for server-side use.
 * Supports both ASCII and Binary STL formats.
 */
export function calculateSTLMetrics(buffer: Buffer, density: number = 1.25): STLMetrics {
  const isBinary = buffer.length > 84 && buffer.readUInt32LE(80) * 50 + 84 === buffer.length;
  
  if (isBinary) {
    return parseBinarySTL(buffer, density);
  } else {
    // Basic ASCII detection
    const str = buffer.toString('utf8', 0, 512);
    if (str.includes('solid')) {
        return parseAsciiSTL(buffer, density);
    }
    // Fallback to binary if unsure
    return parseBinarySTL(buffer, density);
  }
}

function parseBinarySTL(buffer: Buffer, density: number): STLMetrics {
  const triangleCount = buffer.readUInt32LE(80);
  let totalVolume = 0;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < triangleCount; i++) {
    const offset = 84 + i * 50;
    // Skip normal (12 bytes)
    
    // Vertices (each 12 bytes: 3 * 4-byte floats)
    const v1 = { x: buffer.readFloatLE(offset + 12), y: buffer.readFloatLE(offset + 16), z: buffer.readFloatLE(offset + 20) };
    const v2 = { x: buffer.readFloatLE(offset + 24), y: buffer.readFloatLE(offset + 28), z: buffer.readFloatLE(offset + 32) };
    const v3 = { x: buffer.readFloatLE(offset + 36), y: buffer.readFloatLE(offset + 40), z: buffer.readFloatLE(offset + 44) };

    // Update bounding box
    for (const v of [v1, v2, v3]) {
        if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
        if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z;
    }

    // Signed volume of tetrahedron
    totalVolume += (
        -v3.x * v2.y * v1.z + 
         v2.x * v3.y * v1.z + 
         v3.x * v1.y * v2.z - 
         v1.x * v3.y * v2.z - 
         v2.x * v1.y * v3.z + 
         v1.x * v2.y * v3.z
    ) / 6.0;
  }

  const volumeCm3 = Math.abs(totalVolume) / 1000;
  
  return {
    volumeCm3,
    weightGrams: volumeCm3 * density,
    dimensions: {
      x: maxX - minX,
      y: maxY - minY,
      z: maxZ - minZ
    }
  };
}

function parseAsciiSTL(buffer: Buffer, density: number): STLMetrics {
  const content = buffer.toString('utf8');
  const lines = content.split('\n');
  
  let totalVolume = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  let v1 = { x: 0, y: 0, z: 0 }, v2 = { x: 0, y: 0, z: 0 }, v3 = { x: 0, y: 0, z: 0 };
  let vertexIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('vertex')) {
      const parts = trimmed.split(/\s+/);
      const v = { x: parseFloat(parts[1]), y: parseFloat(parts[2]), z: parseFloat(parts[3]) };
      
      // Bounding box
      if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
      if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z;

      if (vertexIndex === 0) v1 = v;
      else if (vertexIndex === 1) v2 = v;
      else if (vertexIndex === 2) {
        v3 = v;
        totalVolume += (
            -v3.x * v2.y * v1.z + 
             v2.x * v3.y * v1.z + 
             v3.x * v1.y * v2.z - 
             v1.x * v3.y * v2.z - 
             v2.x * v1.y * v3.z + 
             v1.x * v2.y * v3.z
        ) / 6.0;
      }
      vertexIndex = (vertexIndex + 1) % 3;
    }
  }

  const volumeCm3 = Math.abs(totalVolume) / 1000;
  return {
    volumeCm3,
    weightGrams: volumeCm3 * density,
    dimensions: {
      x: maxX - minX,
      y: maxY - minY,
      z: maxZ - minZ
    }
  };
}
