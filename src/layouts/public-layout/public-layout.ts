import { Component, inject, signal, OnInit, AfterViewInit, OnDestroy, DestroyRef, NgZone, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AppHeader } from '@layouts/shared/app-header/app-header';
import { PublicFooter } from './public-footer/public-footer';
import { AuthService } from '@core/services/auth.service';

import * as THREE from 'three';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, AppHeader, PublicFooter],
  templateUrl: './public-layout.html'
})
export class PublicLayout implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  @ViewChild('networkCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  isMobileMenuOpen = signal(false);

  // Custom Cursor state
  cursorX = 0;
  cursorY = 0;
  cursorTargetX = 0;
  cursorTargetY = 0;
  isCursorHovering = false;
  isCursorClicked = false;
  private cursorAnimationId: number | null = null;

  // WebGL Background variables
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particlesMesh!: THREE.Points;
  private linesMesh!: THREE.LineSegments;
  private ring1!: THREE.Mesh;
  private ring2!: THREE.Mesh;
  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private clock = new THREE.Clock();
  private animationFrameId: number | null = null;

  get showChat(): boolean {
    const url = this.router.url;
    return this.auth.isAuthenticated()
      && !url.startsWith('/auth/login')
      && !url.startsWith('/auth/register');
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      document.body.classList.add('page-dark');
      this.initCustomCursor();
      this.ngZone.runOutsideAngular(() => {
        this.initWebGLBackground();
      });
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('page-dark');
      if (this.cursorAnimationId) cancelAnimationFrame(this.cursorAnimationId);
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      
      // Cleanup WebGL
      if (this.renderer) {
        this.renderer.dispose();
      }
      if (this.scene) {
        this.scene.clear();
      }
    }
  }

  /* ── Custom Cursor ── */
  private initCustomCursor() {
    if (typeof window === 'undefined') return;

    const onMouseMove = (e: MouseEvent) => {
      this.cursorTargetX = e.clientX;
      this.cursorTargetY = e.clientY;
    };

    const onMouseDown = () => {
      this.isCursorClicked = true;
      const inner = document.querySelector('.custom-cursor-inner');
      if (inner) inner.classList.add('cursor-clicked');
    };

    const onMouseUp = () => {
      this.isCursorClicked = false;
      const inner = document.querySelector('.custom-cursor-inner');
      if (inner) inner.classList.remove('cursor-clicked');
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    });

    const updateCursor = () => {
      const ease = 0.15;
      this.cursorX += (this.cursorTargetX - this.cursorX) * ease;
      this.cursorY += (this.cursorTargetY - this.cursorY) * ease;

      const cursorOuter = document.querySelector('.custom-cursor-outer') as HTMLElement;
      const cursorInner = document.querySelector('.custom-cursor-inner') as HTMLElement;

      if (cursorOuter && cursorInner) {
        cursorOuter.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;
        cursorInner.style.transform = `translate3d(${this.cursorTargetX}px, ${this.cursorTargetY}px, 0)`;
      }

      this.cursorAnimationId = requestAnimationFrame(updateCursor);
    };

    updateCursor();
    this.setupCursorHoverListeners();
  }

  setupCursorHoverListeners() {
    const checkHoverElements = () => {
      const hoverables = document.querySelectorAll('a, button, input, textarea, select, [routerLink], .domain-card, .specialist-premium, .interactive-card');
      hoverables.forEach((el) => {
        if (el.classList.contains('cursor-listener-added')) return;
        el.classList.add('cursor-listener-added');

        el.addEventListener('mouseenter', () => {
          this.isCursorHovering = true;
          const outer = document.querySelector('.custom-cursor-outer');
          if (outer) outer.classList.add('cursor-hover');
        });

        el.addEventListener('mouseleave', () => {
          this.isCursorHovering = false;
          const outer = document.querySelector('.custom-cursor-outer');
          if (outer) outer.classList.remove('cursor-hover');
        });
      });
    };

    const interval = setInterval(checkHoverElements, 800);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  /* ── Interactive WebGL Background ── */
  private initWebGLBackground() {
    if (typeof window === 'undefined') return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a192f, 0.0015);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 40;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Constellation / Navigation Network
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 80 : 150;
    this.particlePositions = new Float32Array(particlesCount * 3);
    this.particleVelocities = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    const color1 = new THREE.Color(0xF39C12); // True North Orange
    const color2 = new THREE.Color(0x1B4F72); // Deep Trust Blue

    for (let i = 0; i < particlesCount * 3; i += 3) {
      this.particlePositions[i] = (Math.random() - 0.5) * 80;     // x
      this.particlePositions[i + 1] = (Math.random() - 0.5) * 80; // y
      this.particlePositions[i + 2] = (Math.random() - 0.5) * 80; // z

      this.particleVelocities[i] = (Math.random() - 0.5) * 0.05;
      this.particleVelocities[i + 1] = (Math.random() - 0.5) * 0.05;
      this.particleVelocities[i + 2] = (Math.random() - 0.5) * 0.05;

      const mixColor = Math.random() > 0.5 ? color1 : color2;
      colorArray[i] = mixColor.r;
      colorArray[i + 1] = mixColor.g;
      colorArray[i + 2] = mixColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.particlesMesh = new THREE.Points(particlesGeometry, material);
    this.scene.add(this.particlesMesh);

    // Lines for Constellation Network
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x2E86AB,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    
    // Max possible lines = (n * (n-1)) / 2. We'll allocate a safe buffer.
    const maxLines = particlesCount * particlesCount;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    this.linesMesh = new THREE.LineSegments(lineGeometry, linesMaterial);
    this.scene.add(this.linesMesh);

    // Compass Rings (Identity)
    const ringGeo1 = new THREE.RingGeometry(20, 20.05, 128);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x2E86AB, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.ring1.rotation.x = Math.PI / 2;
    this.scene.add(this.ring1);

    const ringGeo2 = new THREE.RingGeometry(28, 28.1, 128);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xF39C12, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.ring2.rotation.x = Math.PI / 2;
    this.scene.add(this.ring2);

    // Center compass point
    const centerGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const centerMat = new THREE.MeshBasicMaterial({ color: 0xF39C12 });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    this.scene.add(centerMesh);

    // Interaction
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      this.mouseX = (event.clientX - windowHalfX) * 0.05;
      this.mouseY = (event.clientY - windowHalfY) * 0.05;
    };
    window.addEventListener('mousemove', onDocumentMouseMove);

    const onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const tick = () => {
      const elapsedTime = this.clock.getElapsedTime();

      this.targetX = this.mouseX * 0.001;
      this.targetY = this.mouseY * 0.001;

      // Update particle positions
      const positions = particlesGeometry.attributes['position'].array as Float32Array;
      let vertexIndex = 0;
      let lineIndex = 0;
      const linePositionsArr = lineGeometry.attributes['position'].array as Float32Array;

      for (let i = 0; i < particlesCount; i++) {
        // Move particles
        positions[vertexIndex] += this.particleVelocities[vertexIndex];
        positions[vertexIndex + 1] += this.particleVelocities[vertexIndex + 1];
        positions[vertexIndex + 2] += this.particleVelocities[vertexIndex + 2];

        // Bounds check
        if (Math.abs(positions[vertexIndex]) > 40) this.particleVelocities[vertexIndex] *= -1;
        if (Math.abs(positions[vertexIndex + 1]) > 40) this.particleVelocities[vertexIndex + 1] *= -1;
        if (Math.abs(positions[vertexIndex + 2]) > 40) this.particleVelocities[vertexIndex + 2] *= -1;

        // Connect lines
        for (let j = i + 1; j < particlesCount; j++) {
          const dx = positions[vertexIndex] - positions[j * 3];
          const dy = positions[vertexIndex + 1] - positions[j * 3 + 1];
          const dz = positions[vertexIndex + 2] - positions[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 150) { // connection radius
            linePositionsArr[lineIndex++] = positions[vertexIndex];
            linePositionsArr[lineIndex++] = positions[vertexIndex + 1];
            linePositionsArr[lineIndex++] = positions[vertexIndex + 2];
            
            linePositionsArr[lineIndex++] = positions[j * 3];
            linePositionsArr[lineIndex++] = positions[j * 3 + 1];
            linePositionsArr[lineIndex++] = positions[j * 3 + 2];
          }
        }
        vertexIndex += 3;
      }
      
      particlesGeometry.attributes['position'].needsUpdate = true;
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositionsArr.slice(0, lineIndex), 3));

      // Rotate group
      this.particlesMesh.rotation.y += 0.0005;
      this.particlesMesh.rotation.x += 0.0002;
      this.linesMesh.rotation.y = this.particlesMesh.rotation.y;
      this.linesMesh.rotation.x = this.particlesMesh.rotation.x;

      this.ring1.rotation.z = elapsedTime * 0.15;
      this.ring1.rotation.y = this.mouseX * 0.01;
      this.ring1.rotation.x = Math.PI / 2 + this.mouseY * 0.01;

      this.ring2.rotation.z = -elapsedTime * 0.1;
      this.ring2.rotation.y = this.mouseX * 0.005;
      this.ring2.rotation.x = Math.PI / 2 - this.mouseY * 0.005;

      // Smooth camera parallax
      this.camera.position.x += (this.mouseX * 0.2 - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.mouseY * 0.2 - this.camera.position.y) * 0.05;
      this.camera.lookAt(this.scene.position);

      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(tick);
    };
    tick();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', onResize);
      this.renderer.dispose();
      particlesGeometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      linesMaterial.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      centerGeo.dispose();
      centerMat.dispose();
    });
  }
}
