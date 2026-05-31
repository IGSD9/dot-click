"use client";

type CountdownOverlayProps = {
  count: number;
};

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          START IN
        </p>
        <p className="mt-2 text-8xl font-bold tabular-nums text-white">{count}</p>
      </div>
    </div>
  );
}
