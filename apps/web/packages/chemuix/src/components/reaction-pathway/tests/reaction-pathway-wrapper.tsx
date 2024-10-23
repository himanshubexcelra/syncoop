import { Component, Prop, h } from "@stencil/core";

import generalData from "./mocks/general.data";
import honeycombRegulatedData from "./mocks/honeycomb-regulated.data";
import honeycombProtectedData from "./mocks/honeycomb-protected.data";
import honeycombPublishedData from "./mocks/honeycomb-published.data";
import honeycombOmittedData from "./mocks/honeycomb-omitted.data";

export type DataMapperType = keyof typeof dataMapper;

const dataMapper = {
  "general": generalData,
  "honeycomb-regulated-data": honeycombRegulatedData,
  "honeycomb-protected-data": honeycombProtectedData,
  "honeycomb-published-data": honeycombPublishedData,
  "honeycomb-omitted-data": honeycombOmittedData,
} as const;

@Component({
  tag: "reaction-pathway-test-wrapper",
})
export class ReactionPathwayTestWrapper {
  @Prop() type: DataMapperType;
  @Prop() enable3D: boolean = false;
  @Prop() displayScore: boolean = true;
  @Prop() displayHoneycomb: boolean = true;
  @Prop() displayPathway: boolean = true;
  @Prop() displayReactionReference: boolean = true;
  @Prop() displayReactionName: boolean = true;
  @Prop() displayReactionCondition: boolean = true;

  render() {
    return (
      <reaction-pathway
        nodes={dataMapper[this.type]}
        enable3D={this.enable3D}
        displayScore={this.displayScore}
        displayHoneycomb={this.displayHoneycomb}
        displayPathway={this.displayPathway}
        displayReactionReference={this.displayReactionReference}
        displayReactionName={this.displayReactionName}
        displayReactionCondition={this.displayReactionCondition}
      ></reaction-pathway>
    );
  }
}
