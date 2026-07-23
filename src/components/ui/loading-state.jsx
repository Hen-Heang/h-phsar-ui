import { PropagateLoader } from "react-spinners";

export function LoadingState({ color = "#0f766e" }) {
  return (
    <div className="flex h-96 items-center justify-center">
      <PropagateLoader color={color} />
    </div>
  );
}
