import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  MapPin, 
  User, 
  Layers
} from 'lucide-react';
import Modal from './Modal';

export default function ThreeTimetable({ timetable, liveStatus, currentTime, onSelectSlot }) {
  const containerRef = useRef(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayNameToday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentTime.getDay()];

  // Monochrome colors in Hex for Three.js
  const hexColors = {
    blue: 0xd4d4d8,     // AEC 101 - Light Silver
    indigo: 0xa1a1aa,   // CSE 101 - Zinc Silver
    emerald: 0xffffff,  // FIC 102 - Crisp White
    purple: 0x71717a,   // FIC 103 - Dark Silver
    amber: 0xe4e4e7,    // SEC 101 - Bright Platinum
    teal: 0x52525b      // VAC 101 - Carbon Steel
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 450;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 22, 30);
    camera.lookAt(0, 0, 0);

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 3. LIGHTING (Black & White Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xffffff, 2, 40);
    rimLight.position.set(-15, 10, -10);
    scene.add(rimLight);

    // 4. GRID FLOOR & PLATFORMS
    const gridHelper = new THREE.GridHelper(40, 20, 0x52525b, 0x18181b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Stage floor plane
    const floorGeo = new THREE.PlaneGeometry(42, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.95
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    scene.add(floor);

    // 5. CREATE 3D CLASS BLOCKS
    const interactiveMeshes = [];
    const blockGroup = new THREE.Group();
    scene.add(blockGroup);

    const periodZMap = {
      "1": -8, "2": -5.5, "3": -3, "4": -0.5, "5": 2.5, "6": 5, "7": 7.5, "8": 10
    };

    const dayXMap = {
      "Monday": -12, "Tuesday": -6, "Wednesday": 0, "Thursday": 6, "Friday": 12
    };

    // Create Day Column Base Strips
    days.forEach(d => {
      const x = dayXMap[d];
      const isToday = d.toLowerCase() === dayNameToday.toLowerCase();
      
      const stripGeo = new THREE.BoxGeometry(4.8, 0.2, 22);
      const stripMat = new THREE.MeshStandardMaterial({
        color: isToday ? 0x27272a : 0x121212,
        emissive: isToday ? 0x52525b : 0x000000,
        emissiveIntensity: isToday ? 0.3 : 0,
        roughness: 0.3,
        metalness: 0.7
      });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(x, 0, 1);
      strip.receiveShadow = true;
      scene.add(strip);
    });

    // Add 3D blocks for each class slot
    timetable.forEach(slot => {
      const x = dayXMap[slot.day];
      const z = periodZMap[slot.period] || 0;
      const isCurrent = liveStatus.currentClass?.id === slot.id && slot.day.toLowerCase() === dayNameToday.toLowerCase();
      const colorHex = hexColors[slot.color] || 0xd4d4d8;

      const height = isCurrent ? 2.8 : 2.0;
      const geo = new THREE.BoxGeometry(4.2, height, 2.0);
      const mat = new THREE.MeshStandardMaterial({
        color: isCurrent ? 0xffffff : colorHex,
        emissive: isCurrent ? 0xffffff : 0x27272a,
        emissiveIntensity: isCurrent ? 0.8 : 0.2,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: isCurrent ? 1.0 : 0.85
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, height / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      mesh.userData = { slot, initialY: height / 2, initialColor: colorHex };
      blockGroup.add(mesh);
      interactiveMeshes.push(mesh);

      // Edge wireframe
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isCurrent ? 0xffffff : 0x71717a,
        linewidth: 2,
        transparent: true,
        opacity: isCurrent ? 1.0 : 0.4
      });
      const edgeWire = new THREE.LineSegments(edgeGeo, edgeMat);
      mesh.add(edgeWire);

      if (isCurrent) {
        const ringGeo = new THREE.RingGeometry(2.4, 2.7, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = height + 0.4;
        mesh.add(ring);
        mesh.userData.activeRing = ring;
      }
    });

    // 6. INTERACTIVE ORBIT CONTROLS
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hovered = intersects[0].object;
        document.body.style.cursor = 'pointer';
        setHoveredSlot(hovered.userData.slot);
        
        interactiveMeshes.forEach(m => {
          if (m === hovered) {
            m.position.y = m.userData.initialY + 0.5;
            m.material.emissiveIntensity = 0.9;
          } else {
            m.position.y = m.userData.initialY;
            m.material.emissiveIntensity = 0.2;
          }
        });
      } else {
        document.body.style.cursor = 'default';
        setHoveredSlot(null);
        interactiveMeshes.forEach(m => {
          m.position.y = m.userData.initialY;
          m.material.emissiveIntensity = 0.2;
        });
      }

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        blockGroup.rotation.y += deltaX * 0.008;
        blockGroup.rotation.x += deltaY * 0.005;
        blockGroup.rotation.x = Math.max(-0.2, Math.min(0.8, blockGroup.rotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const slot = intersects[0].object.userData.slot;
        setSelectedSlot(slot);
        if (onSelectSlot) onSelectSlot(slot);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);

    blockGroup.rotation.x = 0.35;
    blockGroup.rotation.y = -0.15;

    // 7. ANIMATION LOOP
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      interactiveMeshes.forEach(m => {
        if (m.userData.activeRing) {
          m.userData.activeRing.rotation.z = elapsedTime * 2;
          m.userData.activeRing.scale.setScalar(1 + Math.sin(elapsedTime * 4) * 0.08);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [timetable, liveStatus]);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-zinc-950/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-800 shadow-lg text-xs font-bold text-white">
          <Sparkles className="w-4 h-4 text-white" />
          <span>CYBEX D • Monochrome Schedule Matrix</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-zinc-950/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-zinc-800 text-[11px] text-zinc-300 font-medium">
            🖱️ <strong>Click & Drag</strong> to rotate • <strong>Click Block</strong> for class info
          </div>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[450px] cursor-grab active:cursor-grabbing" />

      {hoveredSlot && (
        <div className="absolute bottom-4 left-4 z-20 bg-zinc-950/95 backdrop-blur-xl p-4 rounded-2xl border border-zinc-700 shadow-2xl max-w-sm pointer-events-none animate-in fade-in duration-150">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-white text-black">
              {hoveredSlot.subjectCode}
            </span>
            <span className="text-xs font-bold text-white">{hoveredSlot.day} • Period {hoveredSlot.period}</span>
            <span className="text-[10px] font-mono text-zinc-400 ml-auto">{hoveredSlot.startTime} - {hoveredSlot.endTime}</span>
          </div>
          <h4 className="text-sm font-black text-white">{hoveredSlot.subject}</h4>
          <div className="flex items-center justify-between text-xs text-zinc-300 mt-2 pt-2 border-t border-zinc-800">
            <span className="flex items-center gap-1 text-zinc-400">
              <User className="w-3.5 h-3.5" />
              <span>{hoveredSlot.faculty}</span>
            </span>
            <span className="font-bold text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hoveredSlot.room}</span>
            </span>
          </div>
        </div>
      )}

      {selectedSlot && (
        <Modal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          title={`${selectedSlot.subjectCode}: ${selectedSlot.subject}`}
          subtitle={`${selectedSlot.day} • Period ${selectedSlot.period} (${selectedSlot.startTime} to ${selectedSlot.endTime})`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Allocated Room</span>
                <p className="text-base font-black text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{selectedSlot.room}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Session Type</span>
                <p className="text-base font-black text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <span>{selectedSlot.type}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Faculty In-Charge</span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <span>{selectedSlot.faculty}</span>
              </p>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl shadow-lg transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
