import React, { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  const [isRetro, setIsRetro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vibeSeed, setVibeSeed] = useState(() => Math.floor(Math.random() * 99999));

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    async function getRetro() {
      try {
        // Public API. If it fails, we fall back to a mystical guess.
        const res = await fetch("https://mercuryretrogradeapi.com/", { signal: controller.signal });
        if (!res.ok) throw new Error("network");
        const data = await res.json();
        if (mounted) {
          setIsRetro(!!(data.is_retrograde ?? data.retrograde));
          setLoading(false);
        }
      } catch (e) {
        if (!mounted) return;
        // Fallback oracle: chaotic-neutral divination (deterministic by day)
        const d = new Date();
        const seed = d.getUTCFullYear() * 372 + (d.getUTCMonth() + 1) * 31 + d.getUTCDate();
        const pseudo = ((seed * 9301 + 49297) % 233280) / 233280; // [0,1)
        const vibe = pseudo > 0.66; // about 1/3 of days retrograde-ish
        setIsRetro(vibe);
        setError("The cosmos refused CORS. Consulting crystals instead.");
        setLoading(false);
      } finally {
        clearTimeout(timeout);
      }
    }
    getRetro();

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  const palette = useMemo(() => {
    if (isRetro === null) {
      return {
        bgFrom: "from-[#0a0015]",
        bgTo: "to-[#001a1f]",
        accent: "#9dffeb",
        glow: "#ff00ff",
        ring: "#a78bfa",
      };
    }
    return isRetro
      ? { bgFrom: "from-[#1a0026]", bgTo: "to-[#00120f]", accent: "#ff58e5", glow: "#66ffb8", ring: "#f59e0b" }
      : { bgFrom: "from-[#00081c]", bgTo: "to-[#0b0031]", accent: "#8be9fd", glow: "#ffd166", ring: "#22d3ee" };
  }, [isRetro]);

  const title = isRetro == null ? "Consulting the cosmic call center…" : isRetro ? "Yes." : "No.";
  const subtitle = isRetro == null
    ? "Buffering fate. Please hold while Mercury tinkers with reality."
    : isRetro
    ? "Hide your contracts, back up your vibes, and blame the glitch."
    : "Sign the thing. Send the email. Water your houseplants and your soul.";

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${palette.bgFrom} ${palette.bgTo} text-white`}> 
      <StyleTag />
      <Stars seed={vibeSeed} accent={palette.accent} isRetro={!!isRetro} />
      <Aurora isRetro={!!isRetro} />
      <NoiseOverlay />

      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
        <GridVibe />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <MercuryOrb color={palette.ring} glow={palette.glow} isRetro={isRetro} />
        <div className="mt-8" />
        <GlitchText text={title} highlight={palette.accent} loading={loading} />
        <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
          {subtitle}
        </p>

        {error && (
          <p className="mt-2 text-xs text-fuchsia-300/70 italic">{error}</p>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <Crystal color={palette.accent} shimmer={palette.glow} index={1} />
          <Crystal color={palette.glow} shimmer={palette.accent} index={2} />
          <Crystal color={palette.ring} shimmer={palette.glow} index={3} />
        </div>

        <button
          className="mt-10 px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all text-sm tracking-wider"
          onClick={() => setVibeSeed((s) => (s * 1337 + 42) % 100000)}
        >
          Summon new vibes
        </button>

        <Footer />
      </div>

      {loading && <CosmicSpinner color={palette.accent} />}
    </div>
  );
}

function StyleTag() {
  return (
    <style>{`
      @keyframes float {
        0% { transform: translateY(0px) }
        50% { transform: translateY(-10px) }
        100% { transform: translateY(0px) }
      }
      @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      @keyframes hue { 0% { filter: hue-rotate(0deg) } 100% { filter: hue-rotate(360deg) } }
      @keyframes pulseGlow { 0%,100% { opacity: .6 } 50% { opacity: 1 } }
      @keyframes shimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(200%) } }
      @keyframes twinkle { 0%,100% { opacity:.3; transform:scale(1)} 50% { opacity:1; transform:scale(1.4)} }
      @keyframes jitter { 0%,100% { transform: translate(0,0) } 50% { transform: translate(0.7px,-0.7px) } }
      @keyframes gridBreath { 0%,100% { opacity:.07 } 50% { opacity:.15 } }
      @keyframes noise { 0%,100% { transform:translate(0,0) } 10% { transform:translate(-1%,1%) } 20% { transform:translate(1%,-1%) } 30% { transform:translate(-1%,0) } 40% { transform:translate(1%,1%) } 50% { transform:translate(0,-1%) } 60% { transform:translate(-1%,1%) } 70% { transform:translate(1%,0) } 80% { transform:translate(0,1%) } 90% { transform:translate(-1%,-1%) } }
      .glitch {
        position: relative;
        text-shadow: 0 0 18px rgba(255,255,255,0.35);
      }
      .glitch::before, .glitch::after {
        content: attr(data-text);
        position: absolute; left: 0; top: 0; width: 100%; height: 100%;
        mix-blend-mode: screen; pointer-events: none;
      }
      .glitch::before { transform: translate(1px, 0); color: #00fff0; clip-path: polygon(0 2%,100% 0,100% 49%,0 51%); animation: jitter 1.2s infinite linear; }
      .glitch::after { transform: translate(-1px, 0); color: #ff00ff; clip-path: polygon(0 51%,100% 49%,100% 100%,0 98%); animation: jitter 1.1s infinite linear; }
      .mask-gradient { -webkit-mask-image: radial-gradient(circle at 50% 40%, black 40%, transparent 70%); mask-image: radial-gradient(circle at 50% 40%, black 40%, transparent 70%) }
    `}</style>
  );
}

function Stars({ seed, accent, isRetro }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const stars = [];
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const count = Math.min(220, Math.floor((w * h) / 12000));

    function rnd(n) {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return (seed / 4294967296) * n;
    }
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rnd(w),
        y: rnd(h),
        r: 0.4 + rnd(1.6),
        tw: 0.5 + rnd(1.5),
        hue: rnd(1),
      });
    }

    const constel = stars.slice(0, 9).map((s, i) => ({ ...s, idx: i }));

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      // space gradient
      const g = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h));
      g.addColorStop(0, "rgba(255,255,255,0.02)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = (Math.sin((t / 600 + s.tw) * 6.283) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x + Math.sin(t / 1000 + i) * 0.3, s.y + Math.cos(t / 1300 + i) * 0.3, s.r + tw * 0.8, 0, Math.PI * 2);
        const col = `hsla(${Math.floor((s.hue * 360 + (isRetro ? 120 : 260)) % 360)}, 90%, ${60 - tw * 30}%, ${0.7 - i / stars.length * 0.5})`;
        ctx.fillStyle = col;
        ctx.fill();
      }

      // Constellation lines
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = accent + (isRetro ? "cc" : "99");
      for (let i = 0; i < constel.length - 1; i++) {
        const a = constel[i];
        const b = constel[i + 1];
        const jx = Math.sin(t / 400 + i) * (isRetro ? 1.8 : 0.8);
        const jy = Math.cos(t / 500 + i) * (isRetro ? 1.8 : 0.8);
        ctx.beginPath();
        ctx.moveTo(a.x + jx, a.y + jy);
        ctx.lineTo(b.x - jx, b.y - jy);
        ctx.stroke();
      }
    }

    let start;
    function loop(ts) {
      if (!start) start = ts;
      const t = ts - start;
      draw(t);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    function onResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [seed, accent, isRetro]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
}

function Aurora({ isRetro }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]">
      <div
        className={`absolute -inset-32 opacity-40 blur-3xl mask-gradient`}
        style={{
          background: isRetro
            ? "conic-gradient(from 0deg at 50% 50%, rgba(255,0,255,.3), rgba(0,255,200,.25), rgba(255,180,0,.25), rgba(255,0,255,.3))"
            : "conic-gradient(from 90deg at 50% 50%, rgba(0,200,255,.28), rgba(255,220,100,.22), rgba(130,255,200,.25), rgba(0,200,255,.28))",
          animation: "spin-slow 40s linear infinite",
        }}
      />
    </div>
  );
}

function NoiseOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[2] mix-blend-overlay" style={{ opacity: 0.06, animation: "noise 2s steps(8) infinite" }}>
      <svg width="100%" height="100%">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}

function GridVibe() {
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ animation: "gridBreath 6s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
        </linearGradient>
      </defs>
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={"h" + i} x1="0" y1={`${(i + 1) * 5}%`} x2="100%" y2={`${(i + 1) * 5}%`} stroke="url(#g1)" strokeWidth="1" />
      ))}
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={"v" + i} y1="0" x1={`${(i + 1) * 5}%`} y2="100%" x2={`${(i + 1) * 5}%`} stroke="url(#g1)" strokeWidth="1" />
      ))}
    </svg>
  );
}

function MercuryOrb({ color, glow, isRetro }) {
  return (
    <div className="relative" aria-hidden>
      <div
        className="mx-auto h-56 w-56 sm:h-64 sm:w-64 rounded-full shadow-2xl"
        style={{
          background: isRetro
            ? "radial-gradient(circle at 35% 35%, #ffd6f9 0%, #b300ff 35%, #3e004e 70%, #0b0019 100%)"
            : "radial-gradient(circle at 35% 35%, #e2fff9 0%, #00bcd4 35%, #002f4f 70%, #060012 100%)",
          filter: "saturate(1.3)",
          boxShadow: `0 0 40px ${glow}66, inset 0 0 30px ${color}33, 0 0 120px ${glow}33`,
          animation: "float 5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="h-72 w-72 sm:h-80 sm:w-80 rounded-full"
          style={{
            border: `1px dashed ${color}44`,
            animation: "spin-slow 24s linear infinite",
            maskImage: "radial-gradient(circle, black 60%, transparent 61%)",
            WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 61%)",
          }}
        />
      </div>
      <Ring color={color} />
    </div>
  );
}

function Ring({ color }) {
  return (
    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="360" height="160" viewBox="0 0 360 160">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="80" rx="160" ry="34" fill="none" stroke="url(#ringGrad)" strokeWidth="2" style={{ filter: "blur(0.2px)", animation: "pulseGlow 3.5s ease-in-out infinite" }} />
    </svg>
  );
}

function GlitchText({ text, highlight, loading }) {
  return (
    <div className="relative">
      <h1
        className={`glitch text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight select-none`}
        data-text={text}
        style={{ color: highlight, textShadow: `0 0 30px ${highlight}55, 0 0 60px ${highlight}22` }}
      >
        {text}
      </h1>
      {loading && (
        <div className="absolute -inset-4 rounded-3xl" style={{ background: `radial-gradient(60% 60% at 50% 60%, ${highlight}11 0%, transparent 70%)`, animation: "hue 6s linear infinite" }} />
      )}
    </div>
  );
}

function Crystal({ color, shimmer, index = 1 }) {
  const phase = (index % 3) * 0.7;
  return (
    <div className="relative" style={{ animation: `float 6s ${phase}s ease-in-out infinite` }}>
      <svg width="64" height="96" viewBox="0 0 64 96" className="drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        <defs>
          <linearGradient id={`cryst_${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={shimmer} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`shine_${index}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points="32,2 60,38 50,92 14,92 4,38" fill={`url(#cryst_${index})`} stroke={color} strokeOpacity="0.6" />
        <polygon points="32,8 52,38 44,86 20,86 12,38" fill="none" stroke={shimmer} strokeOpacity="0.4" />
        <rect x="-80" y="0" width="60" height="96" fill={`url(#shine_${index})`} style={{ transform: "skewX(-20deg)", animation: "shimmer 4s ease-in-out infinite" }} />
      </svg>
    </div>
  );
}

function CosmicSpinner({ color }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full" style={{ border: `3px dashed ${color}`, animation: "spin-slow 10s linear infinite" }} />
        <div className="absolute inset-3 rounded-full" style={{ borderTop: `3px solid ${color}`, borderRight: `3px solid transparent`, animation: "spin-slow 1.6s linear infinite" }} />
        <div className="absolute inset-6 rounded-full" style={{ borderBottom: `3px solid ${color}`, borderLeft: `3px solid transparent`, animation: "spin-slow 2.3s linear infinite reverse" }} />
      </div>
    </div>
  );
}

function Footer() {
  const d = new Date();
  const year = d.getFullYear();
  return (
    <div className="mt-12 text-xs text-white/50">
      <p>
        A mystical–sarcastic service. {year}. Mercury not responsible for your ex texting you.
      </p>
    </div>
  );
}
