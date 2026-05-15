import {
  DRAW_DISTANCE_OPTIONS,
  GRAPHICS_PRESETS,
  SHADOW_QUALITY_OPTIONS,
  VEGETATION_DENSITY_OPTIONS
} from '../graphicsSettings';

export default function SettingsPanel({ isOpen, settings, onChange, onClose }) {
  if (!isOpen) return null;
  const update = (patch) => onChange({ ...settings, ...patch });
  const updateGraphicsPreset = (graphicsQuality) => {
    const preset = GRAPHICS_PRESETS[graphicsQuality] ?? GRAPHICS_PRESETS.high;
    update({
      graphicsQuality,
      postfxEnabled: preset.postfxEnabled,
      shadowQuality: preset.shadowQuality,
      vegetationDensity: preset.vegetationDensity,
      drawDistance: preset.drawDistance
    });
  };

  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <h2>Configuración</h2>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-settings-body">
          <SettingRow label="Audio">
            <label className="kw-switch">
              <input type="checkbox" checked={settings.audioEnabled} onChange={(e) => update({ audioEnabled: e.target.checked })} />
              <span className="kw-switch-slider" />
            </label>
          </SettingRow>
          <SettingRow label="Volumen" disabled={!settings.audioEnabled}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.audioVolume}
              onChange={(e) => update({ audioVolume: parseFloat(e.target.value) })}
              disabled={!settings.audioEnabled}
              className="kw-slider"
            />
          </SettingRow>
          <SettingRow label="Vibración (móvil)">
            <label className="kw-switch">
              <input type="checkbox" checked={settings.hapticsEnabled} onChange={(e) => update({ hapticsEnabled: e.target.checked })} />
              <span className="kw-switch-slider" />
            </label>
          </SettingRow>
          <SettingRow label="Calidad grafica">
            <select
              className="kw-select"
              value={settings.graphicsQuality}
              onChange={(e) => updateGraphicsPreset(e.target.value)}
            >
              {Object.entries(GRAPHICS_PRESETS).map(([id, preset]) => (
                <option key={id} value={id}>{preset.label} - {preset.description}</option>
              ))}
            </select>
          </SettingRow>
          <div className="kw-settings-grid">
            <SettingRow label="PostFX">
              <label className="kw-switch">
                <input
                  type="checkbox"
                  checked={settings.postfxEnabled ?? GRAPHICS_PRESETS.high.postfxEnabled}
                  onChange={(e) => update({ postfxEnabled: e.target.checked })}
                />
                <span className="kw-switch-slider" />
              </label>
            </SettingRow>
            <SettingRow label="Sombras">
              <select
                className="kw-select kw-select-compact"
                value={settings.shadowQuality ?? GRAPHICS_PRESETS.high.shadowQuality}
                onChange={(e) => update({ shadowQuality: e.target.value })}
              >
                {Object.entries(SHADOW_QUALITY_OPTIONS).map(([id, option]) => (
                  <option key={id} value={id}>{option.label}</option>
                ))}
              </select>
            </SettingRow>
            <SettingRow label="Vegetacion">
              <select
                className="kw-select kw-select-compact"
                value={settings.vegetationDensity ?? GRAPHICS_PRESETS.high.vegetationDensity}
                onChange={(e) => update({ vegetationDensity: e.target.value })}
              >
                {Object.entries(VEGETATION_DENSITY_OPTIONS).map(([id, option]) => (
                  <option key={id} value={id}>{option.label}</option>
                ))}
              </select>
            </SettingRow>
            <SettingRow label="Distancia">
              <select
                className="kw-select kw-select-compact"
                value={settings.drawDistance ?? GRAPHICS_PRESETS.high.drawDistance}
                onChange={(e) => update({ drawDistance: e.target.value })}
              >
                {Object.entries(DRAW_DISTANCE_OPTIONS).map(([id, option]) => (
                  <option key={id} value={id}>{option.label}</option>
                ))}
              </select>
            </SettingRow>
          </div>
          <div className="kw-settings-hint">
            Ultra aumenta vegetacion, sombras, distancia y efectos. Baja prioriza FPS.
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, children, disabled = false }) {
  return (
    <div className={`kw-settings-row ${disabled ? 'kw-disabled' : ''}`}>
      <span className="kw-settings-label">{label}</span>
      <div className="kw-settings-control">{children}</div>
    </div>
  );
}
