import { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from 'd3-force-3d';
import { AGENT_SKILLS } from '@/agents/agentRegistry';

interface GraphNode {
  id: string;
  type: 'agent' | 'concept';
  label: string;
  description: string;
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

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

const NODE_COLORS: Record<string, string> = {
  agent: '#00d4ff',
  concept: '#ffaa00',
};

const NODE_SIZES = {
  agent: 0.22,
  concept: 0.07,
};

export default function KnowledgeGraph() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number>(0);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const lineRefs = useRef<THREE.LineSegments | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { nodes, links } = useMemo(() => {
    const conceptPool = [
      'Multi-Agent', 'Tool Use', 'Memory', 'Orchestration',
      'Type Safety', 'Real-Time', 'RAG', 'Visualization',
      'Checkpointing', 'Handoffs', 'Guardrails', 'Streaming',
    ];

    const simNodes: GraphNode[] = AGENT_SKILLS.map((skill, i) => {
      const angle = (i / AGENT_SKILLS.length) * Math.PI * 2;
      const radius = 2.5;
      return {
        id: skill.id,
        type: 'agent' as const,
        label: skill.name.split(' ')[0],
        description: skill.description,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle * 0.5) * 0.8,
        z: Math.sin(angle) * radius,
      };
    });

    conceptPool.forEach((concept, i) => {
      const angle = (i / conceptPool.length) * Math.PI * 2;
      const radius = 1.2;
      simNodes.push({
        id: `concept_${i}`,
        type: 'concept',
        label: concept,
        description: `Concept: ${concept}`,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle * 0.7) * 0.5,
        z: Math.sin(angle) * radius,
      });
    });

    const agentConceptLinks = AGENT_SKILLS.flatMap((skill, si) => {
      return skill.tools.slice(0, 2).map((tool) => {
        const matchedConcept = conceptPool.findIndex((c) =>
          tool.toLowerCase().includes(c.toLowerCase().split(' ')[0])
        );
        return {
          source: skill.id,
          target: matchedConcept >= 0 ? `concept_${matchedConcept}` : `concept_${(si * 2) % conceptPool.length}`,
        };
      });
    });

    const simLinks: GraphLink[] = [
      ...agentConceptLinks,
      ...AGENT_SKILLS.slice(0, -1).map((skill, i) => ({
        source: skill.id,
        target: AGENT_SKILLS[i + 1].id,
      })),
    ].filter((l) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      return s !== t;
    });

    return { nodes: simNodes, links: simLinks };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x00d4ff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 1.2, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00ff88, 0.6, 15);
    pointLight2.position.set(-5, -3, -5);
    scene.add(pointLight2);

    // Build node meshes
    nodes.forEach((node) => {
      const geo = new THREE.SphereGeometry(NODE_SIZES[node.type], 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: NODE_COLORS[node.type],
        emissive: NODE_COLORS[node.type],
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
      (mesh as any).userData = { nodeId: node.id };
      scene.add(mesh);
      meshRefs.current.set(node.id, mesh);
    });

    // Build edge lines
    const linePositions: number[] = [];
    links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      const sourceNode = nodes.find((n) => n.id === sourceId);
      const targetNode = nodes.find((n) => n.id === targetId);
      if (sourceNode && targetNode) {
        linePositions.push(
          sourceNode.x ?? 0, sourceNode.y ?? 0, sourceNode.z ?? 0,
          targetNode.x ?? 0, targetNode.y ?? 0, targetNode.z ?? 0
        );
      }
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.2,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    lineRefs.current = lines;

    // Force simulation
    const sim = forceSimulation(nodes, 3)
      .force('charge', forceManyBody().strength(-120))
      .force('link', forceLink(links).id((d: any) => d.id).distance(2.5).strength(0.4))
      .force('center', forceCenter(0, 0, 0).strength(0.04))
      .force('collision', forceCollide().radius(0.5))
      .alphaDecay(0.02)
      .velocityDecay(0.25);

    const reheat = () => sim.alpha(0.3).restart();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      sim.tick();

      nodes.forEach((node) => {
        const mesh = meshRefs.current.get(node.id);
        if (mesh && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
          mesh.position.set(node.x, node.y, node.z);
        }
      });

      if (lineRefs.current) {
        const pos = lineRefs.current.geometry.attributes.position as THREE.BufferAttribute;
        let idx = 0;
        links.forEach((link) => {
          const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
          const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
          const sourceNode = nodes.find((n) => n.id === sourceId);
          const targetNode = nodes.find((n) => n.id === targetId);
          if (sourceNode && targetNode) {
            pos.setXYZ(idx++, sourceNode.x ?? 0, sourceNode.y ?? 0, sourceNode.z ?? 0);
            pos.setXYZ(idx++, targetNode.x ?? 0, targetNode.y ?? 0, targetNode.z ?? 0);
          }
        });
        pos.needsUpdate = true;
      }

      const time = Date.now() * 0.001;
      meshRefs.current.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.4 + Math.sin(time * 2 + mesh.position.x) * 0.2;
      });

      // Auto-rotate camera
      if (cameraRef.current) {
        cameraRef.current.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.002);
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(meshRefs.current.values());
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const clicked = nodes.find((n) => n.id === (intersects[0].object as any).userData.nodeId);
        setSelectedNode(clicked ?? null);
      } else {
        setSelectedNode(null);
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(meshRefs.current.values());
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const nodeId = (intersects[0].object as any).userData.nodeId;
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          node.fx = node.x ?? 0;
          node.fy = node.y ?? 0;
          node.fz = node.z ?? 0;
          reheat();
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const isMouseDown = event.buttons === 1;
      if (!isMouseDown) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);

      const meshes = Array.from(meshRefs.current.values());
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const draggedNode = nodes.find((n) => n.id === (intersects[0].object as any).userData.nodeId);
        if (draggedNode && draggedNode.fx !== null) {
          const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
          const intersectPt = new THREE.Vector3();
          raycaster.ray.intersectPlane(plane, intersectPt);
          draggedNode.fx = intersectPt.x;
          draggedNode.fy = intersectPt.y;
          draggedNode.x = intersectPt.x;
          draggedNode.y = intersectPt.y;
        }
      }
    };

    const onMouseUp = () => {
      nodes.forEach((n) => {
        n.fx = null;
        n.fy = null;
        n.fz = null;
      });
    };

    const onWheel = () => {
      if (cameraRef.current) {
        cameraRef.current.position.multiplyScalar(1.05);
      }
    };

    mountRef.current.addEventListener('click', onMouseClick);
    mountRef.current.addEventListener('mousedown', onMouseDown);
    mountRef.current.addEventListener('mousemove', onMouseMove);
    mountRef.current.addEventListener('mouseup', onMouseUp);
    mountRef.current.addEventListener('wheel', onWheel, { passive: true });

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      sim.stop();
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onMouseClick);
        mountRef.current.removeEventListener('mousedown', onMouseDown);
        mountRef.current.removeEventListener('mousemove', onMouseMove);
        mountRef.current.removeEventListener('mouseup', onMouseUp);
        mountRef.current.removeEventListener('wheel', onWheel);
      }
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [nodes, links]);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between px-3 py-1.5 border-b border-white/5 flex-shrink-0'>
        <h2 className='font-orbitron text-[10px] font-bold text-plasma-cyan tracking-widest uppercase'>
          Knowledge Graph
        </h2>
        <div className='flex gap-2 text-[8px] font-jetbrains'>
          <span className='flex items-center gap-0.5'>
            <span className='w-2 h-2 rounded-full bg-plasma-cyan' /> Agent
          </span>
          <span className='flex items-center gap-0.5'>
            <span className='w-2 h-2 rounded-full bg-plasma-amber' /> Concept
          </span>
        </div>
      </div>

      <div className='flex-1 flex min-h-0'>
        <div ref={mountRef} className='flex-1 min-h-0' />

        {selectedNode && (
          <div className='w-32 border-l border-white/5 p-2 overflow-y-auto'>
            <div
              className='text-[9px] font-jetbrains font-bold mb-1'
              style={{ color: NODE_COLORS[selectedNode.type] }}
            >
              {selectedNode.label}
            </div>
            <p className='text-[8px] text-text-muted font-jetbrains leading-relaxed'>
              {selectedNode.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}