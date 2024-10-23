"use client";
import { useEffect } from "react";
import { defineCustomElements } from "../../packages/@merckgroup/chemuix/dist/esm/loader";
import { LibraryDataNode } from "@/lib/definition";

const nodes1: LibraryDataNode[] = [
  {
    id: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "molecule",
    smiles: "CC(=O)NC1=CC=CC=C1CC(=O)Cl",
  },
  {
    id: "53edcccb57524c609ced90ec218d175b",
    parentId: "06160e59c3ed4901a7fbdc133f34ba79",
    type: "reaction",
    score: 3,
    name: "Synthesis of acyl chlorides from esters",
    condition: "1. LiOH.H2O.THF 2.SOCl2.DCM or DMF",
    reactionCount: 50,
    doi: "110.1016/j.tet.2007.04.043",
  },
  {
    id: "22e637ae8aba45ddabc630946dc30",
    parentId: "53edcccb57524c609ced90ec218d175b",
    type: "molecule",
    smiles: "O=S(Cl)Cl",
    score: null,
  },
  {
    id: "22e637ae8aba45ddabc630946dc30538",
    parentId: "53edcccb57524c609ced90ec218d175b",
    type: "molecule",
    smiles: "CCOC(=O)CC1=CC=CC=C1NC(C)=O",
    score: null,
  },
  {
    id: "64d24e2b84ad4cb8961bf458e8adf72a",
    parentId: "22e637ae8aba45ddabc630946dc30538",
    type: "reaction",
    score: 3,
    name: "Photoredox Cross-Electrophile Coupling of alpha-Chloro Carbonyls with Aryl Halides",
    condition: "S[Ir]-photocat.[Ni]-cat.silane reagent.base.blue light",
    reactionCount: 50,
    doi: "10.1002/anie.201909072",
  },
  {
    id: "ac7824333d054cb090fbd3449a85e164",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "CCOC(=O)CCl",
  },
  {
    id: "8277ec4940274546af6e605544c26439",
    parentId: "64d24e2b84ad4cb8961bf458e8adf72a",
    type: "molecule",
    smiles: "CC(=O)Nc1ccccc1Br",
    isRegulated: true,
    isProtected: true,
    isInInventory: true,
  },
];
const nodes: { nodes: LibraryDataNode[] } = { nodes: [] }
export default function Pathway() {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  useEffect(() => {
    const element = document.querySelector("reaction-pathway") || nodes;
    element.nodes = nodes1;
  }, []);

  return (
    <>
      <div>Pathway</div>
      <reaction-pathway />
    </>
  );
}
