'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  Viewer,
  Ion,
  Color,
  PostProcessStage,
  Cartesian3,
  Math as CesiumMath,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface GlobeProps {
  visualMode: 'normal' | 'crt' | 'nightVision' | 'thermal';
  onViewerReady?: (viewer: Viewer) => void;
}

export default function Globe({ visualMode, onViewerReady }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const isLoadedRef = useRef(false);
  const visualModeRef = useRef(visualMode);

  // Keep visualModeRef in sync
  useEffect(() => {
    visualModeRef.current = visualMode;
  }, [visualMode]);

  // Post-processing effect application
  const applyVisualEffect = useCallback((mode: string, viewer: Viewer) => {
    const scene = viewer.scene;

    // Remove existing post-process stages
    scene.postProcessStages.removeAll();

    if (mode === 'normal') {
      // Default view - no additional effects
      scene.backgroundColor = Color.fromCssColorString('#000000');
      return;
    }

    // Create post-process stage based on mode
    let fragmentShader = '';
    const uniforms: Record<string, () => unknown> = {};

    switch (mode) {
      case 'crt':
        fragmentShader = `
          uniform sampler2D colorTexture;
          uniform float time;
          
          in vec2 v_textureCoordinates;
          
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
            vec2 uv = curve(v_textureCoordinates);
            
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
              return;
            }
            
            float offset = 0.002;
            float r = texture(colorTexture, uv + vec2(offset, 0.0)).r;
            float g = texture(colorTexture, uv).g;
            float b = texture(colorTexture, uv - vec2(offset, 0.0)).b;
            vec4 color = vec4(r, g, b, 1.0);
            
            float scanline = sin(uv.y * 800.0) * 0.04;
            color.rgb -= scanline;
            
            float flicker = sin(czm_frameNumber / 60.0) * 0.01;
            color.rgb += flicker;
            
            float vignette = 1.0 - length((v_textureCoordinates - 0.5) * 1.5);
            color.rgb *= vignette;
            
            color.rgb = mix(color.rgb, vec3(color.r * 0.9, color.g * 1.05, color.b * 0.9), 0.1);
            
            gl_FragColor = color;
          }
        `;
        uniforms.time = () => performance.now() / 1000;
        break;

      case 'nightVision':
        fragmentShader = `
          uniform sampler2D colorTexture;
          uniform float time;
          
          in vec2 v_textureCoordinates;
          
          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }
          
          float luminance(vec3 color) {
            return dot(color, vec3(0.299, 0.587, 0.114));
          }
          
          void main() {
            vec4 color = texture(colorTexture, v_textureCoordinates);
            
            float lum = luminance(color.rgb);
            lum = (lum - 0.5) * 1.5 + 0.5;
            lum = clamp(lum, 0.0, 1.0);
            
            vec3 nightVisionColor = vec3(0.0, lum * 1.2, 0.0);
            
            float bloom = pow(lum, 3.0) * 0.8;
            nightVisionColor += vec3(0.0, bloom * 0.3, 0.0);
            
            float noise = (random(v_textureCoordinates + czm_frameNumber / 600.0) - 0.5) * 0.15;
            nightVisionColor += noise;
            
            float scanline = sin(v_textureCoordinates.y * 400.0 + czm_frameNumber / 60.0) * 0.02;
            nightVisionColor -= scanline;
            
            float vignette = 1.0 - length((v_textureCoordinates - 0.5) * 1.2);
            vignette = smoothstep(0.0, 1.0, vignette);
            nightVisionColor *= vignette;
            
            gl_FragColor = vec4(nightVisionColor, 1.0);
          }
        `;
        uniforms.time = () => performance.now() / 1000;
        break;

      case 'thermal':
        fragmentShader = `
          uniform sampler2D colorTexture;
          uniform float time;
          
          in vec2 v_textureCoordinates;
          
          float luminance(vec3 color) {
            return dot(color, vec3(0.299, 0.587, 0.114));
          }
          
          vec3 thermalColor(float temp) {
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
            vec4 color = texture(colorTexture, v_textureCoordinates);
            float lum = luminance(color.rgb);
            
            lum += sin(czm_frameNumber / 120.0 + v_textureCoordinates.x * 10.0) * 0.01;
            
            vec3 thermal = thermalColor(lum);
            
            float noise = fract(sin(dot(v_textureCoordinates + czm_frameNumber / 1000.0, vec2(12.9898, 78.233))) * 43758.5453);
            thermal += (noise - 0.5) * 0.05;
            
            gl_FragColor = vec4(thermal, 1.0);
          }
        `;
        uniforms.time = () => performance.now() / 1000;
        break;
    }

    if (fragmentShader) {
      const stage = new PostProcessStage({
        fragmentShader,
        uniforms,
      });
      scene.postProcessStages.add(stage);
    }
  }, []);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // Set Cesium Ion access token
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTQxMjVhYy1hNDJjLTRhNDEtODI0ZC05Y2IyN2JhMzVjNjUiLCJpZCI6MjU5LCJpYXQiOjE3MzQwNTI5MjV9.SdVVzxh3L6HKcMk_xYzZ-8GwZf3NbBKwxGjLhXqFYKI';

    const initViewer = async () => {
      try {
        // Create viewer without terrain for simplicity
        const viewer = new Viewer(containerRef.current!, {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: true,
          selectionIndicator: true,
          shadows: true,
          shouldAnimate: true,
        });

        // Enable lighting based on sun position
        viewer.scene.globe.enableLighting = true;

        // Set initial camera position
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(-74.006, 40.7128, 20000000),
          orientation: {
            heading: 0,
            pitch: -CesiumMath.PI_OVER_TWO,
            roll: 0,
          },
          duration: 0,
        });

        // Add atmosphere effects
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0001;

        viewerRef.current = viewer;
        isLoadedRef.current = true;
        
        // Apply initial visual effect
        applyVisualEffect(visualModeRef.current, viewer);
        
        if (onViewerReady) {
          onViewerReady(viewer);
        }
      } catch (error) {
        console.error('Failed to initialize Cesium:', error);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        isLoadedRef.current = false;
      }
    };
  }, [onViewerReady, applyVisualEffect]);

  // Apply visual effects when mode changes
  useEffect(() => {
    if (isLoadedRef.current && viewerRef.current) {
      applyVisualEffect(visualMode, viewerRef.current);
    }
  }, [visualMode, applyVisualEffect]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="cesium-container w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="flex justify-between p-4">
          <div className="text-cyan-400 font-mono text-xs opacity-70">
            <div>WORLDVIEW v2.0</div>
            <div>SECURE CONNECTION</div>
          </div>
          <div className="text-cyan-400 font-mono text-xs opacity-70 text-right">
            <div id="hud-coords">LAT: 00.0000° | LON: 00.0000°</div>
            <div id="hud-alt">ALT: 0 KM</div>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-1/2 w-px h-4 bg-cyan-500/50 -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-px h-4 bg-cyan-500/50 -translate-x-1/2" />
          <div className="absolute left-0 top-1/2 w-4 h-px bg-cyan-500/50 -translate-y-1/2" />
          <div className="absolute right-0 top-1/2 w-4 h-px bg-cyan-500/50 -translate-y-1/2" />
          <div className="absolute inset-4 border border-cyan-500/30 rounded-full" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/50" />
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cyan-500/50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-cyan-500/50" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-500/50" />

      {/* Scan line effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
        }}
      />
    </div>
  );
}
