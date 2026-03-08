'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Satellite, 
  Plane, 
  Car, 
  Video, 
  ChevronDown, 
  ChevronRight,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useState } from 'react';

interface LayerState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  count: number;
  lastUpdate: Date | null;
}

interface SidePanelProps {
  layers: Record<string, LayerState>;
  onLayerToggle: (layer: string) => void;
  visualMode: string;
  onVisualModeChange: (mode: string) => void;
  layerOpacity: Record<string, number>;
  onOpacityChange: (layer: string, value: number) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export default function SidePanel({
  layers,
  onLayerToggle,
  visualMode,
  onVisualModeChange,
  layerOpacity,
  onOpacityChange,
  selectedCity,
  onCityChange,
}: SidePanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    layers: true,
    visual: true,
    settings: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const layerIcons: Record<string, React.ReactNode> = {
    satellites: <Satellite className="w-4 h-4" />,
    aviation: <Plane className="w-4 h-4" />,
    traffic: <Car className="w-4 h-4" />,
    cctv: <Video className="w-4 h-4" />,
  };

  const layerColors: Record<string, string> = {
    satellites: 'text-purple-400',
    aviation: 'text-cyan-400',
    traffic: 'text-yellow-400',
    cctv: 'text-red-400',
  };

  return (
    <div className="w-72 bg-[#0a0a0f]/95 backdrop-blur-sm border-r border-cyan-900/50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-cyan-900/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="font-mono text-sm text-cyan-400 tracking-wider">WORLDVIEW</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">GEOSPATIAL INTELLIGENCE</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
        {/* Visual Mode */}
        <Collapsible open={expandedSections.visual} onOpenChange={() => toggleSection('visual')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 hover:bg-cyan-950/20 cursor-pointer">
              <span className="text-xs font-mono text-gray-400 tracking-wider">VISUAL MODE</span>
              {expandedSections.visual ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-cyan-400" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <Select value={visualMode} onValueChange={onVisualModeChange}>
                <SelectTrigger className="bg-[#111] border-cyan-900/50 text-cyan-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-cyan-900/50">
                  <SelectItem value="normal" className="text-cyan-400 focus:bg-cyan-950/50">NORMAL</SelectItem>
                  <SelectItem value="crt" className="text-green-400 focus:bg-cyan-950/50">CRT MONITOR</SelectItem>
                  <SelectItem value="nightVision" className="text-green-400 focus:bg-cyan-950/50">NIGHT VISION</SelectItem>
                  <SelectItem value="thermal" className="text-orange-400 focus:bg-cyan-950/50">THERMAL/FLIR</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={visualMode === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs ${visualMode === 'normal' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-cyan-800 text-cyan-400'}`}
                  onClick={() => onVisualModeChange('normal')}
                >
                  NORMAL
                </Button>
                <Button 
                  variant={visualMode === 'crt' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs ${visualMode === 'crt' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-cyan-800 text-cyan-400'}`}
                  onClick={() => onVisualModeChange('crt')}
                >
                  CRT
                </Button>
                <Button 
                  variant={visualMode === 'nightVision' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs ${visualMode === 'nightVision' ? 'bg-green-600 hover:bg-green-700' : 'border-green-800 text-green-400'}`}
                  onClick={() => onVisualModeChange('nightVision')}
                >
                  NVG
                </Button>
                <Button 
                  variant={visualMode === 'thermal' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs ${visualMode === 'thermal' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-800 text-orange-400'}`}
                  onClick={() => onVisualModeChange('thermal')}
                >
                  FLIR
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Data Layers */}
        <Collapsible open={expandedSections.layers} onOpenChange={() => toggleSection('layers')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 hover:bg-cyan-950/20 cursor-pointer border-t border-cyan-900/30">
              <span className="text-xs font-mono text-gray-400 tracking-wider">DATA LAYERS</span>
              {expandedSections.layers ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-cyan-400" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {Object.entries(layers).map(([key, layer]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={layerColors[key]}>{layerIcons[key]}</span>
                      <Label className="text-xs font-mono text-gray-300 uppercase">
                        {key}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      {layer.loading && <Activity className="w-3 h-3 text-yellow-400 animate-spin" />}
                      {layer.enabled && !layer.loading && (
                        layer.error ? 
                          <WifiOff className="w-3 h-3 text-red-400" /> : 
                          <Wifi className="w-3 h-3 text-green-400" />
                      )}
                      <Switch
                        checked={layer.enabled}
                        onCheckedChange={() => onLayerToggle(key)}
                        className="data-[state=checked]:bg-cyan-600"
                      />
                    </div>
                  </div>
                  
                  {layer.enabled && (
                    <>
                      <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                        <span>COUNT: {layer.count}</span>
                        <span>{formatTime(layer.lastUpdate)}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono text-gray-500">
                          <span>OPACITY</span>
                          <span>{Math.round(layerOpacity[key] * 100)}%</span>
                        </div>
                        <Slider
                          value={[layerOpacity[key] * 100]}
                          onValueChange={(value) => onOpacityChange(key, value[0] / 100)}
                          max={100}
                          step={1}
                          className="[&_[role=slider]]:bg-cyan-400"
                        />
                      </div>
                    </>
                  )}
                  
                  {layer.error && (
                    <div className="text-xs text-red-400 font-mono">{layer.error}</div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Traffic City Selection */}
        {layers.traffic?.enabled && (
          <div className="px-4 py-3 border-t border-cyan-900/30">
            <Label className="text-xs font-mono text-gray-400 tracking-wider">TRAFFIC CITY</Label>
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="mt-2 bg-[#111] border-cyan-900/50 text-cyan-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-cyan-900/50">
                <SelectItem value="new-york" className="text-cyan-400">NEW YORK</SelectItem>
                <SelectItem value="london" className="text-cyan-400">LONDON</SelectItem>
                <SelectItem value="tokyo" className="text-cyan-400">TOKYO</SelectItem>
                <SelectItem value="paris" className="text-cyan-400">PARIS</SelectItem>
                <SelectItem value="sydney" className="text-cyan-400">SYDNEY</SelectItem>
                <SelectItem value="dubai" className="text-cyan-400">DUBAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Settings */}
        <Collapsible open={expandedSections.settings} onOpenChange={() => toggleSection('settings')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 hover:bg-cyan-950/20 cursor-pointer border-t border-cyan-900/30">
              <span className="text-xs font-mono text-gray-400 tracking-wider">SETTINGS</span>
              {expandedSections.settings ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-cyan-400" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">AUTO-ROTATE</Label>
                <Switch className="data-[state=checked]:bg-cyan-600" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">SHOW GRID</Label>
                <Switch className="data-[state=checked]:bg-cyan-600" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">TERRAIN</Label>
                <Switch defaultChecked className="data-[state=checked]:bg-cyan-600" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Status Footer */}
      <div className="p-3 border-t border-cyan-900/50 bg-[#0a0a0f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-gray-500">SYSTEM ONLINE</span>
          </div>
          <Badge variant="outline" className="text-[10px] border-cyan-800 text-cyan-400">
            CLASSIFIED
          </Badge>
        </div>
      </div>
    </div>
  );
}
