import { h, getAssetPath } from "@stencil/core";
import * as d3 from "d3";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Line2 } from "three/examples/jsm/lines/Line2";
import Helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json";
import HelvetikerBold from "three/examples/fonts/helvetiker_bold.typeface.json";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import * as THREE from "three";
import { Molecule as MoleculeLib } from "openchemlib/minimal";
/**
 * The SVG icons of the reaction pathway component
 * @readonly
 * @enum {string}
 */
const SVG_ICONS = ["book", "reference_1", "reference_2", "reference_3", "exclamation", "shield", "flask"];
/**
 * The default width of a node
 */
const NODE_WIDTH = 150;
/**
 * The default height of a node
 */
const NODE_HEIGHT = 200;
/**
 * The default separation between nodes
 */
const TREE_SEPARATION = 1;
/**
 * The default offset of a reaction node
 */
const REACTION_NODE_X_OFFSET = 85;
/**
 * The default radius of a line curve
 */
const LINE_CURVE_RADIUS = 5;
/**
 * The default radius of a hexagon
 */
const HEXAGON_RADIUS = 10;
/**
 * The default radius of a honeycomb badge
 */
const HONEYCOMB_BADGE_RADIUS = 5;
/**
 * The default size of the reference icon
 */
const REFERENCE_ICON_SIZE = 30;
/**
 * The default size of the inventory icon
 */
const INVENTORY_ICON_SIZE = 30;
/**
 * The default zoom speed of the camera
 */
const CAMERA_ZOOM_SPEED = 0.2;
/**
 * The reaction pathway component renders a reaction
 * pathway from a list of nodes (molecules and reactions)
 * using a tree layout algorithm and a 3D rendering engine.
 */
export class ReactionPathway {
  constructor() {
    this.internalNodes = [];
    this.iconCache = {};
    this.iconObjectCache = {};
    this.objectBoundingBoxCache = {};
    this.nodes = [];
    this.enable3D = false;
    this.displayScore = true;
    this.displayHoneycomb = true;
    this.displayPathway = true;
    this.displayReactionReference = true;
    this.displayReactionName = true;
    this.displayReactionCondition = true;
  }
  async componentWillLoad() {
    if (this.nodes.length === 0)
      return;
    this.svgLoader = new SVGLoader();
    this.internalNodes = this.nodes;
    await this.loadSVGIcons();
    const hierarchy = d3
      .stratify()
      .id(node => node.id)
      .parentId(node => node.parentId)(this.internalNodes);
    this.tree = d3
      .tree()
      .size([1000, 1000])
      .nodeSize([NODE_WIDTH, NODE_HEIGHT])
      .separation(() => TREE_SEPARATION)(hierarchy)
      .each(node => {
      const { x, y } = node;
      node.x = -y;
      node.y = x;
      if (node.data.type === "reaction")
        this.internalNodes.filter(({ parentId }) => parentId === node.data.id).length > 1 && (node.x -= REACTION_NODE_X_OFFSET);
    });
  }
  componentDidLoad() {
    if (this.nodes.length === 0)
      return;
    this.renderReactionPathway(this.tree);
  }
  handlePointerDown(event) {
    this.mouse.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
  }
  handlePointerUp(event) {
    if (this.mouse.x !== (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1 ||
      this.mouse.y !== -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1)
      return;
    this.mouse.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const object = this.scene.children.find(child => {
      let boundingBox = this.objectBoundingBoxCache[child.uuid];
      if (!boundingBox) {
        boundingBox = new THREE.Box3().setFromObject(child);
        this.objectBoundingBoxCache[child.uuid] = boundingBox;
      }
      return this.raycaster.ray.intersectsBox(boundingBox);
    });
    if (object && object.userData && object.userData.eventSource)
      this.click.emit({ node: object.userData, eventSource: object.userData.eventSource });
  }
  /**
   * Allows to reset position and zoom levels of the reaction pathway
   */
  async zoomReset() {
    const sceneCenter = new THREE.Box3().setFromObject(this.scene).getCenter(new THREE.Vector3());
    this.controls.target.set(sceneCenter.x, sceneCenter.y, 0);
    this.camera.zoom = 1;
    this.camera.position.set(sceneCenter.x, sceneCenter.y, 200);
    this.camera.updateProjectionMatrix();
    this.controls.dispatchEvent({ type: "change" });
  }
  /**
   * Allows to zoom in the reaction pathway
   * @param {number} zoomSpeed - The zoom speed of the camera
   */
  async zoomIn(zoomSpeed = CAMERA_ZOOM_SPEED) {
    this.camera.zoom *= 1 + zoomSpeed;
    this.camera.updateProjectionMatrix();
    this.controls.dispatchEvent({ type: "change" });
  }
  /**
   * Allows to zoom out the reaction pathway
   * @param {number} zoomSpeed - The zoom speed of the camera
   */
  async zoomOut(zoomSpeed = CAMERA_ZOOM_SPEED) {
    this.camera.zoom *= 1 - zoomSpeed;
    this.camera.updateProjectionMatrix();
    this.controls.dispatchEvent({ type: "change" });
  }
  /**
   * Loads the SVG icons of the reaction pathway component
   * @todo Using async/await for loading the SVG icons is not the best solution
   * preferably the SVG icons should be loaded in the build step
   */
  async loadSVGIcons() {
    for (const icon of SVG_ICONS) {
      await this.loadSVGIcon(icon);
    }
  }
  /**
   * Loads an SVG icon
   * @param {string} icon - The icon
   */
  async loadSVGIcon(icon) {
    const svg = await fetch(getAssetPath(`./assets/${icon}.svg`)).then(response => response.text());
    this.iconCache[icon] = svg;
  }
  /**
   * Appends the label renderer to the container
   * @param {number} width - The width of the container
   * @param {number} height - The height of the container
   */
  appendLabelRendererToContainer(width, height) {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    this.container.appendChild(labelRenderer.domElement);
  }
  /**
   * Renders the reaction pathway
   * @param {HierarchyPointNode<Node>} tree - The tree
   * @todo Implement
   */
  renderReactionPathway(tree) {
    // FIXME: This is a temporary fix for the width and height of the container
    // The width and height should be calculated from the container's parent element
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(getComputedStyle(this.element).getPropertyValue("--background-color").trim());
    this.fontLoader = new FontLoader();
    this.helvetiker = this.fontLoader.parse(Helvetiker);
    this.helvetikerBold = this.fontLoader.parse(HelvetikerBold);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    tree
      .descendants()
      .filter(node => node.data.type === "molecule")
      .forEach(node => this.renderMolecule(node));
    tree
      .descendants()
      .filter(node => node.data.type === "reaction")
      .forEach(node => this.renderReaction(node));
    const sceneCenter = new THREE.Box3().setFromObject(this.scene).getCenter(new THREE.Vector3());
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000);
    this.addLigths();
    this.container.appendChild(this.renderer.domElement);
    // FIXME: Resolve initial positions
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = this.enable3D;
    this.controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };
    this.controls.screenSpacePanning = true;
    this.appendLabelRendererToContainer(width, height);
    this.controls.target.set(sceneCenter.x, sceneCenter.y, 0);
    this.camera.position.set(sceneCenter.x, sceneCenter.y, 200);
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    this.controls.addEventListener("change", () => this.renderer.render(this.scene, this.camera));
  }
  /**
   * Adds the lights to the scene
   */
  addLigths() {
    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 0, 1);
    backLight.position.set(0, 0, -1);
    this.scene.add(frontLight, backLight);
  }
  /**
   * Renders a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   * @todo Implement
   */
  renderMolecule(molecule) {
    this.renderSmiles(molecule);
    this.renderMoleculeScore(molecule);
    this.renderMoleculeInventoryIcon(molecule);
    this.renderHoneycomb(molecule);
  }
  /**
   * Renders the score of a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   * @todo Implement
   */
  renderMoleculeScore(molecule) {
    if (!molecule.data.score || !this.displayScore || molecule.data.isInInventory)
      return;
    const scoreObject3D = new THREE.Object3D();
    const geometry = new TextGeometry(molecule.data.score, {
      font: this.helvetikerBold,
      size: 10,
      height: 0,
      curveSegments: 12,
    });
    const material = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--score-text-color") });
    const mesh = new THREE.Mesh(geometry, material);
    scoreObject3D.add(mesh);
    const textWidth = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3()).x;
    scoreObject3D.position.x = molecule.x - textWidth / 2;
    // FIXME: This is a temporary fix for the y position of the score offset
    scoreObject3D.position.y = molecule.y - molecule.data.boundingBox.y / 2;
    scoreObject3D.userData = Object.assign(Object.assign({}, molecule.data), { eventSource: "molecule_score" });
    this.scene.add(scoreObject3D);
  }
  /**
   * Renders the inventory icon of a molecule if it is in the inventory
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  renderMoleculeInventoryIcon(molecule) {
    if (!molecule.data.isInInventory || !this.displayScore)
      return;
    const svgIcon = this.iconCache["flask"];
    let object;
    if (this.iconObjectCache["flask"]) {
      object = this.iconObjectCache["flask"].clone();
    }
    else {
      const data = this.svgLoader.parse(svgIcon);
      object = new THREE.Object3D();
      for (const path of data.paths) {
        this.createLineShapes(path).forEach(mesh => object.add(mesh));
        this.createSolidShapes(path).forEach(mesh => object.add(mesh));
      }
      object.rotation.z = Math.PI;
      object.rotation.y = Math.PI;
    }
    const objectSize = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
    const scalingFactor = INVENTORY_ICON_SIZE / Math.max(objectSize.x, objectSize.y);
    object.position.x = molecule.x - (objectSize.x * scalingFactor) / 2;
    object.position.y = molecule.y - objectSize.y * scalingFactor;
    object.scale.set(scalingFactor, scalingFactor, 1);
    object.userData = Object.assign(Object.assign({}, molecule.data), { eventSource: "inventory_icon" });
    this.scene.add(object);
  }
  /**
   * Renders the smiles of a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  renderSmiles(molecule) {
    const { smiles } = molecule.data;
    const options = {
      suppressChiralText: true,
      suppressCIPParity: true,
      suppressESR: true,
      factorTextSize: 1,
      noStereoProblem: true,
    };
    const svg = MoleculeLib.fromSmiles(smiles).toSVG(100, 150, "svg", options);
    const data = this.svgLoader.parse(svg);
    const textElements = Array.from(data.xml.children).filter(child => child.nodeName === "text");
    const textObject3D = this.createTextObject3D(textElements);
    const shapeObject3D = this.createSVGMeshObject3D(data.paths);
    const smilesObject3D = new THREE.Object3D().add(shapeObject3D, textObject3D);
    const smilesBoundingBox = new THREE.Box3().setFromObject(smilesObject3D);
    const smilesBoundingBoxSize = new THREE.Vector3();
    const smilesBoundingBoxCenter = new THREE.Vector3();
    smilesBoundingBox.getSize(smilesBoundingBoxSize);
    smilesBoundingBox.getCenter(smilesBoundingBoxCenter);
    smilesObject3D.children.forEach(child => {
      child.position.x = -smilesBoundingBoxCenter.x;
      child.position.y = -smilesBoundingBoxCenter.y;
    });
    smilesObject3D.rotation.x = Math.PI;
    smilesObject3D.rotation.y = 2 * Math.PI;
    molecule.data.boundingBox = smilesBoundingBoxCenter;
    smilesObject3D.position.x = molecule.x;
    smilesObject3D.position.y = molecule.y;
    smilesObject3D.userData = Object.assign(Object.assign({}, molecule.data), { eventSource: "smiles" });
    this.scene.add(smilesObject3D);
  }
  /**
   * Creates an object3D from an SVG text
   * @param {SVGTextElement[]} textElements - The SVG text elements
   * @returns {THREE.Object3D} The object3D
   */
  createTextObject3D(textElements) {
    const object = new THREE.Object3D();
    textElements.forEach(textElement => {
      const fontSize = parseInt(textElement.attributes.getNamedItem("font-size").nodeValue, 10);
      const text = textElement.textContent;
      const textWidth = this.calculateTextWidth(textElement);
      const x = parseFloat(textElement.attributes.getNamedItem("x").nodeValue) + textWidth / 2;
      const y = parseFloat(textElement.attributes.getNamedItem("y").nodeValue) + fontSize / 3;
      const data = {
        x,
        y,
        fontSize,
        color: textElement.getAttribute("fill"),
        text,
      };
      const geometry = new TextGeometry(data.text, {
        font: this.helvetiker,
        size: data.fontSize * 0.7,
        height: 0,
        curveSegments: 12,
      });
      const material = new THREE.MeshBasicMaterial({ color: data.color });
      const mesh = new THREE.Mesh(geometry, material);
      const meshSize = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
      mesh.position.set(data.x - meshSize.x / 2, data.y - fontSize / 3, 0);
      mesh.rotation.x = Math.PI;
      mesh.rotation.y = 2 * Math.PI;
      object.add(mesh);
    });
    return object;
  }
  /**
   * Creates an object3D from an SVG path
   * @param {SVGResultPaths[]} paths - The SVG paths
   * @returns {THREE.Object3D} The object3D
   */
  createSVGMeshObject3D(paths) {
    const object = new THREE.Object3D();
    for (const path of paths) {
      this.createLineShapes(path).forEach(mesh => object.add(mesh));
    }
    return object;
  }
  /**
   * Creates line shapes from an SVG path
   * @param {SVGResultPaths} path - The SVG path
   * @returns {THREE.Mesh[]} The line shapes
   */
  createLineShapes(path) {
    const meshes = [];
    const strokeColor = path.userData.style.stroke;
    let renderOrder = 0;
    if (strokeColor !== undefined && strokeColor !== "none") {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setStyle(strokeColor),
        opacity: path.userData.style.strokeOpacity,
        transparent: path.userData.style.strokeOpacity < 1,
        side: THREE.DoubleSide,
        depthWrite: false,
        wireframe: false,
      });
      for (const subPath of path.subPaths) {
        const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
        if (geometry) {
          const mesh = new THREE.Mesh(geometry, material);
          mesh.renderOrder = renderOrder++;
          meshes.push(mesh);
        }
      }
    }
    return meshes;
  }
  /**
   * Creates solid shapes from an SVG path
   * @param {SVGResultPaths} path - The SVG path
   * @returns {THREE.Mesh[]} The solid shapes
   */
  createSolidShapes(path) {
    const meshes = [];
    const fillColor = path.userData.style.fill;
    let renderOrder = 0;
    if (fillColor !== undefined && fillColor !== "none") {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setStyle(fillColor),
        opacity: path.userData.style.fillOpacity,
        transparent: path.userData.style.fillOpacity < 1,
        side: THREE.DoubleSide,
        depthWrite: false,
        wireframe: false,
      });
      const shapes = SVGLoader.createShapes(path);
      for (const shape of shapes) {
        const geometry = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        // FIXME: This is a temporary fix for the render order of the meshes
        // The render order should be calculated from the z position of the meshes
        mesh.renderOrder = fillColor === "#F9C727" ? 100 : 0 + renderOrder++;
        meshes.push(mesh);
      }
    }
    return meshes;
  }
  /**
   * Renders a reaction node
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReaction(reaction) {
    this.renderReactionPath(reaction);
    this.renderReactionReference(reaction);
    this.renderReactionDetails(reaction);
  }
  /**
   * Renders the reaction path of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionPath(reaction) {
    if (!this.displayPathway)
      return;
    const parent = reaction.parent;
    const children = reaction.children;
    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    color.setHSL(0.0, 0.0, 0.73, THREE.SRGBColorSpace);
    const parentX = parent.x - parent.data.boundingBox.x;
    positions.push(parentX, parent.y, 0);
    colors.push(color.r, color.g, color.b);
    positions.push(reaction.x, reaction.y, 0);
    colors.push(color.r, color.g, color.b);
    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);
    const lineMaterial = new LineMaterial({
      color: 0xffffff,
      linewidth: 1,
      vertexColors: true,
      dashed: false,
      alphaToCoverage: false,
    });
    lineMaterial.resolution.set(500, 500);
    const line = new Line2(geometry, lineMaterial);
    line.computeLineDistances();
    line.scale.set(1, 1, 1);
    this.scene.add(line);
    const arrowTip = new THREE.ConeGeometry(2, 5, 3);
    const arrowTipMaterial = new THREE.MeshBasicMaterial({ color });
    const arrowTipMesh = new THREE.Mesh(arrowTip, arrowTipMaterial);
    arrowTipMesh.position.set(parentX, parent.y, 0);
    arrowTipMesh.rotation.z = -Math.PI / 2;
    this.scene.add(arrowTipMesh);
    for (const child of children) {
      this.createReactionJoinLine(reaction, child);
    }
  }
  /**
   * Renders the reaction corner line of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  createReactionJoinLine(reaction, molecule) {
    const sourceX = reaction.x;
    const sourceY = reaction.y;
    const targetX = molecule.x + molecule.data.boundingBox.x + HEXAGON_RADIUS * 2;
    const targetY = molecule.y;
    const horizontalRadiusDirection = targetX - sourceX > 0 ? 1 : -1;
    const verticalRadiusDirection = targetY === sourceY ? 0 : targetY - sourceY > 0 ? 1 : -1;
    const radius = Math.abs(sourceX - targetX) / 2 < LINE_CURVE_RADIUS ? Math.abs(sourceX - targetX) / 2 : LINE_CURVE_RADIUS;
    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    color.setHSL(0.0, 0.0, 0.73, THREE.SRGBColorSpace);
    positions.push(sourceX, sourceY, 0);
    colors.push(color.r, color.g, color.b);
    positions.push(sourceX + radius * horizontalRadiusDirection, sourceY, 0);
    colors.push(color.r, color.g, color.b);
    positions.push(sourceX + radius * horizontalRadiusDirection, targetY - radius * verticalRadiusDirection, 0);
    colors.push(color.r, color.g, color.b);
    const cornerCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(sourceX + radius * horizontalRadiusDirection, targetY - radius * verticalRadiusDirection, 0), new THREE.Vector3(sourceX + radius * horizontalRadiusDirection, targetY, 0), new THREE.Vector3(sourceX + 2 * radius * horizontalRadiusDirection, targetY, 0));
    cornerCurve.getPoints(50).forEach(point => {
      positions.push(point.x, point.y, point.z);
      colors.push(color.r, color.g, color.b);
    });
    positions.push(targetX, targetY, 0);
    colors.push(color.r, color.g, color.b);
    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);
    const lineMaterial = new LineMaterial({
      color: 0xffffff,
      linewidth: 1,
      vertexColors: true,
      dashed: false,
      alphaToCoverage: false,
    });
    lineMaterial.resolution.set(500, 500);
    const line = new Line2(geometry, lineMaterial);
    line.computeLineDistances();
    line.scale.set(1, 1, 1);
    this.scene.add(line);
  }
  /**
   * Renders the honeycomb of a molecule
   * @param {HierarchyPointNode<Molecule>} molecule - The molecule
   */
  renderHoneycomb(molecule) {
    if (!this.displayHoneycomb)
      return;
    const { isProtected, isRegulated, publishedMoleculeCount: publishedMoleculeCount } = molecule.data;
    const count = (isProtected ? 1 : 0) + (isRegulated ? 1 : 0) + (publishedMoleculeCount ? 1 : 0);
    if (count === 0)
      return;
    const isUpwards = molecule.parent !== null ? molecule.y > molecule.parent.y : false;
    const moleculeRightEdge = molecule.x + molecule.data.boundingBox.x;
    const coordinates = this.createHoneycombCoordinates({ x: moleculeRightEdge, y: molecule.y }, 10, count, isUpwards);
    const hexagonObject = new THREE.Object3D();
    const geometry = new THREE.CircleGeometry(HEXAGON_RADIUS, 6);
    const material = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--honeycomb-border-color") });
    const mesh = new THREE.Mesh(geometry, material);
    const innerGeometry = new THREE.CircleGeometry(HEXAGON_RADIUS - 2, 6);
    const innerMaterial = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--honeycomb-color") });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.z = 1;
    innerMesh.rotation.z = Math.PI / 2;
    innerMesh.position.z = 2;
    hexagonObject.add(mesh, innerMesh);
    if (publishedMoleculeCount) {
      const { x, y } = coordinates.shift();
      const object = hexagonObject.clone();
      object.position.set(x + HEXAGON_RADIUS, y, 1);
      object.userData = Object.assign(Object.assign({}, molecule.data), { eventSource: "published_molecule_icon" });
      this.scene.add(object);
      this.renderHoneycombIcon("book", { x, y });
      this.renderHoneycombBadge({ x, y }, molecule.data.publishedMoleculeCount.toString());
    }
    if (isProtected) {
      const { x, y } = coordinates.shift();
      const object = hexagonObject.clone();
      object.position.set(x + HEXAGON_RADIUS, y, 1);
      object.userData = Object.assign(Object.assign({}, molecule.data), { eventSource: "protected_icon" });
      this.scene.add(object);
      this.renderHoneycombIcon("shield", { x, y });
    }
    if (isRegulated) {
      const { x, y } = coordinates.shift();
      const object = hexagonObject.clone();
      object.position.set(x + HEXAGON_RADIUS, y, 1);
      object.userData = Object.assign(Object.assign({}, molecule.data), { eventSource: "regulated_icon" });
      this.scene.add(object);
      this.renderHoneycombIcon("exclamation", { x, y });
    }
  }
  /**
   * Renders the honeycomb icon of a molecule
   * @param {Coordinate} coordinate - The coordinate
   * @todo Implement the icon caching to improve performance
   */
  renderHoneycombIcon(icon, coordinate) {
    const svgIcon = this.iconCache[icon];
    let object;
    if (object)
      object = this.iconObjectCache[icon].clone();
    else {
      const data = this.svgLoader.parse(svgIcon);
      object = new THREE.Object3D();
      for (const path of data.paths) {
        this.createLineShapes(path).forEach(mesh => object.add(mesh));
        this.createSolidShapes(path).forEach(mesh => object.add(mesh));
      }
      object.rotation.z = Math.PI;
      object.rotation.y = Math.PI;
    }
    const objectSize = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
    const scalingFactor = HEXAGON_RADIUS / Math.max(objectSize.x, objectSize.y);
    object.position.x = coordinate.x + HEXAGON_RADIUS - (objectSize.x * scalingFactor) / 2;
    object.position.y = coordinate.y + (objectSize.y * scalingFactor) / 2;
    object.position.z = 4;
    object.scale.set(scalingFactor, scalingFactor, 1);
    this.scene.add(object);
  }
  /**
   * Creates the coordinates of a honeycomb
   * @param {Coordinate} initial - The initial coordinate
   * @param {number} radius - The radius of the honeycomb
   * @param {number} n - The number of hexagons
   * @returns {Coordinate[]} The coordinates of the honeycomb
   */
  createHoneycombCoordinates(initial, radius, n, calculateUpwards = false) {
    const coordinates = [initial];
    const sqrt = Math.sqrt(1);
    const directionMultiplier = calculateUpwards ? -1 : 1;
    for (let index = 0; index < n - 1; index++) {
      const x = coordinates[index].x + (index % 2 === 0 ? 1 : -1) * radius * sqrt;
      const y = coordinates[index].y - 1.5 * radius * directionMultiplier;
      coordinates.push({ x, y });
    }
    return coordinates;
  }
  /**
   * Renders the honeycomb badge of a molecule
   * @param {Coordinate} coordinate - The coordinate
   * @param {string} text - The text
   */
  renderHoneycombBadge(coordinate, text) {
    const x = coordinate.x + 2 * HEXAGON_RADIUS;
    const y = coordinate.y + HEXAGON_RADIUS / 2;
    const geometry = new THREE.CircleGeometry(HONEYCOMB_BADGE_RADIUS, 32);
    const material = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--badge-outline-color") });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 4);
    const innerGeometry = new THREE.CircleGeometry(HONEYCOMB_BADGE_RADIUS * 0.9, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--badge-color") });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    innerMesh.position.set(x, y, 5);
    const textGeometry = new TextGeometry(text, {
      font: this.helvetikerBold,
      size: 2.5,
      height: 0,
      curveSegments: 12,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--badge-text-color") });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    const textSize = new THREE.Box3().setFromObject(textMesh).getSize(new THREE.Vector3());
    // FIXME: This is a temporary fix for the x and y position of the text offset
    // The x and y position should be calculated from the text size
    textMesh.position.set(x - textSize.x / 2, y - textSize.y / 2, 6);
    this.scene.add(mesh, innerMesh, textMesh);
  }
  /**
   * Renders the reaction name of a reaction and its condition
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionDetails(reaction) {
    const conditionObject = this.createReactionCondition3DObject(reaction);
    if (this.displayReactionName && reaction.data.name) {
      const { name } = reaction.data;
      const distance = Math.abs(reaction.parent !== null ? reaction.x - reaction.parent.x : 0);
      const lines = this.linebreakText(name, distance, 6, 10);
      const conditionHeight = conditionObject ? new THREE.Box3().setFromObject(conditionObject).getSize(new THREE.Vector3()).y : 0;
      lines.forEach((line, index, initial) => {
        const geometry = new TextGeometry(line, {
          font: this.helvetikerBold,
          size: 6,
          height: 0,
          curveSegments: 12,
        });
        const material = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--reaction-name-color") });
        const mesh = new THREE.Mesh(geometry, material);
        const meshSize = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
        const x = reaction.x + 8;
        const y = reaction.y + meshSize.y / 2 + 15 + conditionHeight + (initial.length - 1 - index) * 10;
        mesh.position.set(x, y, 10);
        mesh.userData = Object.assign(Object.assign({}, reaction.data), { eventSource: "reaction_name" });
        this.scene.add(mesh);
      });
    }
    if (conditionObject) {
      conditionObject.userData = Object.assign(Object.assign({}, reaction.data), { eventSource: "reaction_condition" });
      this.scene.add(conditionObject);
    }
  }
  /**
   * Creates the reaction condition of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   * @returns {THREE.Object3D} The object3D
   */
  createReactionCondition3DObject(reaction) {
    if (!this.displayReactionCondition || !reaction.data.condition)
      return;
    const object = new THREE.Object3D();
    const distance = Math.abs(reaction.parent !== null ? reaction.x - reaction.parent.x : 0);
    const lines = this.linebreakText(reaction.data.condition, distance, 5, 20);
    lines.forEach((line, index, initial) => {
      const geometry = new TextGeometry(line, {
        font: this.helvetiker,
        size: 5,
        height: 0,
        curveSegments: 12,
      });
      const material = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--reaction-condition-color") });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(reaction.x + 8, reaction.y + 10 + (initial.length - 1 - index) * 10, 10);
      object.add(mesh);
    });
    return object;
  }
  /**
   * Breaks a text into lines
   * @param {string} text - The text
   * @param {number} width - The width of the text
   * @param {number} fontSize - The font size of the text
   * @param {number} padding - The padding of the text
   * @returns {string[]} The result
   */
  linebreakText(text, width, fontSize, padding = 0) {
    const words = text.split(" ");
    const result = words.reduce((acc, word) => {
      const { lines, currentLine } = acc;
      // FIXME: This is a temporary fix for the width of the text
      if ((currentLine + word).length * fontSize >= width - padding) {
        lines.push(currentLine.trim());
        acc.currentLine = "";
      }
      acc.currentLine += `${word} `;
      return acc;
    }, { lines: [], currentLine: "" });
    result.lines.push(result.currentLine.trim());
    return result.lines;
  }
  /**
   * Renders the reaction reference of a reaction
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionReference(reaction) {
    if (!this.displayReactionReference)
      return;
    if (reaction.data.doi)
      this.renderReactionReferenceDOI(reaction);
    if (reaction.data.score)
      this.renderReactionReferenceIcon(reaction);
  }
  /**
   * Renders the DOI of a reaction reference
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionReferenceDOI(reaction) {
    const material = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--reaction-doi-color") });
    const doi = reaction.data.doi;
    const geometry = new TextGeometry(doi, {
      font: this.helvetiker,
      size: 6,
      height: 0,
      curveSegments: 12,
    });
    const mesh = new THREE.Mesh(geometry, material);
    // FIXME: This is a temporary fix for the x and y position of the text offset
    mesh.position.set(reaction.x + 7, reaction.y - 15, 10);
    const textWidth = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3()).x;
    const underlineGeometry = new THREE.PlaneGeometry(textWidth, 0.5);
    const underlineMesh = new THREE.Mesh(underlineGeometry, material);
    // FIXME: This is a temporary fix for the x and y position of the underline offset
    underlineMesh.position.set(mesh.position.x + textWidth / 2 + 2, mesh.position.y - 2, 10);
    mesh.userData = Object.assign(Object.assign({}, reaction.data), { eventSource: "doi" });
    this.scene.add(mesh, underlineMesh);
  }
  /**
   * Renders the book icon under a reaction node
   * @param {HierarchyPointNode<Reaction>} reaction - The reaction
   */
  renderReactionReferenceIcon(reaction) {
    const score = reaction.data.score;
    const svgIcon = this.iconCache[`reference_${score}`];
    let object;
    if (this.iconObjectCache[`reference_${score}`]) {
      object = this.iconObjectCache[`reference_${score}`].clone();
    }
    else {
      const data = this.svgLoader.parse(svgIcon);
      object = new THREE.Object3D();
      for (const path of data.paths) {
        this.createLineShapes(path).forEach(mesh => object.add(mesh));
        this.createSolidShapes(path).forEach(mesh => object.add(mesh));
      }
      const objectSize = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
      const scalingFactor = REFERENCE_ICON_SIZE / Math.max(objectSize.x, objectSize.y);
      object.scale.set(scalingFactor, scalingFactor, 1);
      object.rotation.z = Math.PI;
      object.userData = Object.assign(Object.assign({}, reaction.data), { eventSource: "published_reactions_icon" });
      this.iconObjectCache[`reference_${score}`] = object;
    }
    const objectSize = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
    const doiPadding = reaction.data.doi ? 10 : 0;
    object.position.set(reaction.x + objectSize.x * 1.25, reaction.y - objectSize.y / 2 - doiPadding - 2, 10);
    this.scene.add(object);
    if (reaction.data.reactionCount) {
      this.renderReactionReferenceIconBadge({ x: object.position.x - objectSize.x / 2, y: object.position.y - objectSize.y / 2 }, reaction.data.reactionCount.toString());
    }
  }
  /**
   * Renders the badge of a reaction reference
   * @param {Coordinate} coordinate - The coordinate
   * @param {string} text - The text
   */
  renderReactionReferenceIconBadge(coordinate, text) {
    const geometry = new THREE.CircleGeometry(HONEYCOMB_BADGE_RADIUS + 2, 32);
    const material = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--badge-outline-color") });
    const mesh = new THREE.Mesh(geometry, material);
    const geometrySize = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
    const x = coordinate.x + (2 * HONEYCOMB_BADGE_RADIUS + 2) / 2 + geometrySize.x / 1.5;
    const y = coordinate.y - (2 * HONEYCOMB_BADGE_RADIUS + 2) / 2 - geometrySize.y / 3;
    const innerGeometry = new THREE.CircleGeometry(HONEYCOMB_BADGE_RADIUS + 2 * 0.9, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--badge-color") });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    innerMesh.position.set(x, y, 11);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = 10;
    const textGeometry = new TextGeometry(text, {
      font: this.helvetikerBold,
      size: 4,
      height: 0,
      curveSegments: 12,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: this.getCSSVariableValue("--badge-text-color") });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    const textSize = new THREE.Box3().setFromObject(textMesh).getSize(new THREE.Vector3());
    textMesh.position.set(x - textSize.x / 2, y - textSize.y / 2, 12);
    this.scene.add(mesh, innerMesh, textMesh);
  }
  /**
   * Calculates the width of a text
   * @param {SVGTextElement} text - The text
   * @returns {number} The width of the text
   * @todo Move to a utility class
   */
  calculateTextWidth(text) {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(svgNamespace, "svg");
    element.style.display = "block";
    element.style.opacity = "0";
    element.style.position = "absolute";
    element.appendChild(text);
    document.body.appendChild(element);
    const width = element.getBBox().width;
    document.body.removeChild(element);
    return width;
  }
  /**
   * Gets the value of a CSS variable
   * @param {string} variable - The variable
   * @returns {string} The value of the variable
   */
  getCSSVariableValue(variable) {
    return getComputedStyle(this.element).getPropertyValue(variable);
  }
  render() {
    return (h("div", { class: "container", ref: element => {
        this.container = element;
      } }));
  }
  static get is() { return "reaction-pathway"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() {
    return {
      "$": ["reaction-pathway.css"]
    };
  }
  static get styleUrls() {
    return {
      "$": ["reaction-pathway.css"]
    };
  }
  static get assetsDirs() { return ["assets"]; }
  static get properties() {
    return {
      "nodes": {
        "type": "unknown",
        "mutable": false,
        "complexType": {
          "original": "Omit<Node, \"boundingBox\">[]",
          "resolved": "Omit<Node, \"boundingBox\">[]",
          "references": {
            "Omit": {
              "location": "global",
              "id": "global::Omit"
            },
            "Node": {
              "location": "local",
              "path": "C:/Users/X270076/OneDrive - MerckGroup/compounds/packages/chemuix/src/components/reaction-pathway/reaction-pathway.tsx",
              "id": "src/components/reaction-pathway/reaction-pathway.tsx::Node"
            }
          }
        },
        "required": false,
        "optional": false,
        "docs": {
          "tags": [{
              "name": "type",
              "text": "{PropNode[]}"
            }, {
              "name": "required",
              "text": undefined
            }],
          "text": "The nodes of the reaction pathway"
        },
        "defaultValue": "[]"
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
          "tags": [{
              "name": "type",
              "text": "{boolean}"
            }, {
              "name": "default",
              "text": "false"
            }],
          "text": "Enables the 3D view of the reaction pathway"
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
          "tags": [{
              "name": "type",
              "text": "{boolean}"
            }, {
              "name": "default",
              "text": "false"
            }],
          "text": "Enables the score rendering of the molecules"
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
          "tags": [{
              "name": "type",
              "text": "{boolean}"
            }, {
              "name": "default",
              "text": "false"
            }],
          "text": "Enables the honeycomb rendering of the molecules"
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
          "tags": [{
              "name": "type",
              "text": "{boolean}"
            }, {
              "name": "default",
              "text": "false"
            }],
          "text": "Disables the pathway rendering"
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
          "tags": [{
              "name": "type",
              "text": "{boolean}"
            }, {
              "name": "default",
              "text": "false"
            }],
          "text": "Enables the book icon rendering under the reaction nodes"
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
          "tags": [{
              "name": "type",
              "text": "{boolean}"
            }, {
              "name": "default",
              "text": "false"
            }],
          "text": "Enables the reaction name rendering under the reaction nodes"
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
          "tags": [{
              "name": "type",
              "text": "{boolean}"
            }, {
              "name": "default",
              "text": "false"
            }],
          "text": "Enables the reaction condition rendering under the reaction nodes"
        },
        "attribute": "display-reaction-condition",
        "reflect": false,
        "defaultValue": "true"
      }
    };
  }
  static get events() {
    return [{
        "method": "click",
        "name": "reaction-pathway-click",
        "bubbles": true,
        "cancelable": true,
        "composed": true,
        "docs": {
          "tags": [],
          "text": ""
        },
        "complexType": {
          "original": "EventBody",
          "resolved": "{ node: Node; eventSource: EventSource; }",
          "references": {
            "EventBody": {
              "location": "local",
              "path": "C:/Users/X270076/OneDrive - MerckGroup/compounds/packages/chemuix/src/components/reaction-pathway/reaction-pathway.tsx",
              "id": "src/components/reaction-pathway/reaction-pathway.tsx::EventBody"
            }
          }
        }
      }];
  }
  static get methods() {
    return {
      "zoomReset": {
        "complexType": {
          "signature": "() => Promise<void>",
          "parameters": [],
          "references": {
            "Promise": {
              "location": "global",
              "id": "global::Promise"
            }
          },
          "return": "Promise<void>"
        },
        "docs": {
          "text": "Allows to reset position and zoom levels of the reaction pathway",
          "tags": []
        }
      },
      "zoomIn": {
        "complexType": {
          "signature": "(zoomSpeed?: number) => Promise<void>",
          "parameters": [{
              "tags": [{
                  "name": "param",
                  "text": "zoomSpeed - The zoom speed of the camera"
                }],
              "text": "- The zoom speed of the camera"
            }],
          "references": {
            "Promise": {
              "location": "global",
              "id": "global::Promise"
            }
          },
          "return": "Promise<void>"
        },
        "docs": {
          "text": "Allows to zoom in the reaction pathway",
          "tags": [{
              "name": "param",
              "text": "zoomSpeed - The zoom speed of the camera"
            }]
        }
      },
      "zoomOut": {
        "complexType": {
          "signature": "(zoomSpeed?: number) => Promise<void>",
          "parameters": [{
              "tags": [{
                  "name": "param",
                  "text": "zoomSpeed - The zoom speed of the camera"
                }],
              "text": "- The zoom speed of the camera"
            }],
          "references": {
            "Promise": {
              "location": "global",
              "id": "global::Promise"
            }
          },
          "return": "Promise<void>"
        },
        "docs": {
          "text": "Allows to zoom out the reaction pathway",
          "tags": [{
              "name": "param",
              "text": "zoomSpeed - The zoom speed of the camera"
            }]
        }
      }
    };
  }
  static get elementRef() { return "element"; }
  static get listeners() {
    return [{
        "name": "pointerdown",
        "method": "handlePointerDown",
        "target": undefined,
        "capture": false,
        "passive": true
      }, {
        "name": "pointerup",
        "method": "handlePointerUp",
        "target": undefined,
        "capture": false,
        "passive": true
      }];
  }
}
//# sourceMappingURL=reaction-pathway.js.map
