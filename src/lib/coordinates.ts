import { useMemo } from 'react';
import type { FloorplanData, GraphNode } from '../types/graph';

// Map 2D floorplan node coordinates to 3D world space
export function useCoordinateMapping(floorplan: FloorplanData) {
  return useMemo(() => {
    if (floorplan.nodes.length === 0) {
      return {
        to3D: () => [0, 0, 0] as [number, number, number],
        center: [0, 0, 0] as [number, number, number],
      };
    }
    const xs = floorplan.nodes.map(n => n.x);
    const ys = floorplan.nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const span = Math.max(maxX - minX, maxY - minY, 400);
    const scale = 26 / span; // Fit comfortably in camera frustum

    const to3D = (node: GraphNode): [number, number, number] => {
      const x3 = (node.x - midX) * scale;
      const z3 = (node.y - midY) * scale;
      return [x3, 0, z3];
    };

    return {
      to3D,
      center: [0, 0, 0] as [number, number, number],
    };
  }, [floorplan.nodes]);
}
