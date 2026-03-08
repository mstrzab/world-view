// WebGL Shader Code for Post-Processing Effects

export const crtVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const crtFragmentShader = `
uniform sampler2D tDiffuse;
uniform float time;
uniform float scanlineIntensity;
uniform float vignetteIntensity;
uniform float chromaticAberration;
uniform float distortion;

varying vec2 vUv;

// CRT curvature distortion
vec2 curve(vec2 uv) {
  uv = (uv - 0.5) * 2.0;
  uv *= 1.1;
  uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
  uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
  uv = (uv / 2.0) + 0.5;
  uv = uv * 0.92 + 0.04;
  return uv;
}

void main() {
  vec2 uv = curve(vUv);
  
  // Check if we're outside the curved screen
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  // Chromatic aberration
  float offset = chromaticAberration * 0.01;
  float r = texture2D(tDiffuse, uv + vec2(offset, 0.0)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - vec2(offset, 0.0)).b;
  vec4 color = vec4(r, g, b, 1.0);
  
  // Scanlines
  float scanline = sin(uv.y * 800.0) * 0.04 * scanlineIntensity;
  color.rgb -= scanline;
  
  // Horizontal scanline flicker
  float flicker = sin(time * 100.0) * 0.01;
  color.rgb += flicker;
  
  // Vignette
  float vignette = vignetteIntensity * (1.0 - length((vUv - 0.5) * 1.5));
  color.rgb *= vignette;
  
  // Add slight green phosphor tint
  color.rgb = mix(color.rgb, vec3(color.r * 0.9, color.g * 1.05, color.b * 0.9), 0.1);
  
  // CRT glow
  color.rgb = pow(color.rgb, vec3(0.95));
  
  gl_FragColor = color;
}
`;

export const nightVisionVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const nightVisionFragmentShader = `
uniform sampler2D tDiffuse;
uniform float time;
uniform float noiseIntensity;
uniform float bloomIntensity;
uniform float contrast;

varying vec2 vUv;

// Simple noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Luminance calculation
float luminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Convert to luminance
  float lum = luminance(color.rgb);
  
  // Apply contrast
  lum = (lum - 0.5) * contrast + 0.5;
  lum = clamp(lum, 0.0, 1.0);
  
  // Create night vision green color
  vec3 nightVisionColor = vec3(0.0, lum * 1.2, 0.0);
  
  // Add bloom effect
  float bloom = pow(lum, 3.0) * bloomIntensity;
  nightVisionColor += vec3(0.0, bloom * 0.3, 0.0);
  
  // Add noise grain
  float noise = (random(vUv + time * 0.1) - 0.5) * noiseIntensity;
  nightVisionColor += noise;
  
  // Add scanline effect
  float scanline = sin(vUv.y * 400.0 + time * 5.0) * 0.02;
  nightVisionColor -= scanline;
  
  // Vignette
  float vignette = 1.0 - length((vUv - 0.5) * 1.2);
  vignette = smoothstep(0.0, 1.0, vignette);
  nightVisionColor *= vignette;
  
  // Edge glow simulation
  float edgeGlow = 1.0 - pow(length(vUv - 0.5) * 2.0, 2.0);
  nightVisionColor *= edgeGlow * 0.3 + 0.7;
  
  gl_FragColor = vec4(nightVisionColor, 1.0);
}
`;

export const thermalVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const thermalFragmentShader = `
uniform sampler2D tDiffuse;
uniform float time;
uniform int mode; // 0: white hot, 1: black hot, 2: rainbow

varying vec2 vUv;

// Luminance calculation
float luminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

// Thermal color mapping
vec3 thermalColor(float temp) {
  // Rainbow thermal gradient
  if (temp < 0.25) {
    return mix(vec3(0.0, 0.0, 0.2), vec3(0.0, 0.0, 1.0), temp * 4.0);
  } else if (temp < 0.5) {
    return mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0), (temp - 0.25) * 4.0);
  } else if (temp < 0.75) {
    return mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (temp - 0.5) * 4.0);
  } else {
    return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (temp - 0.75) * 4.0);
  }
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float lum = luminance(color.rgb);
  
  // Add slight movement for realism
  lum += sin(time * 0.5 + vUv.x * 10.0) * 0.01;
  
  vec3 thermal;
  
  if (mode == 0) {
    // White hot
    thermal = vec3(lum);
  } else if (mode == 1) {
    // Black hot
    thermal = vec3(1.0 - lum);
  } else {
    // Rainbow/FLIR
    thermal = thermalColor(lum);
  }
  
  // Add thermal noise
  float noise = fract(sin(dot(vUv + time * 0.001, vec2(12.9898, 78.233))) * 43758.5453);
  thermal += (noise - 0.5) * 0.05;
  
  // Add slight blur simulation
  thermal = pow(thermal, vec3(0.95));
  
  gl_FragColor = vec4(thermal, 1.0);
}
`;

// Shader uniforms type definitions
export interface CRTUniforms {
  tDiffuse: { value: unknown };
  time: { value: number };
  scanlineIntensity: { value: number };
  vignetteIntensity: { value: number };
  chromaticAberration: { value: number };
  distortion: { value: number };
}

export interface NightVisionUniforms {
  tDiffuse: { value: unknown };
  time: { value: number };
  noiseIntensity: { value: number };
  bloomIntensity: { value: number };
  contrast: { value: number };
}

export interface ThermalUniforms {
  tDiffuse: { value: unknown };
  time: { value: number };
  mode: { value: number };
}
