import { useState, useCallback, useRef, useEffect } from 'react';

interface TimelineState {
  currentTime: Date;
  startTime: Date;
  endTime: Date;
  isPlaying: boolean;
  playbackSpeed: number;
}

export function useTimeline(initialStartTime?: Date, initialEndTime?: Date) {
  const now = new Date();
  const start = initialStartTime || new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  const end = initialEndTime || now;

  const [state, setState] = useState<TimelineState>({
    currentTime: start,
    startTime: start,
    endTime: end,
    isPlaying: false,
    playbackSpeed: 1,
  });

  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  const updateCurrentTime = useCallback((newTime: Date) => {
    setState(prev => ({
      ...prev,
      currentTime: newTime,
    }));
  }, []);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlayPause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, playbackSpeed: speed }));
  }, []);

  const setTimeRange = useCallback((start: Date, end: Date) => {
    setState(prev => ({
      ...prev,
      startTime: start,
      endTime: end,
      currentTime: start,
    }));
  }, []);

  const jumpToStart = useCallback(() => {
    setState(prev => ({ ...prev, currentTime: prev.startTime }));
  }, []);

  const jumpToEnd = useCallback(() => {
    setState(prev => ({ ...prev, currentTime: prev.endTime }));
  }, []);

  const stepForward = useCallback((minutes: number = 5) => {
    setState(prev => {
      const newTime = new Date(prev.currentTime.getTime() + minutes * 60 * 1000);
      return {
        ...prev,
        currentTime: newTime > prev.endTime ? prev.endTime : newTime,
      };
    });
  }, []);

  const stepBackward = useCallback((minutes: number = 5) => {
    setState(prev => {
      const newTime = new Date(prev.currentTime.getTime() - minutes * 60 * 1000);
      return {
        ...prev,
        currentTime: newTime < prev.startTime ? prev.startTime : newTime,
      };
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (state.isPlaying) {
      const animate = () => {
        const now = Date.now();
        const elapsed = now - lastUpdateRef.current;
        lastUpdateRef.current = now;

        setState(prev => {
          // Calculate time increment based on playback speed
          // 1x = 1 minute per second, 2x = 2 minutes per second, etc.
          const timeIncrement = (elapsed / 1000) * 60 * prev.playbackSpeed * 1000;
          const newTime = new Date(prev.currentTime.getTime() + timeIncrement);

          if (newTime >= prev.endTime) {
            return { ...prev, currentTime: prev.endTime, isPlaying: false };
          }

          return { ...prev, currentTime: newTime };
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      lastUpdateRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPlaying, state.playbackSpeed]);

  const progress = ((state.currentTime.getTime() - state.startTime.getTime()) / 
                    (state.endTime.getTime() - state.startTime.getTime())) * 100;

  return {
    ...state,
    progress,
    updateCurrentTime,
    play,
    pause,
    togglePlayPause,
    setPlaybackSpeed,
    setTimeRange,
    jumpToStart,
    jumpToEnd,
    stepForward,
    stepBackward,
  };
}
