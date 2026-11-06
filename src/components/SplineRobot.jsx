import React, { Suspense, useState, useEffect, useRef, Component } from 'react';

// Lazy load @splinetool/react-spline for optimal performance
const Spline = React.lazy(() => import('@splinetool/react-spline'));

/**
 * Robust Error Boundary to isolate any 3D runtime / buffer deserialization faults
 */
class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[SplineRobot] Caught 3D scene runtime deserialization issue:', error?.message || error);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * SplineRobot Component
 * 
 * Mastercrafted 3D AI Assistant Robot for the AI QUIZ BATTLE hero dashboard.
 * Perfectly balanced across both Left and Right 3/4 viewing angles with:
 * - Symmetrical 3D side geometry: Full-depth cranium flanks, beveled cheek plates,
 *   temple audio pods with gold acoustic torus rings on BOTH sides
 * - Balanced dual-rim lighting: Matching golden rim highlights on left and right flanks
 * - True Z-depth: Extruded visor return walls, angled jaw guard, forward-pushed reactor core
 * - Smooth ±6° idle yaw sweep continuously revealing both 3D profiles
 * - Full-viewport cursor tracking smoothly transitioning between left and right 3/4 views
 * - Queued mechanical eye-blink interaction on click/tap
 */
export default function SplineRobot({ 
  scene = import.meta.env.VITE_SPLINE_SCENE_URL || "",
  className = "" 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const splineAppRef = useRef(null);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });

  // Blink interaction queue & state refs
  const blinkQueueRef = useRef(0);
  const isBlinkingRef = useRef(false);
  const blinkStartTimeRef = useRef(0);

  // Direct DOM element refs for butter-smooth 60+ FPS motion without React re-render overhead
  const floatingRef = useRef(null);
  const headRef = useRef(null);
  const torsoRef = useRef(null);
  const eyesRef = useRef(null);
  const eyeLeftRef = useRef(null);
  const eyeRightRef = useRef(null);
  const gleamRef = useRef(null);
  const ambientGlowRef = useRef(null);

  // Queue click/tap blink interaction on the robot
  const handleRobotPointerDown = (e) => {
    if (e && e.button !== undefined && e.button !== 0) return;
    
    if (!isBlinkingRef.current) {
      isBlinkingRef.current = true;
      blinkStartTimeRef.current = performance.now();
    } else {
      blinkQueueRef.current += 1;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRobotPointerDown(e);
    }
  };

  useEffect(() => {
    // Viewport-wide pointer tracking across the full browser/dashboard
    const handlePointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const rawNy = (e.clientY / window.innerHeight) * 2 - 1;
      const ny = Math.max(-1, Math.min(1, rawNy * 1.2));
      targetPosRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: ny
      };
    };

    const handlePointerLeave = () => {
      targetPosRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);

    let animationFrameId;
    const t0 = performance.now();

    const tick = (now) => {
      const elapsed = (now - t0) / 1000;

      // Easing interpolation strength: 0.10 per frame
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * 0.10;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * 0.10;

      const curX = currentPosRef.current.x;
      const curY = currentPosRef.current.y;

      // 1. Slow floating idle motion (vertical sine wave)
      const floatY = Math.sin(elapsed * 1.4) * 6.5;

      // 2. Slow balanced idle yaw rotation (±6.0°) sweeping between left and right 3/4 profiles
      const idleHeadYaw = Math.sin(elapsed * 0.70) * 6.0;
      const idleHeadPitch = Math.cos(elapsed * 0.50) * 2.2;
      const idleTorsoYaw = Math.sin(elapsed * 0.70) * 2.4;
      const idleTorsoPitch = Math.cos(elapsed * 0.50) * 1.2;

      // 3. Head angles: Symmetrical left/right cursor tracking + idle sweep + natural camera elevation (-3.5°)
      const headYaw = curX * 24 + idleHeadYaw;
      const pitchRange = curY < 0 ? 20 : 18;
      const headPitch = -curY * pitchRange + idleHeadPitch - 3.5;
      const headRoll = curX * 2.2;

      // 4. Torso angles: Proportional follow
      const torsoYaw = curX * 5 + idleTorsoYaw;
      const torsoPitch = -curY * 2.5 + idleTorsoPitch - 1.5;

      // 5. Eyes & Visor direction reaction
      const eyeShiftX = curX * 6;
      const eyeShiftY = curY * 4.5;

      // 6. Eye-Blink Animation Processing (145ms mechanical blink with queue)
      let eyeScaleY = 1.0;
      let eyeGlowAlpha = 1.0;

      if (isBlinkingRef.current) {
        const tBlink = now - blinkStartTimeRef.current;
        const BLINK_DOWN = 45;
        const BLINK_HOLD = 25;
        const BLINK_UP = 75;
        const BLINK_ACTIVE = BLINK_DOWN + BLINK_HOLD + BLINK_UP;
        const BLINK_GAP = 35;

        if (tBlink < BLINK_DOWN) {
          const p = tBlink / BLINK_DOWN;
          eyeScaleY = 1.0 - p * 0.92;
          eyeGlowAlpha = 1.0 - p * 0.50;
        } else if (tBlink < BLINK_DOWN + BLINK_HOLD) {
          eyeScaleY = 0.08;
          eyeGlowAlpha = 0.50;
        } else if (tBlink < BLINK_ACTIVE) {
          const p = (tBlink - (BLINK_DOWN + BLINK_HOLD)) / BLINK_UP;
          const easeOut = 1 - Math.pow(1 - p, 2);
          eyeScaleY = 0.08 + easeOut * 0.92;
          eyeGlowAlpha = 0.50 + easeOut * 0.50;
        } else {
          eyeScaleY = 1.0;
          eyeGlowAlpha = 1.0;

          if (blinkQueueRef.current > 0) {
            if (tBlink >= BLINK_ACTIVE + BLINK_GAP) {
              blinkQueueRef.current -= 1;
              blinkStartTimeRef.current = now;
            }
          } else {
            isBlinkingRef.current = false;
          }
        }
      }

      // Ambient pulse multiplier
      const pulseMultiplier = 0.92 + Math.sin(elapsed * 2.5) * 0.08;

      // Direct DOM transforms
      if (floatingRef.current) {
        floatingRef.current.style.transform = `translate3d(0, ${floatY.toFixed(2)}px, 0)`;
      }

      if (headRef.current) {
        headRef.current.style.transform = `perspective(950px) rotateY(${headYaw.toFixed(2)}deg) rotateX(${headPitch.toFixed(2)}deg) rotateZ(${headRoll.toFixed(2)}deg)`;
      }

      if (torsoRef.current) {
        torsoRef.current.style.transform = `perspective(950px) rotateY(${torsoYaw.toFixed(2)}deg) rotateX(${torsoPitch.toFixed(2)}deg)`;
      }

      if (eyesRef.current) {
        eyesRef.current.style.transform = `translate3d(${eyeShiftX.toFixed(2)}px, ${eyeShiftY.toFixed(2)}px, 4px)`;
      }

      if (eyeLeftRef.current) {
        eyeLeftRef.current.style.transform = `scaleY(${eyeScaleY.toFixed(3)}) rotate(-2deg)`;
        eyeLeftRef.current.style.opacity = (eyeGlowAlpha * pulseMultiplier).toFixed(2);
        eyeLeftRef.current.style.boxShadow = `0 0 ${(18 * eyeGlowAlpha).toFixed(1)}px #ff9400`;
      }

      if (eyeRightRef.current) {
        eyeRightRef.current.style.transform = `scaleY(${eyeScaleY.toFixed(3)}) rotate(2deg)`;
        eyeRightRef.current.style.opacity = (eyeGlowAlpha * pulseMultiplier).toFixed(2);
        eyeRightRef.current.style.boxShadow = `0 0 ${(18 * eyeGlowAlpha).toFixed(1)}px #ff9400`;
      }

      if (gleamRef.current) {
        gleamRef.current.style.transform = `translate3d(${(curX * 18).toFixed(2)}px, ${(curY * 7).toFixed(2)}px, 3px)`;
      }

      if (ambientGlowRef.current) {
        ambientGlowRef.current.style.transform = `translate3d(${(curX * 28).toFixed(2)}px, ${(curY * 28).toFixed(2)}px, 0)`;
      }

      // Update Spline 3D scene objects if runtime instance is active
      if (splineAppRef.current) {
        try {
          const app = splineAppRef.current;
          const headObj = app.findObjectByName?.('Head Assembly');
          if (headObj) {
            headObj.rotation.y = (headYaw * Math.PI) / 180;
            headObj.rotation.x = (headPitch * Math.PI) / 180;
          }
          const torsoObj = app.findObjectByName?.('Body Base Assembly');
          if (torsoObj) {
            torsoObj.rotation.y = (torsoYaw * Math.PI) / 180;
            torsoObj.rotation.x = (torsoPitch * Math.PI) / 180;
          }
          const eyeL = app.findObjectByName?.('Eye Left');
          const eyeR = app.findObjectByName?.('Eye Right');
          if (eyeL && eyeR) {
            eyeL.position.x = -23 + curX * 3.5;
            eyeR.position.x = 23 + curX * 3.5;
            eyeL.position.y = 5.5 - curY * 3.0;
            eyeR.position.y = 5.5 - curY * 3.0;
            eyeL.scale.y = eyeScaleY;
            eyeR.scale.y = eyeScaleY;
          }
        } catch (err) {
          // Gracefully continue
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSplineLoad = (splineApp) => {
    splineAppRef.current = splineApp;
    setIsLoaded(true);
    setHasError(false);
  };

  // Dedicated Cybernetic Assistant Visual Stage with Symmetrical Left & Right 3D Depth
  const renderRobotStage = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4">
      {/* Floating Robot Bust in 3D Space */}
      <div 
        ref={floatingRef}
        className="relative flex flex-col items-center justify-center will-change-transform"
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* ========================================================================= */}
        {/* 1. HEAD ASSEMBLY (With Symmetrical Left & Right 3D Side Walls & Ear Pods) */}
        {/* ========================================================================= */}
        <div 
          ref={headRef}
          className="relative flex flex-col items-center justify-center will-change-transform z-20"
          style={{ 
            transformOrigin: '50% 88% -30px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Crown Armor Cap & Gold Spine Trim (Protruding Z: +18px with Dual Rim Highlights) */}
          <div 
            className="w-32 sm:w-42 h-7 rounded-t-2xl relative flex items-center justify-center"
            style={{ 
              transform: 'translate3d(0, 0, 18px)',
              transformStyle: 'preserve-3d',
              background: 'linear-gradient(180deg, #363d4e 0%, #222734 55%, #141720 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.35)',
              borderLeft: '2px solid rgba(245, 197, 88, 0.55)',
              borderRight: '2px solid rgba(245, 197, 88, 0.55)',
              boxShadow: 'inset 0 1.5px 3px rgba(255,255,255,0.3), 0 -6px 16px rgba(0,0,0,0.7)'
            }}
          >
            {/* Top Shell Cap (Visible from camera elevation) */}
            <div 
              className="absolute -top-3 w-28 sm:w-36 h-4 rounded-t-xl pointer-events-none opacity-80"
              style={{
                transform: 'rotateX(60deg) translate3d(0, -2px, -8px)',
                background: 'linear-gradient(180deg, #424a5e 0%, #20242e 100%)',
                borderTop: '1px solid rgba(255,255,255,0.4)'
              }}
            />

            {/* Center Metallic Gold Spine Ridge */}
            <div 
              className="w-4 h-full rounded-t-sm"
              style={{
                background: 'linear-gradient(135deg, #fff0a8 0%, #f5c558 40%, #b8860b 75%, #e6b800 100%)',
                boxShadow: '0 0 14px rgba(245,197,88,0.7), inset 0 1px 2px #ffffff'
              }}
            />
          </div>

          {/* Main 3D Cranium Structure (Multi-Faceted Solid Box with Symmetrical Side Flanks) */}
          <div 
            className="relative w-44 sm:w-56 h-36 sm:h-44 rounded-3xl p-4 flex flex-col items-center justify-between"
            style={{
              transform: 'translate3d(0, 0, 0px)',
              transformStyle: 'preserve-3d',
              background: 'linear-gradient(145deg, #2f3544 0%, #1c202a 35%, #12151e 70%, #0c0e14 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.28)',
              borderLeft: '2.5px solid rgba(245, 197, 88, 0.55)',
              borderRight: '2.5px solid rgba(245, 197, 88, 0.55)',
              borderBottom: '2.5px solid rgba(0, 0, 0, 0.98)',
              boxShadow: 'inset 5px 0 14px rgba(245,197,88,0.18), inset -5px 0 14px rgba(245,197,88,0.18), -16px 0 40px rgba(245,197,88,0.15), 16px 0 40px rgba(245,197,88,0.15), inset 0 2px 4px rgba(255,255,255,0.22), inset 0 -8px 16px rgba(0,0,0,0.95), 0 30px 60px rgba(0,0,0,0.95)'
            }}
          >
            {/* LEFT 3D CRANIUM FLANK (Extends backward in Z by 65px with golden rim lighting) */}
            <div 
              className="absolute -left-14 top-2 w-14 h-32 rounded-l-2xl pointer-events-none"
              style={{
                transformOrigin: 'right center',
                transform: 'rotateY(-72deg) translate3d(0, 0, 0px)',
                background: 'linear-gradient(90deg, #101218 0%, #1f232e 60%, #303746 100%)',
                borderLeft: '2px solid rgba(245, 197, 88, 0.60)',
                borderTop: '1px solid rgba(255, 255, 255, 0.25)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.9)',
                boxShadow: '-8px 0 24px rgba(245,197,88,0.20)'
              }}
            >
              {/* Armor Division Seams on Left Flank */}
              <div className="absolute top-10 inset-x-0 h-0.5 bg-black/80 border-t border-white/10" />
              <div className="absolute top-20 inset-x-0 h-0.5 bg-black/80 border-t border-white/10" />
            </div>

            {/* RIGHT 3D CRANIUM FLANK (Symmetrical to left flank with matching gold rim & division seams) */}
            <div 
              className="absolute -right-14 top-2 w-14 h-32 rounded-r-2xl pointer-events-none"
              style={{
                transformOrigin: 'left center',
                transform: 'rotateY(72deg) translate3d(0, 0, 0px)',
                background: 'linear-gradient(270deg, #101218 0%, #1f232e 60%, #303746 100%)',
                borderRight: '2px solid rgba(245, 197, 88, 0.60)',
                borderTop: '1px solid rgba(255, 255, 255, 0.25)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.9)',
                boxShadow: '8px 0 24px rgba(245,197,88,0.20)'
              }}
            >
              {/* Armor Division Seams on Right Flank */}
              <div className="absolute top-10 inset-x-0 h-0.5 bg-black/80 border-t border-white/10" />
              <div className="absolute top-20 inset-x-0 h-0.5 bg-black/80 border-t border-white/10" />
            </div>

            {/* Left Cheek Angled Armor Bevel Plate */}
            <div 
              className="absolute left-1 top-10 w-5 h-22 rounded-l-xl pointer-events-none"
              style={{
                transform: 'translate3d(-2px, 0, 14px) rotateY(-24deg)',
                background: 'linear-gradient(90deg, rgba(245,197,88,0.35) 0%, rgba(32,37,48,0.9) 100%)',
                borderLeft: '1.5px solid rgba(245,197,88,0.65)'
              }}
            />

            {/* Right Cheek Angled Armor Bevel Plate (Symmetrical to Left) */}
            <div 
              className="absolute right-1 top-10 w-5 h-22 rounded-r-xl pointer-events-none"
              style={{
                transform: 'translate3d(2px, 0, 14px) rotateY(24deg)',
                background: 'linear-gradient(270deg, rgba(245,197,88,0.35) 0%, rgba(32,37,48,0.9) 100%)',
                borderRight: '1.5px solid rgba(245,197,88,0.65)'
              }}
            />

            {/* Forehead Hex Crest & Amber Core Gem (Protruding Z: +40px) */}
            <div 
              className="flex items-center justify-center"
              style={{ transform: 'translate3d(0, 0, 40px)', transformStyle: 'preserve-3d' }}
            >
              <div 
                className="w-5 h-5 rotate-45 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #fff0a8 0%, #f5c558 40%, #b8860b 75%, #e6b800 100%)',
                  boxShadow: '0 0 16px rgba(245,197,88,0.6), inset 0 1px 2px #fff'
                }}
              >
                <div className="w-2.5 h-2.5 bg-[#ffaa00] rounded-full animate-ping shadow-[0_0_12px_#ff9400]" />
              </div>
            </div>

            {/* =================================================================== */}
            {/* OBSIDIAN CURVED VISOR HOUSING (Prominently Extruded Z: +34px)       */}
            {/* =================================================================== */}
            <div 
              className="w-full h-16 sm:h-20 rounded-2xl flex items-center justify-center px-4 relative"
              style={{
                transform: 'translate3d(0, 0, 34px)',
                transformStyle: 'preserve-3d',
                background: 'radial-gradient(ellipse at 50% 25%, #202634 0%, #0a0c10 60%, #020304 100%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.30)',
                borderLeft: '2px solid rgba(245, 197, 88, 0.50)',
                borderRight: '2px solid rgba(245, 197, 88, 0.50)',
                borderBottom: '1.5px solid rgba(245, 197, 88, 0.35)',
                boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.25), inset 0 -6px 14px rgba(0,0,0,0.98), 0 20px 40px rgba(0,0,0,0.95)'
              }}
            >
              {/* Visor Left Extrusion Return Wall (Connects front visor back to cranium Z:0) */}
              <div 
                className="absolute -left-3.5 top-0 bottom-0 w-4 rounded-l-lg pointer-events-none"
                style={{
                  transformOrigin: 'right center',
                  transform: 'rotateY(-75deg)',
                  background: 'linear-gradient(90deg, #090a0e 0%, #1e232e 100%)',
                  borderLeft: '1.5px solid rgba(245, 197, 88, 0.60)'
                }}
              />

              {/* Visor Right Extrusion Return Wall (Symmetrical return wall with gold edge) */}
              <div 
                className="absolute -right-3.5 top-0 bottom-0 w-4 rounded-r-lg pointer-events-none"
                style={{
                  transformOrigin: 'left center',
                  transform: 'rotateY(75deg)',
                  background: 'linear-gradient(270deg, #090a0e 0%, #1e232e 100%)',
                  borderRight: '1.5px solid rgba(245, 197, 88, 0.60)'
                }}
              />

              {/* Visor Brow Metallic Gold Trim (Protruding Z: +10px) */}
              <div 
                className="absolute top-0 inset-x-3 h-1.5 rounded-full z-10"
                style={{
                  transform: 'translate3d(0, 0, 10px)',
                  background: 'linear-gradient(90deg, #b8860b 0%, #fff0a8 25%, #f5c558 50%, #fff0a8 75%, #b8860b 100%)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(245,197,88,0.5), inset 0 1px 1px #fff'
                }}
              />

              {/* Dynamic Visor Specular Glass Reflection */}
              <div 
                ref={gleamRef}
                className="absolute inset-y-0 w-28 pointer-events-none -skew-x-12 will-change-transform"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)'
                }}
              />
              
              {/* Eyes Container (Recessed inside Visor Cavity with Gaze Tracking) */}
              <div 
                ref={eyesRef}
                className="flex items-center justify-center gap-5 sm:gap-6 will-change-transform z-10"
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Left Eye Lens (Amber Luminescence & Mechanical Eyelid Slit) */}
                <div 
                  ref={eyeLeftRef}
                  className="w-12 sm:w-16 h-3.5 sm:h-4 rounded-md -rotate-2 will-change-transform"
                  style={{
                    background: 'linear-gradient(180deg, #ffc94d 0%, #ffaa00 50%, #e68500 100%)',
                    boxShadow: '0 0 18px #ff9400, inset 0 1px 2px rgba(255,255,255,0.8)'
                  }}
                />
                {/* Right Eye Lens (Amber Luminescence & Mechanical Eyelid Slit) */}
                <div 
                  ref={eyeRightRef}
                  className="w-12 sm:w-16 h-3.5 sm:h-4 rounded-md rotate-2 will-change-transform"
                  style={{
                    background: 'linear-gradient(180deg, #ffc94d 0%, #ffaa00 50%, #e68500 100%)',
                    boxShadow: '0 0 18px #ff9400, inset 0 1px 2px rgba(255,255,255,0.8)'
                  }}
                />
              </div>
            </div>

            {/* =================================================================== */}
            {/* BEVELED JAW GUARD & CHIN NOTCH (Forward Z: +26px, Pitch: 14deg)    */}
            {/* =================================================================== */}
            <div 
              className="flex flex-col items-center"
              style={{
                transform: 'translate3d(0, -3px, 26px) rotateX(14deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div 
                className="w-20 sm:w-26 h-5 rounded-b-xl border-b border-[#f5c558]/70 flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(180deg, #232834 0%, #12151e 100%)',
                  borderLeft: '1.5px solid rgba(245, 197, 88, 0.5)',
                  borderRight: '1.5px solid rgba(245, 197, 88, 0.5)',
                  boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.98), 0 12px 28px rgba(0,0,0,0.92)'
                }}
              >
                {/* Jaw Left Wing Return */}
                <div 
                  className="absolute -left-3 top-0 bottom-0 w-3 rounded-l-md"
                  style={{
                    transform: 'rotateY(-60deg)',
                    background: '#151822',
                    borderLeft: '1px solid #f5c558'
                  }}
                />

                {/* Jaw Right Wing Return (Symmetrical to Left) */}
                <div 
                  className="absolute -right-3 top-0 bottom-0 w-3 rounded-r-md"
                  style={{
                    transform: 'rotateY(60deg)',
                    background: '#151822',
                    borderRight: '1px solid #f5c558'
                  }}
                />

                {/* Beveled Gold Notch */}
                <div 
                  className="w-5 h-2 rounded-sm"
                  style={{
                    background: 'linear-gradient(135deg, #fff0a8, #f5c558, #b8860b)',
                    boxShadow: '0 0 10px rgba(245,197,88,0.7), inset 0 1px 1px #fff'
                  }}
                />
              </div>
            </div>

            {/* =================================================================== */}
            {/* 3D TEMPLE AUDIO NODES (Symmetrical Left & Right with Gold Rings)    */}
            {/* =================================================================== */}
            {/* Left Temple Pod */}
            <div 
              className="absolute -left-6 top-15 w-6 h-12 rounded-l-lg"
              style={{
                transform: 'translate3d(-100%, 0, 16px) rotateY(-30deg)',
                transformStyle: 'preserve-3d',
                background: 'linear-gradient(90deg, #383f52 0%, #20242e 60%, #151820 100%)',
                borderLeft: '2.5px solid #f5c558',
                borderTop: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '-8px 0 20px rgba(245,197,88,0.35), 0 10px 20px rgba(0,0,0,0.9)'
              }}
            >
              {/* Outer Gold Torus Acoustic Ring on Left Ear */}
              <div 
                className="absolute left-1 top-2.5 w-3 h-7 rounded-full border-2 border-[#f5c558]"
                style={{
                  boxShadow: '0 0 10px rgba(245,197,88,0.6)'
                }}
              />
            </div>

            {/* Right Temple Pod (Symmetrical to Left with Gold Torus Acoustic Ring) */}
            <div 
              className="absolute -right-6 top-15 w-6 h-12 rounded-r-lg"
              style={{
                transform: 'translate3d(100%, 0, 16px) rotateY(30deg)',
                transformStyle: 'preserve-3d',
                background: 'linear-gradient(270deg, #383f52 0%, #20242e 60%, #151820 100%)',
                borderRight: '2.5px solid #f5c558',
                borderTop: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '8px 0 20px rgba(245,197,88,0.35), 0 10px 20px rgba(0,0,0,0.9)'
              }}
            >
              {/* Outer Gold Torus Acoustic Ring on Right Ear */}
              <div 
                className="absolute right-1 top-2.5 w-3 h-7 rounded-full border-2 border-[#f5c558]"
                style={{
                  boxShadow: '0 0 10px rgba(245,197,88,0.6)'
                }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEGMENTED NECK COLUMN (Recessed translateZ: -12px)                     */}
        {/* ========================================================================= */}
        <div 
          className="w-16 sm:w-22 h-7 border-x border-[#333842] flex items-center justify-center relative -my-1 z-10"
          style={{
            transform: 'translate3d(0, 0, -12px)',
            background: 'linear-gradient(180deg, #090b0e 0%, #1c202a 50%, #090b0e 100%)',
            borderLeft: '2px solid rgba(245, 197, 88, 0.45)',
            borderRight: '2px solid rgba(245, 197, 88, 0.45)',
            boxShadow: 'inset 0 10px 18px rgba(0,0,0,0.98), inset 0 -10px 18px rgba(0,0,0,0.98), -6px 0 16px rgba(245,197,88,0.1), 6px 0 16px rgba(245,197,88,0.1)'
          }}
        >
          {/* Cervical Gold Collar Ring with High Luster */}
          <div 
            className="w-full h-1.5"
            style={{
              background: 'linear-gradient(90deg, #b8860b 0%, #fff0a8 30%, #f5c558 70%, #b8860b 100%)',
              boxShadow: '0 0 12px rgba(245,197,88,0.6), inset 0 1px 1px #fff'
            }}
          />
        </div>

        {/* ========================================================================= */}
        {/* 3. TORSO ASSEMBLY (Symmetrical Left & Right Shoulder Thickness)           */}
        {/* ========================================================================= */}
        <div 
          ref={torsoRef}
          className="relative flex flex-col items-center justify-center will-change-transform z-10"
          style={{ 
            transformOrigin: 'center center -20px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Torso Mantle Base (With Real 3D Side Thickness on Both Sides) */}
          <div 
            className="relative w-56 sm:w-72 h-14 sm:h-16 rounded-2xl flex items-center justify-between px-6"
            style={{
              transform: 'translate3d(0, 0, 10px)',
              transformStyle: 'preserve-3d',
              background: 'linear-gradient(145deg, #2d3342 0%, #1d202a 35%, #131620 75%, #0b0d13 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.28)',
              borderLeft: '2.5px solid rgba(245, 197, 88, 0.50)',
              borderRight: '2.5px solid rgba(245, 197, 88, 0.50)',
              borderBottom: '2px solid rgba(0, 0, 0, 0.98)',
              boxShadow: 'inset 5px 0 12px rgba(245,197,88,0.16), inset -5px 0 12px rgba(245,197,88,0.16), -14px 0 35px rgba(245,197,88,0.14), 14px 0 35px rgba(245,197,88,0.14), inset 0 2px 4px rgba(255,255,255,0.22), inset 0 -6px 12px rgba(0,0,0,0.95), 0 30px 55px rgba(0,0,0,0.95)'
            }}
          >
            {/* TORSO LEFT SHOULDER FLANK */}
            <div 
              className="absolute -left-8 top-1 bottom-1 w-8 rounded-l-xl pointer-events-none"
              style={{
                transformOrigin: 'right center',
                transform: 'rotateY(-70deg)',
                background: 'linear-gradient(90deg, #12151e 0%, #2a3040 100%)',
                borderLeft: '2px solid rgba(245, 197, 88, 0.60)',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '-6px 0 20px rgba(245,197,88,0.2)'
              }}
            />

            {/* TORSO RIGHT SHOULDER FLANK (Symmetrical to Left) */}
            <div 
              className="absolute -right-8 top-1 bottom-1 w-8 rounded-r-xl pointer-events-none"
              style={{
                transformOrigin: 'left center',
                transform: 'rotateY(70deg)',
                background: 'linear-gradient(270deg, #12151e 0%, #2a3040 100%)',
                borderRight: '2px solid rgba(245, 197, 88, 0.60)',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '6px 0 20px rgba(245,197,88,0.2)'
              }}
            />

            {/* Left Shoulder Pauldron Trim (Protruding Z: +16px with Beveled Gold) */}
            <div 
              className="w-8 h-2 rounded-sm"
              style={{
                transform: 'translate3d(0, 0, 16px)',
                background: 'linear-gradient(135deg, #fff0a8, #f5c558, #b8860b)',
                boxShadow: '0 0 12px rgba(245,197,88,0.5), inset 0 1px 1px #fff'
              }}
            />
            
            {/* =================================================================== */}
            {/* HEX AI REACTOR HOUSING & CORE (Pushed forward to Z: +32px)         */}
            {/* =================================================================== */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center relative"
              style={{
                transform: 'translate3d(0, 0, 32px)',
                transformStyle: 'preserve-3d',
                background: 'linear-gradient(135deg, #fff0a8 0%, #f5c558 35%, #b8860b 70%, #e6b800 100%)',
                boxShadow: '0 0 22px rgba(245,197,88,0.6), 0 10px 20px rgba(0,0,0,0.85), inset 0 1px 2px #fff'
              }}
            >
              {/* Inner Dark Reactor Socket Cavity */}
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, #1c212c 0%, #06080b 100%)',
                  boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.98)'
                }}
              >
                {/* Amber Reactor Crystal Core */}
                <div 
                  className="w-5 h-5 rounded-md animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #ffd166, #ffaa00, #d97706)',
                    boxShadow: '0 0 16px #ff9400, inset 0 1px 2px #fff'
                  }}
                />
              </div>
            </div>

            {/* Right Shoulder Pauldron Trim (Protruding Z: +16px) */}
            <div 
              className="w-8 h-2 rounded-sm"
              style={{
                transform: 'translate3d(0, 0, 16px)',
                background: 'linear-gradient(135deg, #fff0a8, #f5c558, #b8860b)',
                boxShadow: '0 0 12px rgba(245,197,88,0.5), inset 0 1px 1px #fff'
              }}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CONCENTRIC QUANTUM HALO RINGS (Recessed Floor Plane: Z: -35px)         */}
        {/* ========================================================================= */}
        {/* Deep Ambient Occlusion Ground Shadow under Torso */}
        <div 
          className="relative mt-3 flex items-center justify-center pointer-events-none" 
          style={{ 
            perspective: '800px',
            transform: 'translate3d(0, 10px, -30px)',
            transformStyle: 'preserve-3d'
          }}
        >
          <div 
            className="w-60 sm:w-76 h-12 rounded-[100%] blur-lg pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.98) 0%, transparent 75%)'
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`relative w-full flex items-center justify-center select-none ${className}`}
    >
      {/* Subtle Ambient Golden Energy Glow (Lamborghini Yellow/Gold #FFC000) */}
      <div 
        ref={ambientGlowRef}
        className="absolute w-[320px] sm:w-[440px] lg:w-[560px] h-[320px] sm:h-[440px] lg:h-[560px] rounded-full pointer-events-none opacity-25 blur-[120px] will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(255, 192, 0, 0.40) 0%, rgba(255, 192, 0, 0.06) 55%, transparent 75%)'
        }}
      />

      {/* Robot Stage Container: Scaled for Desktop, Tablet & Mobile; Click/Tap to Blink */}
      <div 
        id="spline-robot-interactive"
        onPointerDown={handleRobotPointerDown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="AI Sentinel Assistant - Click or Tap to Blink"
        className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[580px] xl:max-w-[650px] h-[360px] sm:h-[420px] lg:h-[540px] xl:h-[620px] flex items-center justify-center overflow-hidden cursor-pointer select-none outline-none group"
      >
        
        {/* Loading Spinner Indicator if a valid scene URL is loading */}
        {scene && !isLoaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-[#202020] border-t-[#FFC000] rounded-full animate-spin" />
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0c0e12] border border-[#FFC000]/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,192,0,0.25)]">
                <div className="w-2.5 h-2.5 bg-[#FFC000] rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#FFC000] uppercase">
              INITIALIZING 3D TELEMETRY CORE
            </div>
          </div>
        )}

        {/* Live Spline 3D Scene / Graceful Error-Safe Presentation */}
        {scene && !hasError ? (
          <SplineErrorBoundary 
            onError={() => setHasError(true)} 
            fallback={renderRobotStage()}
          >
            <Suspense fallback={null}>
              <div 
                className={`w-full h-full transition-opacity duration-700 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Spline
                  scene={scene}
                  onLoad={handleSplineLoad}
                  onError={() => setHasError(true)}
                  className="w-full h-full"
                />
              </div>
            </Suspense>
          </SplineErrorBoundary>
        ) : (
          renderRobotStage()
        )}
      </div>
    </div>
  );
}
