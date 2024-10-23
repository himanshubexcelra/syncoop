
declare module "rollup-plugin-string";

declare module "three" {
  import { Object3DEventMap } from "three";
  import { Object3D as OriginalObject3D } from "three/src/core/Object3D";
  export * from "three/src/Three";
  export class Object3D<E extends Object3DEventMap = Object3DEventMap> extends OriginalObject3D<
    E
  > {
    userData: Record<string, any> & { eventSource: ReactionPathwayEventSource };
  }

  import { Mesh as OriginalMesh } from "three/src/objects/Mesh";
  export class Mesh<
    TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
    TMaterial extends THREE.Material | THREE.Material[] = THREE.Material | THREE.Material[],
    T extends Object3DEventMap = Object3DEventMap
  > extends OriginalMesh<TGeometry, TMaterial, T> {
    userData: Record<string, any> & { eventSource: ReactionPathwayEventSource };
  }
}

type ReactionPathwayEventSource = "smiles" | "doi" | "molecule_score" | "inventory_icon" | "protected_icon" | "regulated_icon" | "published_reactions_icon" | "published_molecule_icon" | "reaction_name" | "reaction_condition";
