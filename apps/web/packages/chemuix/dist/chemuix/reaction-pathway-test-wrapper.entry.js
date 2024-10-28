import { r as registerInstance, h } from './index-33974f89.js';

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
const ReactionPathwayTestWrapper = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
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
};

export { ReactionPathwayTestWrapper as reaction_pathway_test_wrapper };

//# sourceMappingURL=reaction-pathway-test-wrapper.entry.js.map