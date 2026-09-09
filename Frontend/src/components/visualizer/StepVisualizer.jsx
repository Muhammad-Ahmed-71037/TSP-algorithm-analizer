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
    <div className="rounded-2xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-data text-xs font-semibold text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
          STEP {index + 1} / {steps.length}
        </p>
        <div className="flex items-center gap-1">
          {Object.keys(SPEED_MS).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                speed === s
                  ? 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)]'
                  : 'text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-4 min-h-[40px]">{humanizeDescription(step?.description, cities)}</p>

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
