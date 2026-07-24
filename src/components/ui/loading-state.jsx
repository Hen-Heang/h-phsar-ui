import { PropagateLoader } from "react-spinners";

export function LoadingState({ color = "#0f766e" }) {
  return (
    <div
      className="flex min-h-64 items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <PropagateLoader color={color} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
