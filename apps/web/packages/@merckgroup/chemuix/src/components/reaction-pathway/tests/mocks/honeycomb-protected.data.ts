import { Node } from "../../reaction-pathway";

const mock: Node[] = [
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
    condition:
      "Stage 1: 1h, 65 degree, Iron(III) chloride), Lithium-aluminum hydride, Anisole, Benzene, Tetrahydrofuran, Dichloromethane, CHF303S Trimfluoromethane sulfonic and C6H18LiNSi2",
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

export default mock;
