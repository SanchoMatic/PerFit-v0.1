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
  const baseClothingGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Rotation and spin physics state (360° smooth draggable rotation with inertia)
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

  // Update clothing layers: applied items overlay or replace default plain white casual clothing
  const updateClothingMeshes = useCallback(() => {
    if (!clothingGroupRef.current || !baseClothingGroupRef.current) return;
    const group = clothingGroupRef.current;
    const baseGroup = baseClothingGroupRef.current;

    // Clear previous applied clothing meshes
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
    const hatItem = appliedItems.find(
      (i) =>
        i.category.toLowerCase().includes('hat') ||
        i.category.toLowerCase().includes('headwear') ||
        i.category.toLowerCase().includes('beanie') ||
        i.category.toLowerCase().includes('cap')
    );
    const jacketItem = appliedItems.find(
      (i) =>
        i.category.toLowerCase().includes('jacket') ||
        i.category.toLowerCase().includes('outerwear') ||
        i.category.toLowerCase().includes('coat')
    );
    const topItem = appliedItems.find(
      (i) =>
        i.category.toLowerCase().includes('top') ||
        i.category.toLowerCase().includes('shirt') ||
        i.category.toLowerCase().includes('hoodie') ||
        i.category.toLowerCase().includes('sweater') ||
        i.category.toLowerCase().includes('tee')
    );
    const pantsItem = appliedItems.find(
      (i) =>
        i.category.toLowerCase().includes('pant') ||
        i.category.toLowerCase().includes('bottom') ||
        i.category.toLowerCase().includes('trouser') ||
        i.category.toLowerCase().includes('jean') ||
        i.category.toLowerCase().includes('short')
    );
    const shoesItem = appliedItems.find(
      (i) =>
        i.category.toLowerCase().includes('shoe') ||
        i.category.toLowerCase().includes('sneaker') ||
        i.category.toLowerCase().includes('boot') ||
        i.category.toLowerCase().includes('loafer')
    );
    const accessoryItem = appliedItems.find(
      (i) =>
        i.category.toLowerCase().includes('accessory') ||
        i.category.toLowerCase().includes('bag') ||
        i.category.toLowerCase().includes('watch')
    );
    const eyewearItem = appliedItems.find(
      (i) =>
        i.category.toLowerCase().includes('eye') ||
        i.category.toLowerCase().includes('glass')
    );

    // Toggle base clothing visibility: if applied item replaces a layer, hide base part
    baseGroup.children.forEach((child) => {
      if (child.name === 'baseTop') {
        child.visible = !topItem && !jacketItem;
      } else if (child.name === 'basePants') {
        child.visible = !pantsItem;
      } else if (child.name === 'baseShoes') {
        child.visible = !shoesItem;
      }
    });

    // 1. Headwear / Cap / Beanie (Layers on top of short curly hair)
    if (hatItem) {
      const hatColor = getItemColor(hatItem, 0x18181b);
      const hatGeo = new THREE.CylinderGeometry(0.22, 0.23, 0.15, 24);
      const hatMat = new THREE.MeshStandardMaterial({
        color: hatColor,
        roughness: 0.85,
        metalness: 0.08,
      });
      const hatMesh = new THREE.Mesh(hatGeo, hatMat);
      hatMesh.position.set(0, 1.88, 0.02);
      group.add(hatMesh);

      // Brim
      const brimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.02, 24);
      const brimMesh = new THREE.Mesh(brimGeo, hatMat);
      brimMesh.position.set(0, 1.82, 0.05);
      group.add(brimMesh);
    }

    // 2. Eyewear (Sunglasses / Designer Frames)
    if (eyewearItem) {
      const glassesFrameMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.2,
        metalness: 0.8,
      });
      const glassesLensMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.1,
        metalness: 0.9,
      });

      const frameGeo = new THREE.BoxGeometry(0.26, 0.04, 0.03);
      const frameMesh = new THREE.Mesh(frameGeo, glassesFrameMat);
      frameMesh.position.set(0, 1.76, 0.14);
      group.add(frameMesh);

      const lensGeo = new THREE.BoxGeometry(0.08, 0.05, 0.01);
      const leftLens = new THREE.Mesh(lensGeo, glassesLensMat);
      leftLens.position.set(-0.065, 1.75, 0.15);
      group.add(leftLens);

      const rightLens = new THREE.Mesh(lensGeo, glassesLensMat);
      rightLens.position.set(0.065, 1.75, 0.15);
      group.add(rightLens);
    }

    // 3. Top / Shirt / Hoodie
    if (topItem) {
      const topColor = getItemColor(topItem, 0x27272a);
      const topGeo = new THREE.CylinderGeometry(0.27, 0.25, 0.64, 24);
      const topMat = new THREE.MeshStandardMaterial({
        color: topColor,
        roughness: 0.72,
        metalness: 0.08,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.set(0, 1.25, 0);
      group.add(topMesh);

      // Sleeves
      const sleeveGeo = new THREE.CylinderGeometry(0.09, 0.082, 0.42, 16);
      const leftSleeve = new THREE.Mesh(sleeveGeo, topMat);
      leftSleeve.position.set(-0.35, 1.34, 0);
      leftSleeve.rotation.z = Math.PI / 11;
      group.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(sleeveGeo, topMat);
      rightSleeve.position.set(0.35, 1.34, 0);
      rightSleeve.rotation.z = -Math.PI / 11;
      group.add(rightSleeve);
    }

    // 4. Jacket / Outerwear
    if (jacketItem) {
      const jacketColor = getItemColor(jacketItem, 0x09090b);
      const jacketGeo = new THREE.CylinderGeometry(0.3, 0.28, 0.72, 24);
      const jacketMat = new THREE.MeshStandardMaterial({
        color: jacketColor,
        roughness: 0.55,
        metalness: 0.15,
      });
      const jacketMesh = new THREE.Mesh(jacketGeo, jacketMat);
      jacketMesh.position.set(0, 1.25, 0);
      group.add(jacketMesh);

      const jSleeveGeo = new THREE.CylinderGeometry(0.105, 0.095, 0.58, 16);
      const jLeftSleeve = new THREE.Mesh(jSleeveGeo, jacketMat);
      jLeftSleeve.position.set(-0.37, 1.28, 0);
      jLeftSleeve.rotation.z = Math.PI / 9;
      group.add(jLeftSleeve);

      const jRightSleeve = new THREE.Mesh(jSleeveGeo, jacketMat);
      jRightSleeve.position.set(0.37, 1.28, 0);
      jRightSleeve.rotation.z = -Math.PI / 9;
      group.add(jRightSleeve);

      const collarGeo = new THREE.TorusGeometry(0.18, 0.035, 12, 24, Math.PI);
      const collarMesh = new THREE.Mesh(collarGeo, jacketMat);
      collarMesh.position.set(0, 1.55, 0.06);
      collarMesh.rotation.x = Math.PI / 2.2;
      group.add(collarMesh);
    }

    // 5. Pants / Trousers / Jeans
    if (pantsItem) {
      const pantsColor = getItemColor(pantsItem, 0x1e293b);
      const pantsMat = new THREE.MeshStandardMaterial({
        color: pantsColor,
        roughness: 0.8,
        metalness: 0.08,
      });

      const hipsGeo = new THREE.CylinderGeometry(0.26, 0.25, 0.22, 20);
      const hipsMesh = new THREE.Mesh(hipsGeo, pantsMat);
      hipsMesh.position.set(0, 0.88, 0);
      group.add(hipsMesh);

      const legGeo = new THREE.CylinderGeometry(0.115, 0.098, 0.72, 16);
      const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
      leftLegMesh.position.set(-0.14, 0.45, 0);
      group.add(leftLegMesh);

      const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
      rightLegMesh.position.set(0.14, 0.45, 0);
      group.add(rightLegMesh);
    }

    // 6. Shoes / Sneakers
    if (shoesItem) {
      const shoesColor = getItemColor(shoesItem, 0x0f172a);
      const shoesMat = new THREE.MeshStandardMaterial({
        color: shoesColor,
        roughness: 0.4,
        metalness: 0.2,
      });

      const shoeGeo = new THREE.BoxGeometry(0.13, 0.1, 0.26);
      const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
      leftShoe.position.set(-0.14, 0.05, 0.04);
      group.add(leftShoe);

      const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
      rightShoe.position.set(0.14, 0.05, 0.04);
      group.add(rightShoe);
    }

    // 7. Accessories / Crossbody Bag
    if (accessoryItem) {
      const accColor = getItemColor(accessoryItem, 0x09090b);
      const accMat = new THREE.MeshStandardMaterial({
        color: accColor,
        roughness: 0.35,
        metalness: 0.25,
      });
      const bagGeo = new THREE.BoxGeometry(0.18, 0.14, 0.08);
      const bagMesh = new THREE.Mesh(bagGeo, accMat);
      bagMesh.position.set(0.2, 1.05, 0.16);
      bagMesh.rotation.z = -0.15;
      group.add(bagMesh);

      const strapGeo = new THREE.TorusGeometry(0.35, 0.015, 8, 32, Math.PI * 1.4);
      const strapMesh = new THREE.Mesh(strapGeo, accMat);
      strapMesh.position.set(0, 1.25, 0.04);
      strapMesh.rotation.z = 0.55;
      strapMesh.rotation.y = 0.2;
      group.add(strapMesh);
    }
  }, [appliedItems, getItemColor]);

  // Initialize Three.js scene: Generic, photorealistic 3D human model with medium brown skin,
  // short dark curly hair, and plain casual base white clothing as the default look
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup (framed comfortably on human model)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.05, 3.25);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 0.9 : 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, isLight ? 1.45 : 1.6);
    keyLight.position.set(2.2, 3.8, 2.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.75);
    fillLight.position.set(-2.4, 2.4, 1.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf472b6, 0.65);
    rimLight.position.set(0, 3.2, -2.8);
    scene.add(rimLight);

    // Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: isLight ? 0.18 : 0.42,
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

    // ========================================================
    // PHOTOREALISTIC HUMAN MODEL CONSTRUCTION
    // 1. Medium Brown Skin (Natural warm melanin tone, realistic PBR texture)
    // ========================================================
    const mediumBrownSkinColor = 0x945b3d;
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: mediumBrownSkinColor,
      roughness: 0.58,
      metalness: 0.04,
    });

    const skinAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x824e33, // Subtle contour tone for hands/joints/ears
      roughness: 0.6,
      metalness: 0.04,
    });

    // --- Head (Natural human head anatomy with jawline and temples) ---
    const headGeo = new THREE.SphereGeometry(0.18, 32, 28);
    headGeo.scale(0.88, 1.12, 0.98);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.position.set(0, 1.76, 0);
    masterAvatarGroup.add(headMesh);

    // Sculpted Jaw and Chin
    const chinGeo = new THREE.SphereGeometry(0.075, 20, 16);
    chinGeo.scale(0.9, 0.7, 0.9);
    const chinMesh = new THREE.Mesh(chinGeo, skinMaterial);
    chinMesh.position.set(0, 1.63, 0.08);
    masterAvatarGroup.add(chinMesh);

    // Sculpted Nose
    const noseGeo = new THREE.ConeGeometry(0.026, 0.07, 12);
    noseGeo.rotateX(Math.PI / 2.2);
    const noseMesh = new THREE.Mesh(noseGeo, skinAccentMaterial);
    noseMesh.position.set(0, 1.74, 0.17);
    masterAvatarGroup.add(noseMesh);

    // Natural Eyes (Sclera + Dark brown iris + pupil)
    const eyeScleraMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.05,
    });
    const eyeIrisMat = new THREE.MeshStandardMaterial({
      color: 0x22130d, // Dark brown iris
      roughness: 0.1,
      metalness: 0.1,
    });

    // Left Eye
    const eyeGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, eyeScleraMat);
    leftEye.position.set(-0.062, 1.77, 0.14);
    masterAvatarGroup.add(leftEye);

    const pupilGeo = new THREE.SphereGeometry(0.013, 12, 12);
    const leftPupil = new THREE.Mesh(pupilGeo, eyeIrisMat);
    leftPupil.position.set(-0.062, 1.77, 0.16);
    masterAvatarGroup.add(leftPupil);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeScleraMat);
    rightEye.position.set(0.062, 1.77, 0.14);
    masterAvatarGroup.add(rightEye);

    const rightPupil = new THREE.Mesh(pupilGeo, eyeIrisMat);
    rightPupil.position.set(0.062, 1.77, 0.16);
    masterAvatarGroup.add(rightPupil);

    // Natural Sculpted Eyebrows
    const browMat = new THREE.MeshStandardMaterial({
      color: 0x16110e,
      roughness: 0.9,
    });
    const browGeo = new THREE.BoxGeometry(0.05, 0.012, 0.02);
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.065, 1.815, 0.155);
    leftBrow.rotation.z = 0.06;
    masterAvatarGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.065, 1.815, 0.155);
    rightBrow.rotation.z = -0.06;
    masterAvatarGroup.add(rightBrow);

    // Sculpted Lips
    const lipsMat = new THREE.MeshStandardMaterial({
      color: 0x784433,
      roughness: 0.45,
    });
    const lipsGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.014, 16);
    lipsGeo.rotateZ(Math.PI / 2);
    const lipsMesh = new THREE.Mesh(lipsGeo, lipsMat);
    lipsMesh.position.set(0, 1.675, 0.145);
    masterAvatarGroup.add(lipsMesh);

    // Sculpted Ears
    const earGeo = new THREE.SphereGeometry(0.045, 16, 12);
    earGeo.scale(0.35, 0.85, 0.5);
    const leftEar = new THREE.Mesh(earGeo, skinAccentMaterial);
    leftEar.position.set(-0.16, 1.75, 0.01);
    leftEar.rotation.y = -0.15;
    masterAvatarGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinAccentMaterial);
    rightEar.position.set(0.16, 1.75, 0.01);
    rightEar.rotation.y = 0.15;
    masterAvatarGroup.add(rightEar);

    // ========================================================
    // 2. Short Dark Curly Hair (Natural textured curly clumps/coils)
    // ========================================================
    const hairColor = 0x17120e;
    const curlyHairMat = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.88,
      metalness: 0.05,
    });

    const hairGroup = new THREE.Group();
    masterAvatarGroup.add(hairGroup);

    // Main curly crown cap
    const crownCapGeo = new THREE.SphereGeometry(0.185, 24, 20);
    crownCapGeo.scale(0.9, 0.95, 0.98);
    const crownCap = new THREE.Mesh(crownCapGeo, curlyHairMat);
    crownCap.position.set(0, 1.82, -0.01);
    hairGroup.add(crownCap);

    // Coiled textured curls clusters on top and crown for photorealistic curly hair volume
    const curlClusterGeo = new THREE.SphereGeometry(0.038, 12, 10);
    const curlPositions: [number, number, number][] = [
      [0, 1.95, 0.02],
      [-0.07, 1.93, 0.04],
      [0.07, 1.93, 0.04],
      [-0.11, 1.9, 0.01],
      [0.11, 1.9, 0.01],
      [0, 1.92, -0.07],
      [-0.06, 1.89, -0.08],
      [0.06, 1.89, -0.08],
      [-0.12, 1.84, -0.04],
      [0.12, 1.84, -0.04],
      [-0.05, 1.91, 0.08],
      [0.05, 1.91, 0.08],
      [0, 1.88, 0.12], // Front natural curly hairline
      [-0.08, 1.85, 0.1],
      [0.08, 1.85, 0.1],
      [-0.14, 1.81, 0.03],
      [0.14, 1.81, 0.03],
    ];

    curlPositions.forEach(([x, y, z]) => {
      const curlMesh = new THREE.Mesh(curlClusterGeo, curlyHairMat);
      curlMesh.position.set(x, y, z);
      curlMesh.scale.set(1 + Math.sin(x * 10) * 0.15, 0.85, 1 + Math.cos(z * 10) * 0.15);
      hairGroup.add(curlMesh);
    });

    // --- Neck ---
    const neckGeo = new THREE.CylinderGeometry(0.085, 0.098, 0.14, 20);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.set(0, 1.58, 0);
    masterAvatarGroup.add(neckMesh);

    // --- Body / Torso Anatomy Underneath ---
    const torsoAnatomyGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.6, 24);
    const torsoAnatomy = new THREE.Mesh(torsoAnatomyGeo, skinMaterial);
    torsoAnatomy.position.set(0, 1.25, 0);
    masterAvatarGroup.add(torsoAnatomy);

    // --- Arms Anatomy (Natural skin tone with elbow/forearm) ---
    const armGeo = new THREE.CylinderGeometry(0.065, 0.052, 0.6, 16);

    const leftArmMesh = new THREE.Mesh(armGeo, skinMaterial);
    leftArmMesh.position.set(-0.35, 1.22, 0);
    leftArmMesh.rotation.z = Math.PI / 12;
    masterAvatarGroup.add(leftArmMesh);

    const rightArmMesh = new THREE.Mesh(armGeo, skinMaterial);
    rightArmMesh.position.set(0.35, 1.22, 0);
    rightArmMesh.rotation.z = -Math.PI / 12;
    masterAvatarGroup.add(rightArmMesh);

    // Realistic Hands
    const handGeo = new THREE.SphereGeometry(0.048, 16, 14);
    handGeo.scale(0.85, 1.2, 0.65);
    const leftHand = new THREE.Mesh(handGeo, skinAccentMaterial);
    leftHand.position.set(-0.43, 0.88, 0);
    masterAvatarGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinAccentMaterial);
    rightHand.position.set(0.43, 0.88, 0);
    masterAvatarGroup.add(rightHand);

    // --- Legs Anatomy ---
    const legGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.76, 18);

    const leftLegMesh = new THREE.Mesh(legGeo, skinMaterial);
    leftLegMesh.position.set(-0.13, 0.44, 0);
    masterAvatarGroup.add(leftLegMesh);

    const rightLegMesh = new THREE.Mesh(legGeo, skinMaterial);
    rightLegMesh.position.set(0.13, 0.44, 0);
    masterAvatarGroup.add(rightLegMesh);

    // ========================================================
    // 3. PLAIN CASUAL BASE WHITE CLOTHING (Default look before items are applied)
    // - Clean white crewneck t-shirt
    // - Clean white relaxed casual trousers
    // - Clean minimalist white sneakers
    // ========================================================
    const baseClothingGroup = new THREE.Group();
    baseClothingGroupRef.current = baseClothingGroup;
    masterAvatarGroup.add(baseClothingGroup);

    const baseWhiteClothMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp clean white
      roughness: 0.72,
      metalness: 0.05,
    });

    const baseWhitePantMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Soft casual white chino/denim
      roughness: 0.78,
      metalness: 0.04,
    });

    const baseWhiteSneakerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0.12,
    });

    // --- Base White T-Shirt (Crewneck Tee) ---
    const baseTopGroup = new THREE.Group();
    baseTopGroup.name = 'baseTop';

    const baseTeeBodyGeo = new THREE.CylinderGeometry(0.265, 0.24, 0.62, 24);
    const baseTeeBody = new THREE.Mesh(baseTeeBodyGeo, baseWhiteClothMat);
    baseTeeBody.position.set(0, 1.25, 0);
    baseTopGroup.add(baseTeeBody);

    // Ribbed Crewneck Collar
    const teeCollarGeo = new THREE.TorusGeometry(0.11, 0.02, 12, 24);
    const teeCollar = new THREE.Mesh(teeCollarGeo, baseWhiteClothMat);
    teeCollar.position.set(0, 1.54, 0.02);
    teeCollar.rotation.x = Math.PI / 2.2;
    baseTopGroup.add(teeCollar);

    // White T-shirt Sleeves
    const teeSleeveGeo = new THREE.CylinderGeometry(0.088, 0.08, 0.3, 16);
    const leftTeeSleeve = new THREE.Mesh(teeSleeveGeo, baseWhiteClothMat);
    leftTeeSleeve.position.set(-0.33, 1.37, 0);
    leftTeeSleeve.rotation.z = Math.PI / 10;
    baseTopGroup.add(leftTeeSleeve);

    const rightTeeSleeve = new THREE.Mesh(teeSleeveGeo, baseWhiteClothMat);
    rightTeeSleeve.position.set(0.33, 1.37, 0);
    rightTeeSleeve.rotation.z = -Math.PI / 10;
    baseTopGroup.add(rightTeeSleeve);

    baseClothingGroup.add(baseTopGroup);

    // --- Base Plain White Casual Trousers ---
    const basePantsGroup = new THREE.Group();
    basePantsGroup.name = 'basePants';

    const basePantsHipsGeo = new THREE.CylinderGeometry(0.255, 0.245, 0.2, 22);
    const basePantsHips = new THREE.Mesh(basePantsHipsGeo, baseWhitePantMat);
    basePantsHips.position.set(0, 0.88, 0);
    basePantsGroup.add(basePantsHips);

    const basePantLegGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.72, 18);
    const leftBasePantLeg = new THREE.Mesh(basePantLegGeo, baseWhitePantMat);
    leftBasePantLeg.position.set(-0.135, 0.45, 0);
    basePantsGroup.add(leftBasePantLeg);

    const rightBasePantLeg = new THREE.Mesh(basePantLegGeo, baseWhitePantMat);
    rightBasePantLeg.position.set(0.135, 0.45, 0);
    basePantsGroup.add(rightBasePantLeg);

    baseClothingGroup.add(basePantsGroup);

    // --- Base Clean White Minimalist Sneakers ---
    const baseShoesGroup = new THREE.Group();
    baseShoesGroup.name = 'baseShoes';

    const baseShoeGeo = new THREE.BoxGeometry(0.125, 0.09, 0.25);
    const leftBaseShoe = new THREE.Mesh(baseShoeGeo, baseWhiteSneakerMat);
    leftBaseShoe.position.set(-0.135, 0.048, 0.035);
    baseShoesGroup.add(leftBaseShoe);

    const rightBaseShoe = new THREE.Mesh(baseShoeGeo, baseWhiteSneakerMat);
    rightBaseShoe.position.set(0.135, 0.048, 0.035);
    baseShoesGroup.add(rightBaseShoe);

    baseClothingGroup.add(baseShoesGroup);

    // --- Applied Clothing Group (Dynamically filled when user taps 'Try On') ---
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

    // Initial clothing update
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
      scene.clear();
    };
  }, [isLight, updateClothingMeshes]);

  // Update dynamic clothing when applied items change
  useEffect(() => {
    updateClothingMeshes();

    // Emit snapshot of avatar for sharing once fitting finishes
    if (!isApplying && onSnapshotReady && rendererRef.current) {
      setTimeout(() => {
        try {
          const dataUrl = rendererRef.current?.domElement.toDataURL('image/png');
          if (dataUrl) onSnapshotReady(dataUrl);
        } catch {
          // ignore
        }
      }, 100);
    }
  }, [appliedItems, isApplying, onSnapshotReady, updateClothingMeshes]);

  // Mouse / Touch 360-degree rotation gesture handlers (smooth drag & spin in either direction)
  const handlePointerDown = (clientX: number) => {
    isDraggingRef.current = true;
    prevMouseXRef.current = clientX;
    rotationVelocityRef.current = 0;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - prevMouseXRef.current;
    prevMouseXRef.current = clientX;
    // Update velocity and rotation
    const rotationDelta = deltaX * 0.015;
    rotationVelocityRef.current = rotationDelta;
    currentRotationYRef.current += rotationDelta;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full aspect-[4/5] max-h-[380px] flex items-center justify-center select-none touch-none">
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        title="Drag left or right to spin avatar 360°"
      />

      {/* Subtle fitting pulse overlay while fitting */}
      {isApplying && (
        <div className="absolute inset-0 bg-pink-500/10 backdrop-blur-[2px] rounded-3xl flex items-center justify-center pointer-events-none animate-pulse">
          <span className="px-3.5 py-1.5 rounded-full bg-black/80 text-white font-mono text-xs font-bold border border-pink-500/50 shadow-xl">
            Fitting Garments...
          </span>
        </div>
      )}
    </div>
  );
};
