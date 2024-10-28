import type { Components, JSX } from "../types/components";

interface ReactionPathway extends Components.ReactionPathway, HTMLElement {}
export const ReactionPathway: {
  prototype: ReactionPathway;
  new (): ReactionPathway;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
