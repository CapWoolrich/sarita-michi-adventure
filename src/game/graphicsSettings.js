export const GRAPHICS_PRESETS = {
  low: {
    label: 'Baja',
    description: 'Mejor rendimiento',
    postfxEnabled: false,
    shadowQuality: 'off',
    vegetationDensity: 'low',
    drawDistance: 'near',
    dpr: [1, 1.15],
    antialias: false,
    cameraFar: 420,
    fogNear: 55,
    fogFar: 240,
    vegetationMultiplier: 0.58,
    powerUpCount: 3,
    shadowMapSize: 0
  },
  medium: {
    label: 'Media',
    description: 'Equilibrada',
    postfxEnabled: true,
    shadowQuality: 'low',
    vegetationDensity: 'normal',
    drawDistance: 'mid',
    dpr: [1, 1.35],
    antialias: true,
    cameraFar: 620,
    fogNear: 70,
    fogFar: 310,
    vegetationMultiplier: 0.82,
    powerUpCount: 4,
    shadowMapSize: 768
  },
  high: {
    label: 'Alta',
    description: 'Recomendada',
    postfxEnabled: true,
    shadowQuality: 'high',
    vegetationDensity: 'dense',
    drawDistance: 'mid',
    dpr: [1, 1.75],
    antialias: true,
    cameraFar: 900,
    fogNear: 80,
    fogFar: 380,
    vegetationMultiplier: 1,
    powerUpCount: 4,
    shadowMapSize: 1024
  },
  ultra: {
    label: 'Ultra',
    description: 'Mas detalle visual',
    postfxEnabled: true,
    shadowQuality: 'high',
    vegetationDensity: 'ultra',
    drawDistance: 'far',
    dpr: [1.2, 2],
    antialias: true,
    cameraFar: 1200,
    fogNear: 95,
    fogFar: 520,
    vegetationMultiplier: 1.28,
    powerUpCount: 5,
    shadowMapSize: 1536
  }
};

export const SHADOW_QUALITY_OPTIONS = {
  off: { label: 'Sin sombras', shadowMapSize: 0 },
  low: { label: 'Sombras suaves', shadowMapSize: 768 },
  high: { label: 'Sombras altas', shadowMapSize: 1536 }
};

export const VEGETATION_DENSITY_OPTIONS = {
  low: { label: 'Ligera', vegetationMultiplier: 0.58 },
  normal: { label: 'Normal', vegetationMultiplier: 0.82 },
  dense: { label: 'Densa', vegetationMultiplier: 1 },
  ultra: { label: 'Ultra', vegetationMultiplier: 1.28 }
};

export const DRAW_DISTANCE_OPTIONS = {
  near: { label: 'Cerca', cameraFar: 420, fogNear: 55, fogFar: 240 },
  mid: { label: 'Media', cameraFar: 900, fogNear: 80, fogFar: 380 },
  far: { label: 'Lejana', cameraFar: 1200, fogNear: 95, fogFar: 520 }
};

export function getGraphicsProfile(settings = {}) {
  const preset = GRAPHICS_PRESETS[settings.graphicsQuality] ?? GRAPHICS_PRESETS.high;
  const shadow = SHADOW_QUALITY_OPTIONS[settings.shadowQuality ?? preset.shadowQuality] ?? SHADOW_QUALITY_OPTIONS.high;
  const vegetation = VEGETATION_DENSITY_OPTIONS[settings.vegetationDensity ?? preset.vegetationDensity] ?? VEGETATION_DENSITY_OPTIONS.dense;
  const distance = DRAW_DISTANCE_OPTIONS[settings.drawDistance ?? preset.drawDistance] ?? DRAW_DISTANCE_OPTIONS.mid;

  return {
    ...preset,
    ...distance,
    postfxEnabled: settings.postfxEnabled ?? preset.postfxEnabled,
    shadowQuality: settings.shadowQuality ?? preset.shadowQuality,
    vegetationDensity: settings.vegetationDensity ?? preset.vegetationDensity,
    drawDistance: settings.drawDistance ?? preset.drawDistance,
    shadowMapSize: shadow.shadowMapSize,
    vegetationMultiplier: vegetation.vegetationMultiplier
  };
}
