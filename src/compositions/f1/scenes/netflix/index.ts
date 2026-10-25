import { SceneProps } from "../../manifest";
import { Netflix1 } from "./Netflix1";
import { Netflix2 } from "./Netflix2";
import { Netflix3 } from "./Netflix3";
import { Netflix4 } from "./Netflix4";
import { Netflix5 } from "./Netflix5";

export const scenes: Record<string, React.FC<SceneProps>> = {
  "netflix-1": Netflix1,
  "netflix-2": Netflix2,
  "netflix-3": Netflix3,
  "netflix-4": Netflix4,
  "netflix-5": Netflix5,
};
