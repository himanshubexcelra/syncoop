export type DataMapperType = keyof typeof dataMapper;
declare const dataMapper: {
  readonly general: import("../reaction-pathway").Node[];
  readonly "honeycomb-regulated-data": import("../reaction-pathway").Node[];
  readonly "honeycomb-protected-data": import("../reaction-pathway").Node[];
  readonly "honeycomb-published-data": import("../reaction-pathway").Node[];
  readonly "honeycomb-omitted-data": import("../reaction-pathway").Node[];
};
export declare class ReactionPathwayTestWrapper {
  type: DataMapperType;
  enable3D: boolean;
  displayScore: boolean;
  displayHoneycomb: boolean;
  displayPathway: boolean;
  displayReactionReference: boolean;
  displayReactionName: boolean;
  displayReactionCondition: boolean;
  render(): any;
}
export {};
