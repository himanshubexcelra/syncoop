import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { d as defineCustomElement$2 } from './reaction-pathway2.js';

const mock$4 = [
  {
    id: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "molecule",
    smiles: "NCCCC(=O)O",
    score: "$0.73",
  },
  {
    id: "53edcccb57524c609ced90ec218d175b",
    parentId: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "reaction",
  },
  {
    id: "22e637ae8aba45ddabc630946dc30538",
    parentId: "53edcccb57524c609ced90ec218d175b",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)CCCNC(=O)OC(C)(C)C",
    score: null,
  },
  {
    id: "64d24e2b84ad4cb8961bf458e8adf72a",
    parentId: "22e637ae8aba45ddabc630946dc30538",
    type: "reaction",
    score: 3,
    name: "Photocatalytic Decarboxylative Conjugate Addition (PDC) of Carboxylic Acids to Electron-Deficient Alkenes and Alkynes",
    condition: "Stage 1: 1h, 65 degree, Iron(III) chloride), Lithium-aluminum hydride, Anisole, Benzene, Tetrahydrofuran, Dichloromethane, CHF303S Trimfluoromethane sulfonic and C6H18LiNSi2",
    reactionCount: 50,
    doi: "10.1021/acs.orglett.7b01111",
  },
  {
    id: "ac7824333d054cb090fbd3449a85e164",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)NCC(=O)O",
    score: "$2.256",
  },
  {
    id: "8277ec4940274546af6e605544c26439",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "C=CC(=O)OC(C)(C)C",
    isRegulated: true,
    isProtected: true,
    publishedMoleculeCount: 55,
    score: "$0.62",
    isInInventory: true,
  },
];

const mock$3 = [
  {
    id: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "molecule",
    smiles: "NCCCC(=O)O",
    score: "$0.73",
  },
  {
    id: "53edcccb57524c609ced90ec218d175b",
    parentId: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "reaction",
  },
  {
    id: "22e637ae8aba45ddabc630946dc30538",
    parentId: "53edcccb57524c609ced90ec218d175b",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)CCCNC(=O)OC(C)(C)C",
    score: null,
  },
  {
    id: "64d24e2b84ad4cb8961bf458e8adf72a",
    parentId: "22e637ae8aba45ddabc630946dc30538",
    type: "reaction",
    score: 3,
    name: "Photocatalytic Decarboxylative Conjugate Addition (PDC) of Carboxylic Acids to Electron-Deficient Alkenes and Alkynes",
    condition: "Stage 1: 1h, 65 degree, Iron(III) chloride), Lithium-aluminum hydride, Anisole, Benzene, Tetrahydrofuran, Dichloromethane, CHF303S Trimfluoromethane sulfonic and C6H18LiNSi2",
    reactionCount: 50,
    doi: "10.1021/acs.orglett.7b01111",
  },
  {
    id: "ac7824333d054cb090fbd3449a85e164",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)NCC(=O)O",
    score: "$2.256",
  },
  {
    id: "8277ec4940274546af6e605544c26439",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "C=CC(=O)OC(C)(C)C",
    isRegulated: true,
    score: "$0.62",
    isInInventory: true,
  },
];

const mock$2 = [
  {
    id: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "molecule",
    smiles: "NCCCC(=O)O",
    score: "$0.73",
  },
  {
    id: "53edcccb57524c609ced90ec218d175b",
    parentId: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "reaction",
  },
  {
    id: "22e637ae8aba45ddabc630946dc30538",
    parentId: "53edcccb57524c609ced90ec218d175b",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)CCCNC(=O)OC(C)(C)C",
    score: null,
  },
  {
    id: "64d24e2b84ad4cb8961bf458e8adf72a",
    parentId: "22e637ae8aba45ddabc630946dc30538",
    type: "reaction",
    score: 3,
    name: "Photocatalytic Decarboxylative Conjugate Addition (PDC) of Carboxylic Acids to Electron-Deficient Alkenes and Alkynes",
    condition: "Stage 1: 1h, 65 degree, Iron(III) chloride), Lithium-aluminum hydride, Anisole, Benzene, Tetrahydrofuran, Dichloromethane, CHF303S Trimfluoromethane sulfonic and C6H18LiNSi2",
    reactionCount: 50,
    doi: "10.1021/acs.orglett.7b01111",
  },
  {
    id: "ac7824333d054cb090fbd3449a85e164",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)NCC(=O)O",
    score: "$2.256",
  },
  {
    id: "8277ec4940274546af6e605544c26439",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "C=CC(=O)OC(C)(C)C",
    isProtected: true,
    score: "$0.62",
    isInInventory: true,
  },
];

const mock$1 = [
  {
    id: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "molecule",
    smiles: "NCCCC(=O)O",
    score: "$0.73",
  },
  {
    id: "53edcccb57524c609ced90ec218d175b",
    parentId: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "reaction",
  },
  {
    id: "22e637ae8aba45ddabc630946dc30538",
    parentId: "53edcccb57524c609ced90ec218d175b",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)CCCNC(=O)OC(C)(C)C",
    score: null,
  },
  {
    id: "64d24e2b84ad4cb8961bf458e8adf72a",
    parentId: "22e637ae8aba45ddabc630946dc30538",
    type: "reaction",
    score: 3,
    name: "Photocatalytic Decarboxylative Conjugate Addition (PDC) of Carboxylic Acids to Electron-Deficient Alkenes and Alkynes",
    condition: "Stage 1: 1h, 65 degree, Iron(III) chloride), Lithium-aluminum hydride, Anisole, Benzene, Tetrahydrofuran, Dichloromethane, CHF303S Trimfluoromethane sulfonic and C6H18LiNSi2",
    reactionCount: 50,
    doi: "10.1021/acs.orglett.7b01111",
  },
  {
    id: "ac7824333d054cb090fbd3449a85e164",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)NCC(=O)O",
    score: "$2.256",
  },
  {
    id: "8277ec4940274546af6e605544c26439",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "C=CC(=O)OC(C)(C)C",
    publishedMoleculeCount: 55,
    score: "$0.62",
    isInInventory: true,
  },
];

const mock = [
  {
    id: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "molecule",
    smiles: "NCCCC(=O)O",
    score: "$0.73",
  },
  {
    id: "53edcccb57524c609ced90ec218d175b",
    parentId: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "reaction",
  },
  {
    id: "22e637ae8aba45ddabc630946dc30538",
    parentId: "53edcccb57524c609ced90ec218d175b",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)CCCNC(=O)OC(C)(C)C",
    score: null,
  },
  {
    id: "64d24e2b84ad4cb8961bf458e8adf72a",
    parentId: "22e637ae8aba45ddabc630946dc30538",
    type: "reaction",
    score: 3,
    name: "Photocatalytic Decarboxylative Conjugate Addition (PDC) of Carboxylic Acids to Electron-Deficient Alkenes and Alkynes",
    condition: "Stage 1: 1h, 65 degree, Iron(III) chloride), Lithium-aluminum hydride, Anisole, Benzene, Tetrahydrofuran, Dichloromethane, CHF303S Trimfluoromethane sulfonic and C6H18LiNSi2",
    reactionCount: 50,
    doi: "10.1021/acs.orglett.7b01111",
  },
  {
    id: "ac7824333d054cb090fbd3449a85e164",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "CC(C)(C)OC(=O)NCC(=O)O",
    score: "$2.256",
  },
  {
    id: "8277ec4940274546af6e605544c26439",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "C=CC(=O)OC(C)(C)C",
    score: "$0.62",
    isInInventory: true,
  },
];

const dataMapper = {
  "general": mock$4,
  "honeycomb-regulated-data": mock$3,
  "honeycomb-protected-data": mock$2,
  "honeycomb-published-data": mock$1,
  "honeycomb-omitted-data": mock,
};
const ReactionPathwayTestWrapper$1 = /*@__PURE__*/ proxyCustomElement(class ReactionPathwayTestWrapper extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
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
}, [0, "reaction-pathway-test-wrapper", {
    "type": [1],
    "enable3D": [4, "enable-3-d"],
    "displayScore": [4, "display-score"],
    "displayHoneycomb": [4, "display-honeycomb"],
    "displayPathway": [4, "display-pathway"],
    "displayReactionReference": [4, "display-reaction-reference"],
    "displayReactionName": [4, "display-reaction-name"],
    "displayReactionCondition": [4, "display-reaction-condition"]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["reaction-pathway-test-wrapper", "reaction-pathway"];
  components.forEach(tagName => { switch (tagName) {
    case "reaction-pathway-test-wrapper":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, ReactionPathwayTestWrapper$1);
      }
      break;
    case "reaction-pathway":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
  } });
}

const ReactionPathwayTestWrapper = ReactionPathwayTestWrapper$1;
const defineCustomElement = defineCustomElement$1;

export { ReactionPathwayTestWrapper, defineCustomElement };

//# sourceMappingURL=reaction-pathway-test-wrapper.js.map