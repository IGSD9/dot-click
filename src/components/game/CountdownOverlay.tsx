"use client";

type CountdownOverlayProps = {
  count: number;
};

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          START IN
        </p>
        <p
          key={count}
          className="countdown-pop mt-2 text-8xl font-bold tabular-nums text-white sm:text-9xl"
        >
          {count}
        </p>
      </div>
    </div>
  );
}
