import {
  Banknote,
  CarFront,
  ChevronRight,
  FileDown,
  Gamepad2,
  Globe,
  Map as MapIcon,
  MessagesSquare,
  Radio,
  ShieldAlert,
  Siren,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Backdrop from "./components/Backdrop";
import Logo from "./components/Logo";
import AudioToggle from "./components/AudioToggle";
import { useGmodLoader } from "./lib/gmod";

/* ---------------- helpers ---------------- */

function shorten(path: string, max = 64) {
  if (!path) return "";
  if (path.length <= max) return path;
  const head = Math.floor(max * 0.55);
  return `${path.slice(0, head)}…${path.slice(-(max - head - 1))}`;
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------------- data ---------------- */

const TIPS = [
  {
    icon: Sparkles,
    title: "Эксклюзив беты",
    text: "Все тестеры получат скин «Первопроходец» и значок в профиле после релиза.",
  },
  {
    icon: Radio,
    title: "Голосовой чат",
    text: "Клавиша X — разговор. Проверь микрофон в настройках Garry's Mod заранее.",
  },
  {
    icon: ShieldAlert,
    title: "Нашёл баг?",
    text: "F1 → «Сообщить об ошибке». За полезные репорты — награда на баланс.",
  },
  {
    icon: CarFront,
    title: "Транспорт",
    text: "ALT — ручной тормоз. Дрифт на поворотах приоткрывает центр города.",
  },
  {
    icon: Banknote,
    title: "Живая экономика",
    text: "Зарплата каждые 10 минут. Вакансии — в агентстве занятости у мэрии.",
  },
  {
    icon: Siren,
    title: "Фракции",
    text: "Полиция, ОМОН, мафия и мэрия уже открыты для вступления в бете.",
  },
];

const TICKER = [
  "ОТКРЫТЫЙ БЕТА-ТЕСТ",
  "УНИКАЛЬНЫЕ ПРОФЕССИИ",
  "КАСТОМНЫЙ ТРАНСПОРТ",
  "ЖИВАЯ ЭКОНОМИКА",
  "КРИМИНАЛЬНЫЕ ФРАКЦИИ",
  "СИСТЕМА НЕДВИЖИМОСТИ",
  "ЕЖЕНЕДЕЛЬНЫЕ ОБНОВЛЕНИЯ",
  "DISCORD.GG/ZACITY",
];

/* ---------------- tiny atoms ---------------- */

function Chip({ icon: Icon, label, value }: { icon: typeof MapIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 border border-white/10 bg-black/40 px-3.5 py-2 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-neon" strokeWidth={1.8} />
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40">{label}</span>
      <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/90">
        {value}
      </span>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return <div className={`pointer-events-none absolute h-7 w-7 border-neon/50 ${className}`} />;
}

/* ---------------- app ---------------- */

export default function App() {
  const s = useGmodLoader();
  const rootRef = useRef<HTMLDivElement>(null);
  const busyPlayers = useRef(31 + Math.floor(Math.random() * 14));

  /* smoothed percent */
  const target = useMemo(() => {
    if (s.phase === "done") return 100;
    if (s.filesTotal > 0) {
      const ratio = 1 - s.filesNeeded / s.filesTotal;
      return Math.min(100, Math.max(0, ratio * 100));
    }
    return s.phase === "connect" ? 9 : 3;
  }, [s.phase, s.filesTotal, s.filesNeeded]);

  const targetRef = useRef(target);
  targetRef.current = target;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setShown((v) => {
        const t = targetRef.current;
        if (Math.abs(t - v) < 0.04) return t;
        return v + (t - v) * 0.085;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* elapsed clock */
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const id = window.setInterval(() => setElapsed((performance.now() - started) / 1000), 500);
    return () => window.clearInterval(id);
  }, []);

  /* rotating tips */
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 6000);
    return () => window.clearInterval(id);
  }, []);
  const tip = TIPS[tipIdx];
  const TipIcon = tip.icon;

  /* pointer parallax */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      el.style.setProperty("--px", String(e.clientX / window.innerWidth - 0.5));
      el.style.setProperty("--py", String(e.clientY / window.innerHeight - 0.5));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const filesDone = Math.max(0, s.filesTotal - s.filesNeeded);
  const indeterminate = s.filesTotal === 0 && s.phase !== "done";

  return (
    <div ref={rootRef} className="fixed inset-0 cursor-default select-none overflow-hidden bg-ink text-white">
      <Backdrop />

      {/* atmosphere overlays */}
      <div className="overlay-scanlines pointer-events-none fixed inset-0 z-40" />
      <div className="overlay-noise pointer-events-none fixed inset-0 z-40" />
      <div className="overlay-vignette pointer-events-none fixed inset-0 z-30" />
      <div className="scan-beam z-30" />

      {/* screen corner brackets */}
      <Corner className="left-4 top-4 border-l-2 border-t-2" />
      <Corner className="right-4 top-4 border-r-2 border-t-2" />
      <Corner className="bottom-4 left-4 border-b-2 border-l-2" />
      <Corner className="bottom-4 right-4 border-b-2 border-r-2" />

      {/* HUD with parallax */}
      <div
        className="relative z-20 flex h-full flex-col px-[4.5vw] pb-11 pt-7 transition-transform duration-300 ease-out"
        style={{ transform: "translate3d(calc(var(--px, 0) * -9px), calc(var(--py, 0) * -7px), 0)" }}
      >
        {/* ---------- header ---------- */}
        <header className="flex items-start justify-between gap-6">
          <div className="animate-fade-up">
            <Logo />
          </div>

          <div className="flex animate-fade-up flex-wrap items-start justify-end gap-2" style={{ animationDelay: "0.15s" }}>
            <div className="hidden lg:block">
              <Chip icon={MapIcon} label="Карта" value={s.mapName} />
            </div>
            <div className="hidden md:block">
              <Chip icon={Gamepad2} label="Режим" value={s.gameMode} />
            </div>
            <Chip icon={Users} label="Слоты" value={`${busyPlayers.current}/${s.maxPlayers}`} />
            <AudioToggle />
          </div>
        </header>

        {/* side vertical labels */}
        <div className="vertical-rl pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 font-mono text-[0.58rem] uppercase tracking-[0.5em] text-white/25 xl:block">
          Garry's Mod · City Roleplay Project
        </div>
        <div className="vertical-rl pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-180 font-mono text-[0.58rem] uppercase tracking-[0.5em] text-neon/30 xl:block">
          zacity-rp.ru // node eu-west-01
        </div>

        {/* ---------- center ---------- */}
        <main className="relative flex flex-1 flex-col items-center justify-center">
          <div
            className="pointer-events-none absolute top-1/2 -translate-y-[72%] font-display font-black uppercase leading-none tracking-tight"
            style={{
              fontSize: "clamp(4rem, 15vw, 13rem)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.07)",
            }}
          >
            Loading
          </div>

          <div className="relative flex flex-col items-center">
            <div className="mb-4 flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.5em] text-white/45">
              <Terminal className="h-3.5 w-3.5 text-neon" strokeWidth={1.8} />
              {s.isLive ? "Связь с сервером установлена" : "Установка соединения с узлом"}
            </div>

            <div
              className={`tabular font-display font-black leading-none text-white ${
                s.phase === "done" ? "text-glow-magenta" : "text-glow-cyan"
              }`}
              style={{ fontSize: "clamp(5rem, 16vw, 12.5rem)" }}
              role="progressbar"
              aria-valuenow={Math.round(shown)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {Math.round(shown)}
              <span className="ml-2 align-top font-display font-extrabold text-magenta" style={{ fontSize: "0.32em" }}>
                %
              </span>
            </div>

            <div className="mt-4 h-px w-40 bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
            <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.42em] text-white/50">
              {s.phase === "done" ? (
                <span className="text-limey">Добро пожаловать в город</span>
              ) : (
                "Подключение к ZA-CITY"
              )}
            </div>
          </div>
        </main>

        {/* ---------- progress ---------- */}
        <section className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
          <div className="relative h-[3px] w-full bg-white/10">
            {indeterminate ? (
              <div className="barber absolute inset-0 opacity-60" />
            ) : (
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-magenta via-neon to-limey transition-none"
                style={{ width: `${shown}%` }}
              >
                <div className="absolute -right-1 -top-[3.5px] h-2.5 w-2.5 rotate-45 bg-white shadow-[0_0_14px_rgba(77,227,255,0.9)]" />
              </div>
            )}
            {/* tick marks */}
            <div className="absolute inset-x-0 -top-1 flex justify-between">
              {Array.from({ length: 21 }).map((_, i) => (
                <span key={i} className="h-1.5 w-px bg-white/15" />
              ))}
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[0.7rem] font-bold uppercase tracking-[0.24em] text-neon">
                <span className="h-1.5 w-1.5 animate-[blinkDot_1s_step-end_infinite] bg-neon" />
                {s.status}
              </div>
              {s.currentFile && (
                <div className="mt-1.5 flex items-center gap-2 font-mono text-[0.64rem] tracking-[0.08em] text-white/40">
                  <FileDown className="h-3 w-3 shrink-0 text-magenta/70" strokeWidth={1.8} />
                  <span className="truncate">{shorten(s.currentFile)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/45">
              <span>
                Файлы{" "}
                <span className="tabular font-bold text-white">
                  {s.filesTotal > 0 ? `${String(filesDone).padStart(3, "0")} / ${String(s.filesTotal).padStart(3, "0")}` : "··· / ···"}
                </span>
              </span>
              <span className="hidden sm:inline">
                Время <span className="tabular font-bold text-white">T+{formatClock(elapsed)}</span>
              </span>
              <span className="hidden items-center gap-1.5 lg:flex">
                <ChevronRight className="h-3 w-3 animate-[breathe_1.6s_ease-in-out_infinite] text-limey" />
                Осталось немного
              </span>
            </div>
          </div>
        </section>

        {/* ---------- bottom row ---------- */}
        <footer className="mt-8 grid animate-fade-up grid-cols-1 items-end gap-4 lg:grid-cols-[minmax(0,1fr)_auto]" style={{ animationDelay: "0.5s" }}>
          {/* connection log */}
          <div className="corner-frame hidden max-w-md border border-white/10 bg-black/45 p-4 backdrop-blur-md sm:block">
            <div className="mb-2.5 font-mono text-[0.56rem] uppercase tracking-[0.4em] text-white/35">
              Журнал соединения
            </div>
            <div className="space-y-1 font-mono text-[0.62rem] leading-relaxed">
              {s.log.length === 0 && <div className="text-white/30">Ожидание событий…</div>}
              {s.log.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  className="truncate"
                  style={{ opacity: 0.35 + ((i + 1) / s.log.length) * 0.65 }}
                >
                  <span className="text-neon/80">{line.slice(0, 13)}</span>
                  <span className="text-white/75">{line.slice(13)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-end gap-4">
            {/* rotating tip */}
            <div className="corner-frame w-[min(24rem,100%)] border border-white/10 bg-black/45 p-4 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[0.56rem] uppercase tracking-[0.4em] text-magenta/80">
                  Совет оперативника
                </span>
                <span className="font-mono text-[0.56rem] tabular text-white/30">
                  {String(tipIdx + 1).padStart(2, "0")}/{String(TIPS.length).padStart(2, "0")}
                </span>
              </div>
              <div key={tipIdx} className="tip-enter flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-neon/30 bg-neon/10">
                  <TipIcon className="h-4 w-4 text-neon" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="font-display text-[0.72rem] font-bold uppercase tracking-wider text-white">
                    {tip.title}
                  </div>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-white/55">{tip.text}</p>
                </div>
              </div>
            </div>

            {/* socials */}
            <div className="flex gap-2">
              <a
                href="https://discord.gg/zacity"
                target="_blank"
                rel="noreferrer"
                className="group flex h-12 w-12 items-center justify-center border border-white/10 bg-black/45 backdrop-blur-md transition-colors hover:border-magenta/60 hover:bg-magenta/10"
                aria-label="Discord сервера"
              >
                <MessagesSquare className="h-4.5 w-4.5 text-white/60 transition-colors group-hover:text-magenta" strokeWidth={1.8} />
              </a>
              <a
                href="https://zacity-rp.ru"
                target="_blank"
                rel="noreferrer"
                className="group flex h-12 w-12 items-center justify-center border border-white/10 bg-black/45 backdrop-blur-md transition-colors hover:border-neon/60 hover:bg-neon/10"
                aria-label="Сайт проекта"
              >
                <Globe className="h-4.5 w-4.5 text-white/60 transition-colors group-hover:text-neon" strokeWidth={1.8} />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* ---------- ticker ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-sm">
        <div className="flex w-max animate-[marquee_36s_linear_infinite] items-center">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {TICKER.map((item) => (
                <span key={`${dup}-${item}`} className="flex items-center">
                  <span className="px-6 py-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.3em] text-white/55">
                    {item}
                  </span>
                  <span className="text-[0.55rem] text-magenta">///</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
