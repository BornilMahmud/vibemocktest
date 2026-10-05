import type { FloorplanData, ValidationError, ValidationResult } from '../types/graph';

export function validateFloorplan(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [
        {
          messageEn: 'Uploaded dataset is not a valid JSON object.',
          messageBn: 'আপলোড করা ডেটাসেটটি কোনো বৈধ JSON অবজেক্ট নয়।',
          severity: 'error',
        },
      ],
      warnings: [],
    };
  }

  const record = data as Record<string, unknown>;

  // 1. Check nodes array
  if (!Array.isArray(record.nodes)) {
    errors.push({
      field: 'nodes',
      messageEn: 'Field "nodes" is missing or is not an array.',
      messageBn: '"nodes" ফিল্ডটি অনুপস্থিত অথবা একটি অ্যারে নয়।',
      severity: 'error',
    });
  } else if (record.nodes.length === 0) {
    errors.push({
      field: 'nodes',
      messageEn: 'The dataset contains no nodes. At least 1 room/corridor and 1 exit are required.',
      messageBn: 'ডেটাসেটে কোনো নোড নেই। কমপক্ষে ১টি কক্ষ/করিডোর এবং ১টি নির্গমন পথ আবশ্যক।',
      severity: 'error',
    });
  }

  // 2. Check edges array
  if (!Array.isArray(record.edges)) {
    errors.push({
      field: 'edges',
      messageEn: 'Field "edges" is missing or is not an array.',
      messageBn: '"edges" ফিল্ডটি অনুপস্থিত অথবা একটি অ্যারে নয়।',
      severity: 'error',
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  const nodes = record.nodes as unknown[];
  const edges = record.edges as unknown[];
  const nodeIds = new Set<string>();
  let hasExit = false;
  let hasStartCandidate = false;

  // Validate individual nodes
  nodes.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push({
        field: `nodes[${index}]`,
        messageEn: `Node at index ${index} is not an object.`,
        messageBn: `ইনডেক্স ${index}-এর নোডটি একটি বৈধ অবজেক্ট নয়।`,
        severity: 'error',
      });
      return;
    }

    const node = item as Record<string, unknown>;

    // Check ID
    if (typeof node.id !== 'string' || !node.id.trim()) {
      errors.push({
        field: `nodes[${index}].id`,
        messageEn: `Node at index ${index} must have a non-empty string ID.`,
        messageBn: `ইনডেক্স ${index}-এর নোডে অবশ্যই একটি অ-খালি স্ট্রিং আইডি থাকতে হবে।`,
        severity: 'error',
      });
    } else {
      if (nodeIds.has(node.id)) {
        errors.push({
          field: `nodes[${index}].id`,
          messageEn: `Duplicate node ID detected: "${node.id}". Node IDs must be globally unique.`,
          messageBn: `অনুরূপ নোড আইডি পাওয়া গেছে: "${node.id}"। নোড আইডি অবশ্যই অনন্য হতে হবে।`,
          severity: 'error',
        });
      }
      nodeIds.add(node.id);
    }

    // Check Type
    const validTypes = ['room', 'corridor', 'exit'];
    if (typeof node.type !== 'string' || !validTypes.includes(node.type)) {
      errors.push({
        field: `nodes[${index}].type`,
        messageEn: `Node "${node.id ?? index}" has invalid type "${node.type}". Expected "room", "corridor", or "exit".`,
        messageBn: `নোড "${node.id ?? index}"-এর টাইপ "${node.type}" অবৈধ। এটি "room", "corridor" বা "exit" হতে হবে।`,
        severity: 'error',
      });
    } else {
      if (node.type === 'exit') hasExit = true;
      if (node.type === 'room' || node.type === 'corridor') hasStartCandidate = true;
    }

    // Check Coordinates
    if (typeof node.x !== 'number' || !Number.isFinite(node.x)) {
      errors.push({
        field: `nodes[${index}].x`,
        messageEn: `Node "${node.id ?? index}" has invalid coordinate x. Must be a finite number.`,
        messageBn: `নোড "${node.id ?? index}"-এর x স্থানাঙ্কটি অবৈধ। এটি একটি সীমাবদ্ধ সংখ্যা হতে হবে।`,
        severity: 'error',
      });
    }
    if (typeof node.y !== 'number' || !Number.isFinite(node.y)) {
      errors.push({
        field: `nodes[${index}].y`,
        messageEn: `Node "${node.id ?? index}" has invalid coordinate y. Must be a finite number.`,
        messageBn: `নোড "${node.id ?? index}"-এর y স্থানাঙ্কটি অবৈধ। এটি একটি সীমাবদ্ধ সংখ্যা হতে হবে।`,
        severity: 'error',
      });
    }
  });

  if (!hasExit) {
    errors.push({
      field: 'nodes',
      messageEn: 'The building model must contain at least one node of type "exit".',
      messageBn: 'ভবন মডেলে কমপক্ষে একটি "exit" টাইপের নোড থাকতে হবে।',
      severity: 'error',
    });
  }

  if (!hasStartCandidate) {
    warnings.push({
      field: 'nodes',
      messageEn: 'No rooms or corridors found in graph. At least one room is recommended.',
      messageBn: 'গ্রাফে কোনো রুম বা করিডোর নেই। কমপক্ষে একটি রুম থাকা বাঞ্ছনীয়।',
      severity: 'warning',
    });
  }

  // Validate individual edges
  const edgeSet = new Set<string>();
  const connectedNodes = new Set<string>();

  edges.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push({
        field: `edges[${index}]`,
        messageEn: `Edge at index ${index} is not an object.`,
        messageBn: `ইনডেক্স ${index}-এর এজটি একটি বৈধ অবজেক্ট নয়।`,
        severity: 'error',
      });
      return;
    }

    const edge = item as Record<string, unknown>;

    // Check Source and Target
    if (typeof edge.source !== 'string' || !nodeIds.has(edge.source)) {
      errors.push({
        field: `edges[${index}].source`,
        messageEn: `Edge "${edge.id ?? index}" references unknown source node "${edge.source}".`,
        messageBn: `এজ "${edge.id ?? index}" অজানা উৎস নোড "${edge.source}" নির্দেশ করছে।`,
        severity: 'error',
      });
    }
    if (typeof edge.target !== 'string' || !nodeIds.has(edge.target)) {
      errors.push({
        field: `edges[${index}].target`,
        messageEn: `Edge "${edge.id ?? index}" references unknown target node "${edge.target}".`,
        messageBn: `এজ "${edge.id ?? index}" অজানা গন্তব্য নোড "${edge.target}" নির্দেশ করছে।`,
        severity: 'error',
      });
    }

    if (edge.source === edge.target) {
      warnings.push({
        field: `edges[${index}]`,
        messageEn: `Edge "${edge.id ?? index}" is a self-loop (source equals target).`,
        messageBn: `এজ "${edge.id ?? index}" একটি সেল্ফ-লুপ।`,
        severity: 'warning',
      });
    }

    // Check Cost (Weight)
    if (typeof edge.cost !== 'number' || !Number.isFinite(edge.cost) || edge.cost <= 0) {
      errors.push({
        field: `edges[${index}].cost`,
        messageEn: `Edge "${edge.id ?? index}" has invalid cost "${edge.cost}". Edge cost must be a strictly positive number (> 0).`,
        messageBn: `এজ "${edge.id ?? index}"-এর খরচ "${edge.cost}" অবৈধ। এজ খরচ অবশ্যই ধনাত্মক (> ০) হতে হবে।`,
        severity: 'error',
      });
    }

    if (typeof edge.source === 'string' && typeof edge.target === 'string') {
      const u = edge.source < edge.target ? `${edge.source}---${edge.target}` : `${edge.target}---${edge.source}`;
      if (edgeSet.has(u)) {
        warnings.push({
          field: `edges[${index}]`,
          messageEn: `Multiple edges exist between "${edge.source}" and "${edge.target}". The shorter path cost will be favored.`,
          messageBn: `"${edge.source}" এবং "${edge.target}" এর মধ্যে একাধিক সংযোগ রয়েছে।`,
          severity: 'warning',
        });
      }
      edgeSet.add(u);
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    }
  });

  // Check for disconnected/isolated nodes
  nodeIds.forEach(id => {
    if (!connectedNodes.has(id)) {
      warnings.push({
        field: `nodes.${id}`,
        messageEn: `Node "${id}" has no connecting edges (isolated node).`,
        messageBn: `নোড "${id}" কোনো সংযোগকারী করিডোরের সাথে যুক্ত নয়।`,
        severity: 'warning',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalizes and sets default names/labels if missing in imported JSON.
 */
export function normalizeFloorplan(data: Record<string, unknown>): FloorplanData {
  const nodes = (data.nodes as Array<Record<string, unknown>>).map(n => {
    const id = String(n.id);
    let name = n.name as { en?: string; bn?: string } | undefined;
    if (!name || typeof name !== 'object') {
      name = { en: id, bn: id };
    }
    return {
      id,
      name: {
        en: name.en || id,
        bn: name.bn || id,
      },
      type: (n.type as 'room' | 'corridor' | 'exit') || 'corridor',
      x: Number(n.x),
      y: Number(n.y),
      capacity: typeof n.capacity === 'number' ? n.capacity : undefined,
    };
  });

  const edges = (data.edges as Array<Record<string, unknown>>).map((e, idx) => ({
    id: String(e.id || `edge-${idx}`),
    source: String(e.source),
    target: String(e.target),
    cost: Number(e.cost),
    label: typeof e.label === 'string' ? e.label : undefined,
  }));

  const rawTitle = data.title as { en?: string; bn?: string } | string | undefined;
  const title = typeof rawTitle === 'object' && rawTitle !== null
    ? { en: rawTitle.en || 'Imported Floorplan', bn: rawTitle.bn || 'আমদানিকৃত ফ্লোরপ্ল্যান' }
    : { en: typeof rawTitle === 'string' ? rawTitle : 'Imported Floorplan', bn: 'আমদানিকৃত ফ্লোরপ্ল্যান' };

  return {
    id: String(data.id || `imported-${Date.now()}`),
    title,
    nodes,
    edges,
  };
}
