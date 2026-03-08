'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Rewind, 
  FastForward,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface TimelineScrubberProps {
  currentTime: Date;
  startTime: Date;
  endTime: Date;
  isPlaying: boolean;
  playbackSpeed: number;
  progress: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (progress: number) => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
}

export default function TimelineScrubber({
  currentTime,
  startTime,
  endTime,
  isPlaying,
  playbackSpeed,
  progress,
  onPlayPause,
  onSpeedChange,
  onProgressChange,
  onJumpToStart,
  onJumpToEnd,
  onStepForward,
  onStepBackward,
}: TimelineScrubberProps) {
  
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm:ss');
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const handleProgressChange = (value: number[]) => {
    onProgressChange(value[0]);
  };

  return (
    <div className="bg-[#0a0a0f]/95 backdrop-blur-sm border-t border-cyan-900/50 p-4">
      <div className="flex items-center gap-6">
        {/* Current Time Display */}
        <div className="min-w-[200px] font-mono">
          <div className="text-cyan-400 text-lg tracking-wider">
            {formatTime(currentTime)}
          </div>
          <div className="text-gray-500 text-xs">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50"
            onClick={onJumpToStart}
            title="Jump to start"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50"
            onClick={onStepBackward}
            title="Step backward 5 min"
          >
            <Rewind className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className={`h-10 w-10 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
            onClick={onPlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50"
            onClick={onStepForward}
            title="Step forward 5 min"
          >
            <FastForward className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50"
            onClick={onJumpToEnd}
            title="Jump to end"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500 min-w-[60px]">
              {formatTime(startTime)}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={0.1}
                className="w-full"
              />
              {/* Timeline markers */}
              <div className="absolute top-full left-0 right-0 flex justify-between px-1 mt-1">
                {[0, 25, 50, 75, 100].map((marker) => (
                  <div
                    key={marker}
                    className="w-px h-1 bg-cyan-900"
                  />
                ))}
              </div>
            </div>
            <span className="text-xs font-mono text-gray-500 min-w-[60px]">
              {formatTime(endTime)}
            </span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">SPEED:</span>
          <Select value={playbackSpeed.toString()} onValueChange={(value) => onSpeedChange(parseInt(value))}>
            <SelectTrigger className="w-16 h-8 bg-[#111] border-cyan-900/50 text-cyan-400 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-cyan-900/50">
              <SelectItem value="1" className="text-cyan-400">1x</SelectItem>
              <SelectItem value="2" className="text-cyan-400">2x</SelectItem>
              <SelectItem value="4" className="text-cyan-400">4x</SelectItem>
              <SelectItem value="8" className="text-cyan-400">8x</SelectItem>
              <SelectItem value="16" className="text-cyan-400">16x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Live Mode */}
        <Button
          variant="outline"
          size="sm"
          className="border-cyan-800 text-cyan-400 hover:bg-cyan-950/50"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
          LIVE
        </Button>
      </div>

      {/* Secondary info bar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-900/30">
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <span>REPLAY MODE</span>
          <span>|</span>
          <span>24H RANGE</span>
          <span>|</span>
          <span>UTC OFFSET: +0</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-400 hover:text-cyan-400">
            <Calendar className="h-3 w-3 mr-1" />
            SELECT RANGE
          </Button>
        </div>
      </div>
    </div>
  );
}
