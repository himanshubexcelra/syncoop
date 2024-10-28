import { EventEmitter } from "../../stencil-public-runtime";
import { HierarchyPointNode } from "d3";
import { SVGLoader, SVGResultPaths } from "three/examples/jsm/loaders/SVGLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader";
import * as THREE from "three";
export type Molecule = {
  id: string;
  parentId?: string;
  type: "molecule";
  smiles: string;
  score?: string;
  isInInventory?: boolean;
  isProtected?: boolean;
  isRegulated?: boolean;
  publishedMoleculeCount?: number;
  boundingBox?: THREE.Vector3;
};
export type Reaction = {
  id: string;
  parentId: string;
  type: "reaction";
  name?: string;
  condition?: string;
  score?: 1 | 2 | 3;
  doi?: string;
  reactionCount?: number;
};
export type Node = Molecule | Reaction;
export type EventBody = {
  node: Node;
  eventSource: EventSource;
};
export type Coordinate = {
  x: number;
  y: number;
};
export type SVGIconName = (typeof SVG_ICONS)[number];
/**
 * The SVG icons of the reaction pathway component
 * @readonly
 * @enum {string}
 */
declare const SVG_ICONS: readonly ["book", "reference_1", "reference_2", "reference_3", "exclamation", "shield", "flask"];
/**
 * The reaction pathway component renders a reaction
 * pathway from a list of nodes (molecules and reactions)
 * using a tree layout algorithm and a 3D rendering engine.
 */
export declare class ReactionPathway {
  internalNodes: Node[];
  container: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  svgLoader: SVGLoader;
  fontLoader: FontLoader;
  tree: HierarchyPointNode<Node>;
  helvetiker: Font;
  helvetikerBold: Font;
  iconCache: Record<SVGIconName, string>;
  iconObjectCache: Record<SVGIconName, THREE.Object3D>;
  objectBoundingBoxCache: Record<string, THREE.Box3>;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  element: HTMLElement;
  /**
   * The nodes of the reaction pathway
   * @type {PropNode[]}
   * @required
   */
  nodes: Omit<Node, "boundingBox">[];
  /**
   * Enables the 3D view of the reaction pathway
   * @type {boolean}
   * @default false
   */
  enable3D: boolean;
  /**
   * Enables the score rendering of the molecules
   * @type {boolean}
   * @default false
   */
  displayScore: boolean;
  /**
   * Enables the honeycomb rendering of the molecules
   * @type {boolean}
   * @default false
   */
  displayHoneycomb: boolean;
  /**
   * Disables the pathway rendering
   * @type {boolean}
   * @default false
   */
  displayPathway: boolean;
  /**
   * Enables the book icon rendering under the reaction nodes
   * @type {boolean}
   * @default false
   */
  displayReactionReference: boolean;
  /**
   * Enables the reaction name rendering under the reaction nodes
   * @type {boolean}
   * @default false
   */
  displayReactionName: boolean;
  /**
   * Enables the reaction condition rendering under the reaction nodes
   * @type {boolean}
   * @default false
   */
  displayReactionCondition: boolean;
  click: EventEmitter<EventBody>;
  componentWillLoad(): Promise<void>;
  componentDidLoad(): void;
  handlePointerDown(event: MouseEvent): void;
  handlePointerUp(event: MouseEvent): void;
  /**
   * Allows to reset position and zoom levels of the reaction pathway
   */
  zoomReset(): Promise<void>;
  /**
   * Allows to zoom in the reaction pathway
   * @param {number} zoomSpeed - The zoom speed of the camera
   */
  zoomIn(zoomSpeed?: number): Promise<void>;
  /**
   * Allows to zoom out the reaction pathway
   * @param {number} zoomSpeed - The zoom speed of the camera
   */
  zoomOut(zoomSpeed?: number): Promise<void>;
  /**
   * Loads the SVG icons of the reaction pathway component
   * @todo Using async/await for loading the SVG icons is not the best solution
   * preferably the SVG icons should be loaded in the build step
   */
  loadSVGIcons(): Promise<void>;
  /**
   * Loads an SVG icon
   * @param {string} icon - The icon
   */
  loadSVGIcon(icon: SVGIconName): Promise<void>;
  /**
   * Appends the label renderer to the container
   * @param {number} width - The width of the container
   * @param {number} height - The height of the container
   */
  appendLabelRendererToContainer(width: number, height: number): void;
  /**
   * Renders the reaction pathway
   * @param {HierarchyPointNode<Node>} tree - The tree
   * @todo Implement
   */
  renderReactionPathway(tree: HierarchyPointNode<Node>): void;
  /**
   * Adds the lights to the scene
   */
  addLigths(): void;
  /**
   * Renders a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   * @todo Implement
   */
  renderMolecule(molecule: HierarchyPointNode<Molecule>): void;
  /**
   * Renders the score of a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   * @todo Implement
   */
  renderMoleculeScore(molecule: HierarchyPointNode<Molecule>): void;
  /**
   * Renders the inventory icon of a molecule if it is in the inventory
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  renderMoleculeInventoryIcon(molecule: HierarchyPointNode<Molecule>): void;
  /**
   * Renders the smiles of a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  renderSmiles(molecule: HierarchyPointNode<Molecule>): void;
  /**
   * Creates an object3D from an SVG text
   * @param {SVGTextElement[]} textElements - The SVG text elements
   * @returns {THREE.Object3D} The object3D
   */
  createTextObject3D(textElements: SVGTextElement[]): THREE.Object3D;
  /**
   * Creates an object3D from an SVG path
   * @param {SVGResultPaths[]} paths - The SVG paths
   * @returns {THREE.Object3D} The object3D
   */
  createSVGMeshObject3D(paths: SVGResultPaths[]): THREE.Object3D;
  /**
   * Creates line shapes from an SVG path
   * @param {SVGResultPaths} path - The SVG path
   * @returns {THREE.Mesh[]} The line shapes
   */
  createLineShapes(path: SVGResultPaths): THREE.Mesh[];
  /**
   * Creates solid shapes from an SVG path
   * @param {SVGResultPaths} path - The SVG path
   * @returns {THREE.Mesh[]} The solid shapes
   */
  createSolidShapes(path: SVGResultPaths): THREE.Mesh[];
  /**
   * Renders a reaction node
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReaction(reaction: HierarchyPointNode<Reaction>): void;
  /**
   * Renders the reaction path of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionPath(reaction: HierarchyPointNode<Reaction>): void;
  /**
   * Renders the reaction corner line of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  createReactionJoinLine(reaction: HierarchyPointNode<Reaction>, molecule: HierarchyPointNode<Molecule>): void;
  /**
   * Renders the honeycomb of a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  renderHoneycomb(molecule: HierarchyPointNode<Molecule>): void;
  /**
   * Renders the honeycomb icon of a molecule
   * @param {Coordinate} coordinate - The coordinate
   * @todo Implement the icon caching to improve performance
   */
  renderHoneycombIcon(icon: SVGIconName, coordinate: Coordinate): void;
  /**
   * Creates the coordinates of a honeycomb
   * @param {Coordinate} initial - The initial coordinate
   * @param {number} radius - The radius of the honeycomb
   * @param {number} n - The number of hexagons
   * @returns {Coordinate[]} The coordinates of the honeycomb
   */
  createHoneycombCoordinates(initial: Coordinate, radius: number, n: number, calculateUpwards?: boolean): Coordinate[];
  /**
   * Renders the honeycomb badge of a molecule
   * @param {Coordinate} coordinate - The coordinate
   * @param {string} text - The text
   */
  renderHoneycombBadge(coordinate: Coordinate, text: string): void;
  /**
   * Renders the reaction name of a reaction and its condition
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionDetails(reaction: HierarchyPointNode<Reaction>): void;
  /**
   * Creates the reaction condition of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   * @returns {THREE.Object3D} The object3D
   */
  createReactionCondition3DObject(reaction: HierarchyPointNode<Reaction>): THREE.Object3D;
  /**
   * Breaks a text into lines
   * @param {string} text - The text
   * @param {number} width - The width of the text
   * @param {number} fontSize - The font size of the text
   * @param {number} padding - The padding of the text
   * @returns {string[]} The result
   */
  linebreakText(text: string, width: number, fontSize: number, padding?: number): string[];
  /**
   * Renders the reaction reference of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionReference(reaction: HierarchyPointNode<Reaction>): void;
  /**
   * Renders the DOI of a reaction reference
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionReferenceDOI(reaction: HierarchyPointNode<Reaction>): void;
  /**
   * Renders the book icon under a reaction node
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionReferenceIcon(reaction: HierarchyPointNode<Reaction>): void;
  /**
   * Renders the badge of a reaction reference
   * @param {Coordinate} coordinate - The coordinate
   * @param {string} text - The text
   */
  renderReactionReferenceIconBadge(coordinate: Coordinate, text: string): void;
  /**
   * Calculates the width of a text
   * @param {SVGTextElement} text - The text
   * @returns {number} The width of the text
   * @todo Move to a utility class
   */
  calculateTextWidth(text: SVGTextElement): number;
  /**
   * Gets the value of a CSS variable
   * @param {string} variable - The variable
   * @returns {string} The value of the variable
   */
  getCSSVariableValue(variable: string): string;
  render(): any;
}
export {};
