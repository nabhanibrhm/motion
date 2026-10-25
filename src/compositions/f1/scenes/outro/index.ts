import { SceneProps } from "../../manifest";
import { Outro1 } from "./Outro1";
import { Outro2 } from "./Outro2";
import { Outro3 } from "./Outro3";

export const scenes: Record<string, React.FC<SceneProps>> = {
  "outro-1": Outro1,
  "outro-2": Outro2,
  "outro-3": Outro3,
};
