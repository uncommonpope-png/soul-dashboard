declare module 'd3-force-3d' {
  export interface SimulationNodeDatum {
    id?: string;
    index?: number;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
  }

  export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum> {
    source: string | NodeDatum;
    target: string | NodeDatum;
    index?: number;
  }

  export interface ForceSimulation<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum> = SimulationLinkDatum<NodeDatum>> {
    (nodes: NodeDatum[]): this;
    restart(): this;
    stop(): this;
    tick(): this;
    tick(iterations: number): this;
    nodes(): NodeDatum[];
    nodes(nodes: NodeDatum[]): this;
    alpha(): number;
    alpha(alpha: number): this;
    alphaMin(): number;
    alphaMin(min: number): this;
    alphaDecay(): number;
    alphaDecay(decay: number): this;
    alphaTarget(): number;
    alphaTarget(target: number): this;
    velocityDecay(): number;
    velocityDecay(decay: number): this;
    force(name: string): Force<NodeDatum, LinkDatum>;
    force(name: string, force: Force<NodeDatum, LinkDatum> | null): this;
    on(typenames: string): (this: ForceSimulation<NodeDatum, LinkDatum>) => void;
    on(typenames: string, listener: (this: ForceSimulation<NodeDatum, LinkDatum>) => void): this;
  }

  export interface Force<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum> = SimulationLinkDatum<NodeDatum>> {
    (alpha: number): void;
    initialize?(nodes: NodeDatum[], random: () => number): void;
  }

  export interface ForceManyBody<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum> extends Force<NodeDatum> {
    strength(): (node: NodeDatum, i: number, nodes: NodeDatum[]) => number;
    strength(strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    theta(): number;
    theta(theta: number): this;
    distanceMin(): number;
    distanceMin(distance: number): this;
    distanceMax(): number;
    distanceMax(distance: number): this;
    strength(strength: number): this;
  }

  export interface ForceLink<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum> = SimulationLinkDatum<NodeDatum>> extends Force<NodeDatum, LinkDatum> {
    links(): LinkDatum[];
    links(links: LinkDatum[]): this;
    id(): (node: NodeDatum, i: number, nodes: NodeDatum[]) => string;
    id(id: (node: NodeDatum, i: number, nodes: NodeDatum[]) => string): this;
    distance(): number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number);
    distance(distance: number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number)): this;
    strength(): number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number);
    strength(strength: number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number)): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export interface ForceCenterOptions {
    x?: number;
    y?: number;
    z?: number;
    strength?: number;
  }

  export interface ForceCollide<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum> extends Force<NodeDatum> {
    radius(): (node: NodeDatum, i: number, nodes: NodeDatum[]) => number;
    radius(radius: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
    strength(): number;
    strength(strength: number): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export function forceSimulation<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum> = SimulationLinkDatum<NodeDatum>>(
    nodes?: NodeDatum[],
    numDimensions?: number
  ): SimulationSimulation<NodeDatum, LinkDatum>;

  export interface SimulationSimulation<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>> {
    (nodes: NodeDatum[]): this;
    restart(): this;
    stop(): this;
    tick(): this;
    tick(iterations: number): this;
    nodes(): NodeDatum[];
    nodes(nodes: NodeDatum[]): this;
    alpha(): number;
    alpha(alpha: number): this;
    alphaMin(): number;
    alphaMin(min: number): this;
    alphaDecay(): number;
    alphaDecay(decay: number): this;
    alphaTarget(): number;
    alphaTarget(target: number): this;
    velocityDecay(): number;
    velocityDecay(decay: number): this;
    force(name: string): Force<NodeDatum, LinkDatum>;
    force(name: string, force: Force<NodeDatum, LinkDatum> | null): this;
    on(typenames: string): (this: SimulationSimulation<NodeDatum, LinkDatum>) => void;
    on(typenames: string, listener: (this: SimulationSimulation<NodeDatum, LinkDatum>) => void): this;
  }

  export function forceManyBody<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum>(): ForceManyBody<NodeDatum>;
  export function forceLink<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum> = SimulationLinkDatum<NodeDatum>>(links?: LinkDatum[]): ForceLink<NodeDatum, LinkDatum>;
  export function forceCenter(x?: number, y?: number, z?: number): ForceCenter<NodeDatum>;
  export interface ForceCenter<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum> extends Force<NodeDatum> {
    x(): number;
    x(x: number): this;
    y(): number;
    y(y: number): this;
    z(): number;
    z(z: number): this;
    strength(): number;
    strength(strength: number): this;
  }
  export function forceCollide<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum>(radius?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): ForceCollide<NodeDatum>;
}