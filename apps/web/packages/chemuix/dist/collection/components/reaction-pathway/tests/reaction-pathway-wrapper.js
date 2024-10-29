import { h } from "@stencil/core";
import generalData from "./mocks/general.data";
import honeycombRegulatedData from "./mocks/honeycomb-regulated.data";
import honeycombProtectedData from "./mocks/honeycomb-protected.data";
import honeycombPublishedData from "./mocks/honeycomb-published.data";
import honeycombOmittedData from "./mocks/honeycomb-omitted.data";
const dataMapper = {
  "general": generalData,
  "honeycomb-regulated-data": honeycombRegulatedData,
  "honeycomb-protected-data": honeycombProtectedData,
  "honeycomb-published-data": honeycombPublishedData,
  "honeycomb-omitted-data": honeycombOmittedData,
};
export class ReactionPathwayTestWrapper {
  constructor() {
    this.type = undefined;
    this.enable3D = false;
    this.displayScore = true;
    this.displayHoneycomb = true;
    this.displayPathway = true;
    this.displayReactionReference = true;
    this.displayReactionName = true;
    this.displayReactionCondition = true;
  }
  render() {
    return (h("reaction-pathway", { nodes: dataMapper[this.type], enable3D: this.enable3D, displayScore: this.displayScore, displayHoneycomb: this.displayHoneycomb, displayPathway: this.displayPathway, displayReactionReference: this.displayReactionReference, displayReactionName: this.displayReactionName, displayReactionCondition: this.displayReactionCondition }));
  }
  static get is() { return "reaction-pathway-test-wrapper"; }
  static get properties() {
    return {
      "type": {
        "type": "string",
        "mutable": false,
        "complexType": {
          "original": "DataMapperType",
          "resolved": "\"general\" | \"honeycomb-omitted-data\" | \"honeycomb-protected-data\" | \"honeycomb-published-data\" | \"honeycomb-regulated-data\"",
          "references": {
            "DataMapperType": {
              "location": "local",
              "path": "C:/Users/X270076/OneDrive - MerckGroup/compounds/packages/chemuix/src/components/reaction-pathway/tests/reaction-pathway-wrapper.tsx",
              "id": "src/components/reaction-pathway/tests/reaction-pathway-wrapper.tsx::DataMapperType"
            }
          }
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "type",
        "reflect": false
      },
      "enable3D": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "enable-3-d",
        "reflect": false,
        "defaultValue": "false"
      },
      "displayScore": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "display-score",
        "reflect": false,
        "defaultValue": "true"
      },
      "displayHoneycomb": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "display-honeycomb",
        "reflect": false,
        "defaultValue": "true"
      },
      "displayPathway": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "display-pathway",
        "reflect": false,
        "defaultValue": "true"
      },
      "displayReactionReference": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "display-reaction-reference",
        "reflect": false,
        "defaultValue": "true"
      },
      "displayReactionName": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "display-reaction-name",
        "reflect": false,
        "defaultValue": "true"
      },
      "displayReactionCondition": {
        "type": "boolean",
        "mutable": false,
        "complexType": {
          "original": "boolean",
          "resolved": "boolean",
          "references": {}
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [],
          "text": ""
        },
        "attribute": "display-reaction-condition",
        "reflect": false,
        "defaultValue": "true"
      }
    };
  }
}
//# sourceMappingURL=reaction-pathway-wrapper.js.map
