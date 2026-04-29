import React from 'react';
import { useTheme, ThemeScheme, ColorMode } from '../../hooks/useTheme';
import './ThemeSelector.css';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const { scheme, mode, isDark, setScheme, setMode, toggleDarkMode } = useTheme();

  const schemes: { value: ThemeScheme; label: string; description: string }[] = [
    { value: 'earth', label: 'Earth Tones', description: 'Cálido y orgánico' },
    { value: 'olive', label: 'Olive Professional', description: 'Corporativo elegante' }
  ];

  const modes: { value: ColorMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Claro', icon: '☀️' },
    { value: 'dark', label: 'Oscuro', icon: '🌙' },
    { value: 'system', label: 'Sistema', icon: '💻' }
  ];

  if (compact) {
    return (
      <div className="theme-selector-compact">
        <button
          className="theme-toggle-button"
          onClick={toggleDarkMode}
          title={`Modo: ${mode === 'system' ? 'Sistema' : mode === 'dark' ? 'Oscuro' : 'Claro'}`}
        >
          {mode === 'system' ? '💻' : isDark ? '🌙' : '☀️'}
        </button>
      </div>
    );
  }

  return (
    <div className="theme-selector">
      <div className="theme-section">
        <h4>Esquema de Color</h4>
        <div className="scheme-options">
          {schemes.map((s) => (
            <button
              key={s.value}
              className={`scheme-option ${scheme === s.value ? 'active' : ''}`}
              onClick={() => setScheme(s.value)}
            >
              <div className="scheme-preview">
                <div className={`scheme-preview-${s.value}`} />
              </div>
              <div className="scheme-info">
                <div className="scheme-label">{s.label}</div>
                <div className="scheme-description">{s.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="theme-section">
        <h4>Modo de Color</h4>
        <div className="mode-options">
          {modes.map((m) => (
            <button
              key={m.value}
              className={`mode-option ${mode === m.value ? 'active' : ''}`}
              onClick={() => setMode(m.value)}
            >
              <span className="mode-icon">{m.icon}</span>
              <span className="mode-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="theme-section">
        <h4>Vista Previa</h4>
        <div className="theme-preview">
          <div className="preview-card">
            <div className="preview-header">Ejemplo Tarjeta</div>
            <div className="preview-content">
              <div className="preview-title">Título Principal</div>
              <div className="preview-text">Contenido de ejemplo con el tema actual...</div>
              <div className="preview-actions">
                <button className="preview-button-primary">Acción Primaria</button>
                <button className="preview-button-secondary">Secundaria</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
