export interface TemplateSettings {
  enabled: boolean;
  deviceModel: 'iphone-16-pro' | 'iphone-15-pro';
  angle: 'portrait' | 'three-quarter' | 'straight-on';
  background: 'outdoor' | 'studio' | 'indoor';
  lighting: 'natural' | 'soft-studio' | 'golden-hour';
}

const SCREEN_INTRO = ' The phone screen displays:'; // note leading space
const NEGATIVES = ' Avoid blurry image, low resolution, extra fingers, deformed hands, reflections obscuring the screen, watermark, text artifacts.';

function deviceModelToText(deviceModel: TemplateSettings['deviceModel']): string {
  // Always include Dynamic Island per product line; both 15 Pro and 16 Pro have it
  const label = deviceModel === 'iphone-16-pro' ? 'iPhone 16 Pro' : 'iPhone 15 Pro';
  return `${label} with Dynamic Island`;
}

function angleToText(angle: TemplateSettings['angle']): string {
  switch (angle) {
    case 'portrait':
      return 'portrait orientation';
    case 'three-quarter':
      return 'slight three-quarter angle';
    case 'straight-on':
      return 'straight-on view';
  }
}

function backgroundToText(background: TemplateSettings['background']): string {
  switch (background) {
    case 'outdoor':
      return 'natural outdoor background';
    case 'studio':
      return 'clean studio background';
    case 'indoor':
      return 'indoor background';
  }
}

function lightingToText(lighting: TemplateSettings['lighting']): string {
  switch (lighting) {
    case 'natural':
      return 'natural outdoor lighting';
    case 'soft-studio':
      return 'soft studio lighting';
    case 'golden-hour':
      return 'warm golden-hour lighting';
  }
}

export function buildDevicePrefix(settings: TemplateSettings): string {
  const parts = [
    `Ultra-realistic photo of a person's hand holding an ${deviceModelToText(settings.deviceModel)}`,
    angleToText(settings.angle),
    'shallow depth of field (bokeh)',
    lightingToText(settings.lighting),
    backgroundToText(settings.background),
    'high detail'
  ];
  // Join with commas; the first part already has base description
  return parts[0] + ', ' + parts.slice(1).join(', ') + '.';
}

export function applyTemplate(screenText: string, settings: TemplateSettings): string {
  const devicePrefix = buildDevicePrefix(settings);
  return `${devicePrefix}${SCREEN_INTRO} ${screenText}.${NEGATIVES}`;
}

export function isTemplated(text: string): boolean {
  if (!text) return false;
  // Detect via the unique screen intro marker and mention of a hand
  const hasScreenIntro = /\bthe phone screen displays:/i.test(text);
  const hasHand = /\bhand\b/i.test(text);
  return hasScreenIntro && hasHand;
}

export function stripTemplate(text: string): string {
  if (!text) return text;
  // Remove the negatives if appended
  let cleaned = text.endsWith(NEGATIVES) ? text.slice(0, text.length - NEGATIVES.length) : text;
  // Find the screen intro marker and take content after it
  const idx = cleaned.toLowerCase().indexOf(SCREEN_INTRO.toLowerCase());
  if (idx >= 0) {
    cleaned = cleaned.slice(idx + SCREEN_INTRO.length).trimStart();
  }
  return cleaned.trim();
}
