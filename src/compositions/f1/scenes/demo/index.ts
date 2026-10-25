import { SceneProps } from "../../manifest";
import { Demo1 } from "./demo1";
import { Demo2 } from "./demo2";
import { Demo3 } from "./demo3";
import { Demo4 } from "./demo4";
import { Demo5 } from "./demo5";
import { Demo6 } from "./demo6";
import { Demo7 } from "./demo7";

export const scenes: Record<string, React.FC<SceneProps>> = {
  "demo-1": Demo1,
  "demo-2": Demo2,
  "demo-3": Demo3,
  "demo-4": Demo4,
  "demo-5": Demo5,
  "demo-6": Demo6,
  "demo-7": Demo7,
};
