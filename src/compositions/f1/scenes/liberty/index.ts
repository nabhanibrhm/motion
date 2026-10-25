import { SceneProps } from "../../manifest";
import { Liberty1 } from "./scene1";
import { Liberty2 } from "./scene2";
import { Liberty3 } from "./scene3";
import { Liberty4 } from "./scene4";
import { Liberty5 } from "./scene5";
import { Liberty6 } from "./scene6";

export const scenes: Record<string, React.FC<SceneProps>> = {
  "liberty-1": Liberty1,
  "liberty-2": Liberty2,
  "liberty-3": Liberty3,
  "liberty-4": Liberty4,
  "liberty-5": Liberty5,
  "liberty-6": Liberty6,
};
