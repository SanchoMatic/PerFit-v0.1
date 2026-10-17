import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ClothingItem } from '../../types';

interface Avatar3DViewProps {
  appliedItems: ClothingItem[];
  isApplying: boolean;
  isLight?: boolean;
  onSnapshotReady?: (dataUrl: string) => void;
}

export const Avatar3DView: React.FC<Avatar3DViewProps> = ({
  appliedItems,
  isApplying,
  isLight = false,
  onSnapshotReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const clothingGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Rotation and spin physics state
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const rotationVelocityRef = useRef(0);
  const currentRotationYRef = useRef(0);

  // Helper to extract dominant color from clothing items or fall back to sleek neutrals
  const getItemColor = useCallback((item?: ClothingItem, defaultHex: number = 0x27272a): number => {
    if (!item) return defaultHex;
    const colorName = (item.colors?.[0] || item.name || '').toLowerCase();
    if (colorName.includes('black') || colorName.includes('noir') || colorName.includes('obsidian')) return 0x18181b;
    if (colorName.includes('white') || colorName.includes('cream') || colorName.includes('bone') || colorName.includes('ivory')) return 0xf4f4f5;
    if (colorName.includes('grey') || colorName.includes('gray') || colorName.includes('charcoal')) return 0x52525b;
    if (colorName.includes('blue') || colorName.includes('indigo') || colorName.includes('navy') || colorName.includes('denim')) return 0x1e3a8a;
    if (colorName.includes('green') || colorName.includes('olive') || colorName.includes('sage') || colorName.includes('khaki')) return 0x365314;
    if (colorName.includes('brown') || colorName.includes('espresso') || colorName.includes('mocha') || colorName.includes('camel')) return 0x78350f;
    if (colorName.includes('red') || colorName.includes('burgundy') || colorName.includes('maroon')) return 0x881337;
    if (colorName.includes('pink') || colorName.includes('rose')) return 0xdb2777;
    return defaultHex;
  }, []);

  // Update dynamic 3D clothing meshes whenever applied items change
  const updateClothingMeshes = useCallback(() => {
    if (!clothingGroupRef.current) return;
    const group = clothingGroupRef.current;

    // Clear previous clothing meshes
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
      group.remove(child);
    }

    // Categorize applied items
    const hatItem = appliedItems.find((i) => i.category.toLowerCase().includes('hat') || i.category.toLowerCase().includes('beanie'));
    const jacketItem = appliedItems.find((i) => i.category.toLowerCase().includes('jacket') || i.category.toLowerCase().includes('outerwear') || i.category.toLowerCase().includes('coat'));
    const topItem = appliedItems.find((i) => i.category.toLowerCase().includes('top') || i.category.toLowerCase().includes('shirt') || i.category.toLowerCase().includes('hoodie') || i.category.toLowerCase().includes('sweater'));
    const pantsItem = appliedItems.find((i) => i.category.toLowerCase().includes('pant') || i.category.toLowerCase().includes('bottom') || i.category.toLowerCase().includes('trouser') || i.category.toLowerCase().includes('jean'));
    const shoesItem = appliedItems.find((i) => i.category.toLowerCase().includes('shoe') || i.category.toLowerCase().includes('sneaker') || i.category.toLowerCase().includes('boot') || i.category.toLowerCase().includes('loafer'));
    const accessoryItem = appliedItems.find((i) => i.category.toLowerCase().includes('accessory') || i.category.toLowerCase().includes('bag') || i.category.toLowerCase().includes('eyewear'));

    // 1. Hat / Cap / Beanie (Head Layer)
    if (hatItem) {
      const hatColor = getItemColor(hatItem, 0x18181b);
      const hatGeo = new THREE.CylinderGeometry(0.24, 0.25, 0.16, 24);
      const hatMat = new THREE.MeshStandardMaterial({
        color: hatColor,
        roughness: 0.85,
        metalness: 0.1,
      });
      const hatMesh = new THREE.Mesh(hatGeo, hatMat);
      hatMesh.position.set(0, 1.88, 0);
      group.add(hatMesh);

      // Brim
      const brimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24);
      const brimMesh = new THREE.Mesh(brimGeo, hatMat);
      brimMesh.position.set(0, 1.82, 0.04);
      group.add(brimMesh);
    }

    // 2. Top / Shirt / T-Shirt / Hoodie (Torso Layer)
    const effectiveTop = topItem || (!jacketItem ? appliedItems[0] : undefined);
    if (effectiveTop) {
      const topColor = getItemColor(effectiveTop, 0x27272a);
      const topGeo = new THREE.CylinderGeometry(0.29, 0.26, 0.65, 24);
      const topMat = new THREE.MeshStandardMaterial({
        color: topColor,
        roughness: 0.7,
        metalness: 0.08,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.set(0, 1.25, 0);
      group.add(topMesh);

      // Sleeves (Upper Arms)
      const sleeveGeo = new THREE.CylinderGeometry(0.09, 0.085, 0.42, 16);
      const leftSleeve = new THREE.Mesh(sleeveGeo, topMat);
      leftSleeve.position.set(-0.36, 1.34, 0);
      leftSleeve.rotation.z = Math.PI / 11;
      group.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(sleeveGeo, topMat);
      rightSleeve.position.set(0.36, 1.34, 0);
      rightSleeve.rotation.z = -Math.PI / 11;
      group.add(rightSleeve);
    }

    // 3. Jacket / Outerwear (Outer Layer with Collar and Lapels)
    if (jacketItem) {
      const jacketColor = getItemColor(jacketItem, 0x09090b);
      const jacketGeo = new THREE.CylinderGeometry(0.32, 0.29, 0.72, 24);
      const jacketMat = new THREE.MeshStandardMaterial({
        color: jacketColor,
        roughness: 0.55,
        metalness: 0.15,
      });
      const jacketMesh = new THREE.Mesh(jacketGeo, jacketMat);
      jacketMesh.position.set(0, 1.25, 0);
      group.add(jacketMesh);

      // Jacket Sleeves
      const jSleeveGeo = new THREE.CylinderGeometry(0.105, 0.095, 0.58, 16);
      const jLeftSleeve = new THREE.Mesh(jSleeveGeo, jacketMat);
      jLeftSleeve.position.set(-0.38, 1.28, 0);
      jLeftSleeve.rotation.z = Math.PI / 9;
      group.add(jLeftSleeve);

      const jRightSleeve = new THREE.Mesh(jSleeveGeo, jacketMat);
      jRightSleeve.position.set(0.38, 1.28, 0);
      jRightSleeve.rotation.z = -Math.PI / 9;
      group.add(jRightSleeve);

      // Collar / Lapel Detail
      const collarGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 24, Math.PI);
      const collarMesh = new THREE.Mesh(collarGeo, jacketMat);
      collarMesh.position.set(0, 1.55, 0.06);
      collarMesh.rotation.x = Math.PI / 2.2;
      group.add(collarMesh);
    }

    // 4. Pants / Trousers / Jeans (Legs Layer)
    const effectivePants = pantsItem || (appliedItems.length > 1 ? appliedItems[1] : undefined);
    if (effectivePants) {
      const pantsColor = getItemColor(effectivePants, 0x1e293b);
      const pantsMat = new THREE.MeshStandardMaterial({
        color: pantsColor,
        roughness: 0.8,
        metalness: 0.1,
      });

      // Waist / Hips
      const hipsGeo = new THREE.CylinderGeometry(0.27, 0.26, 0.22, 20);
      const hipsMesh = new THREE.Mesh(hipsGeo, pantsMat);
      hipsMesh.position.set(0, 0.88, 0);
      group.add(hipsMesh);

      // Left Leg
      const legGeo = new THREE.CylinderGeometry(0.115, 0.1, 0.72, 16);
      const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
      leftLegMesh.position.set(-0.14, 0.45, 0);
      group.add(leftLegMesh);

      // Right Leg
      const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
      rightLegMesh.position.set(0.14, 0.45, 0);
      group.add(rightLegMesh);
    }

    // 5. Shoes / Sneakers / Boots
    const effectiveShoes = shoesItem || (appliedItems.length > 2 ? appliedItems[2] : undefined);
    if (effectiveShoes) {
      const shoesColor = getItemColor(effectiveShoes, 0x0f172a);
      const shoesMat = new THREE.MeshStandardMaterial({
        color: shoesColor,
        roughness: 0.4,
        metalness: 0.2,
      });

      const shoeGeo = new THREE.BoxGeometry(0.13, 0.1, 0.25);
      const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
      leftShoe.position.set(-0.14, 0.05, 0.04);
      group.add(leftShoe);

      const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
      rightShoe.position.set(0.14, 0.05, 0.04);
      group.add(rightShoe);
    }

    // 6. Accessories / Crossbody Bag
    if (accessoryItem) {
      const accColor = getItemColor(accessoryItem, 0x09090b);
      const accMat = new THREE.MeshStandardMaterial({
        color: accColor,
        roughness: 0.35,
        metalness: 0.25,
      });
      // Crossbody bag body
      const bagGeo = new THREE.BoxGeometry(0.18, 0.14, 0.08);
      const bagMesh = new THREE.Mesh(bagGeo, accMat);
      bagMesh.position.set(0.2, 1.05, 0.16);
      bagMesh.rotation.z = -0.15;
      group.add(bagMesh);

      // Crossbody strap
      const strapGeo = new THREE.TorusGeometry(0.35, 0.015, 8, 32, Math.PI * 1.4);
      const strapMesh = new THREE.Mesh(strapGeo, accMat);
      strapMesh.position.set(0, 1.25, 0.04);
      strapMesh.rotation.z = 0.55;
      strapMesh.rotation.y = 0.2;
      group.add(strapMesh);
    }
  }, [appliedItems, getItemColor]);

  // Initialize Three.js scene, camera, renderer, and stylized base mannequin
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup (framed on full human figure)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.05, 3.2);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true, // For capturing snapshots to share in chat
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 0.9 : 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, isLight ? 1.4 : 1.6);
    keyLight.position.set(2.5, 4.0, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(isLight ? 0xe2e8f0 : 0xa5b4fc, 0.8);
    fillLight.position.set(-2.5, 2.5, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, isLight ? 0.6 : 0.9);
    rimLight.position.set(0, 3.5, -3.0);
    scene.add(rimLight);

    // Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: isLight ? 0.18 : 0.45,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    // Master Avatar Group (Rotated 360 degrees by user drag)
    const masterAvatarGroup = new THREE.Group();
    avatarGroupRef.current = masterAvatarGroup;
    scene.add(masterAvatarGroup);

    // Base Mannequin Materials (Smooth ceramic aesthetic)
    const skinTone = isLight ? 0xf1f5f9 : 0x334155;
    const mannequinMaterial = new THREE.MeshStandardMaterial({
      color: skinTone,
      roughness: 0.35,
      metalness: 0.1,
    });

    const mannequinAccentMaterial = new THREE.MeshStandardMaterial({
      color: isLight ? 0x94a3b8 : 0x475569,
      roughness: 0.4,
      metalness: 0.15,
    });

    // 1. Head (Sculpted Egg / Visor Silhouette)
    const headGeo = new THREE.SphereGeometry(0.19, 24, 20);
    headGeo.scale(0.85, 1.1, 0.95);
    const headMesh = new THREE.Mesh(headGeo, mannequinMaterial);
    headMesh.position.set(0, 1.78, 0);
    masterAvatarGroup.add(headMesh);

    // Sleek Visor Eyeplate Accent
    const visorGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16, 1, false, 0, Math.PI);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xdb2777,
      roughness: 0.2,
      metalness: 0.8,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.79, 0.06);
    visorMesh.rotation.x = Math.PI / 2;
    masterAvatarGroup.add(visorMesh);

    // 2. Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.12, 16);
    const neckMesh = new THREE.Mesh(neckGeo, mannequinAccentMaterial);
    neckMesh.position.set(0, 1.62, 0);
    masterAvatarGroup.add(neckMesh);

    // 3. Torso Base
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.62, 20);
    const torsoMesh = new THREE.Mesh(torsoGeo, mannequinMaterial);
    torsoMesh.position.set(0, 1.25, 0);
    masterAvatarGroup.add(torsoMesh);

    // 4. Arms & Hands (Relaxed stylish natural posture)
    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.62, 14);

    const leftArmMesh = new THREE.Mesh(armGeo, mannequinMaterial);
    leftArmMesh.position.set(-0.35, 1.22, 0);
    leftArmMesh.rotation.z = Math.PI / 12;
    masterAvatarGroup.add(leftArmMesh);

    const rightArmMesh = new THREE.Mesh(armGeo, mannequinMaterial);
    rightArmMesh.position.set(0.35, 1.22, 0);
    rightArmMesh.rotation.z = -Math.PI / 12;
    masterAvatarGroup.add(rightArmMesh);

    // Hands
    const handGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const leftHand = new THREE.Mesh(handGeo, mannequinAccentMaterial);
    leftHand.position.set(-0.43, 0.88, 0);
    masterAvatarGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, mannequinAccentMaterial);
    rightHand.position.set(0.43, 0.88, 0);
    masterAvatarGroup.add(rightHand);

    // 5. Legs Base
    const legGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.78, 16);

    const leftLegMesh = new THREE.Mesh(legGeo, mannequinMaterial);
    leftLegMesh.position.set(-0.13, 0.44, 0);
    masterAvatarGroup.add(leftLegMesh);

    const rightLegMesh = new THREE.Mesh(legGeo, mannequinMaterial);
    rightLegMesh.position.set(0.13, 0.44, 0);
    masterAvatarGroup.add(rightLegMesh);

    // 6. Clothing Group (Dynamically populated with applied apparel)
    const clothingGroup = new THREE.Group();
    clothingGroupRef.current = clothingGroup;
    masterAvatarGroup.add(clothingGroup);

    // Render loop with smooth rotational inertia / damping
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isDraggingRef.current) {
        // Apply friction to spin velocity
        rotationVelocityRef.current *= 0.94;
        currentRotationYRef.current += rotationVelocityRef.current;
      }

      if (avatarGroupRef.current) {
        avatarGroupRef.current.rotation.y = currentRotationYRef.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Initial clothing load
    updateClothingMeshes();

    // Handle Resize
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isLight, updateClothingMeshes]);

  // Update clothes whenever applied items change
  useEffect(() => {
    updateClothingMeshes();
  }, [appliedItems, updateClothingMeshes]);

  // Capture snapshot callback if requested
  useEffect(() => {
    if (rendererRef.current && onSnapshotReady) {
      try {
        const url = rendererRef.current.domElement.toDataURL('image/png');
        if (url && url.length > 100) {
          onSnapshotReady(url);
        }
      } catch (e) {}
    }
  }, [appliedItems, onSnapshotReady]);

  // 360-degree Touch & Mouse Drag handlers with smooth inertia
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    prevMouseXRef.current = e.clientX;
    rotationVelocityRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseXRef.current;
    prevMouseXRef.current = e.clientX;

    const rotDelta = deltaX * 0.018;
    currentRotationYRef.current += rotDelta;
    rotationVelocityRef.current = rotDelta;

    if (avatarGroupRef.current) {
      avatarGroupRef.current.rotation.y = currentRotationYRef.current;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  return (
    <div className="relative w-full h-[310px] sm:h-[340px] flex items-center justify-center select-none overflow-hidden">
      {/* 3D WebGL Canvas Container with Drag-to-spin cursor */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        title="Drag left or right to spin avatar 360°"
      />

      {/* Loading Overlay while applying outfit */}
      {isApplying && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none rounded-2xl animate-in fade-in duration-150">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs font-black text-white drop-shadow-md tracking-wider uppercase font-mono">
            Fitting Clothes...
          </span>
        </div>
      )}
    </div>
  );
};
