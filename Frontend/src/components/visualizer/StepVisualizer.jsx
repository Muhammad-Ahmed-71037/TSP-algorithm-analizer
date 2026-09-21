import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Primitives';
import { humanizeDescription } from '../../utils/format';

const SPEED_MS = { Slow: 1400, Normal: 800, Fast: 350 };

/**
 * Generic playback controller for algorithm step histories. Renders the
 * transport controls + step counter + the step's description, and calls
 * `onStepChange(step, index)` on every change so the parent can sync
 * highlighted nodes/edges in the map/graph view and any algorithm-specific
 * side panel.
 */
export default function StepVisualizer({ steps = [], cities = [], onStepChange }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('Normal');
  const timerRef = useRef(null);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    onStepChange?.(steps[index] ?? null, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, steps]);

  useEffect(() => {
    if (!playing) return undefined;
    if (index >= steps.length - 1) {
      setPlaying(false);
      return undefined;
    }
    timerRef.current = setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), SPEED_MS[speed]);
    return () => clearTimeout(timerRef.current);
  }, [playing, index, speed, steps.length]);

  if (steps.length === 0) return null;

  const step = steps[index];
  const atStart = index === 0;
  const atEnd = index === steps.length - 1;

  return (
    <div className="rounded-xl border border-[#E5BEBE] bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <p className="font-data text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
          STEP {index + 1} / {steps.length}
        </p>
        <div className="flex items-center gap-1">
          {Object.keys(SPEED_MS).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                speed === s
                  ? 'bg-[#8EA66B] text-white font-semibold shadow-2xs'
                  : 'text-[#66615A] hover:text-[#1E1E1E] hover:bg-[#FFDCDC]/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#252525] leading-relaxed mb-4 min-h-[40px] font-medium">{humanizeDescription(step?.description, cities)}</p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" icon={ChevronLeft} disabled={atStart} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
          Previous
        </Button>
        {playing ? (
          <Button variant="secondary" size="sm" icon={Pause} onClick={() => setPlaying(false)}>
            Pause
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon={Play} disabled={atEnd} onClick={() => setPlaying(true)}>
            Play
          </Button>
        )}
        <Button variant="outline" size="sm" icon={ChevronRight} disabled={atEnd} onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}>
          Next
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={RotateCcw}
          onClick={() => {
            setPlaying(false);
            setIndex(0);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
