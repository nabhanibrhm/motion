import { SceneProps } from "../../manifest";
import { Hook1 } from "./Hook1";
import { Hook2 } from "./Hook2";
import { Hook3 } from "./Hook3";
import { Hook4 } from "./Hook4";

export const scenes: Record<string, React.FC<SceneProps>> = {
  "hook-1": Hook1,
  "hook-2": Hook2,
  "hook-3": Hook3,
  "hook-4": Hook4,
};
