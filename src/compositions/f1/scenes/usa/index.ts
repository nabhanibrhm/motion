import { SceneProps } from "../../manifest";
import { Usa1 } from "./Usa1";
import { Usa2 } from "./Usa2";
import { Usa3 } from "./Usa3";
import { Usa4 } from "./Usa4";

export const scenes: Record<string, React.FC<SceneProps>> = {
  "usa-1": Usa1,
  "usa-2": Usa2,
  "usa-3": Usa3,
  "usa-4": Usa4,
};
