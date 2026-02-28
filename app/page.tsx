import { SiteHeader } from "./components/site-header";
import { FadeIn } from "./components/fade-in";
import { StaggerReveal } from "./components/stagger-reveal";
import { MarsSignal } from "./components/mars-signal";
import { CameraSection } from "./components/camera-section";

/* ─── Font stacks ─── */
const SERIF = 'var(--font-source-serif), Georgia, "Times New Roman", serif';
const SANS =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const MONO =
  'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

/* ─── Shared styles ─── */
const readingColumn: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "0 24px",
};

const bodyText: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 19,
  lineHeight: 1.55,
  color: "var(--sf-warm-100)",
};

const inlineLink: React.CSSProperties = {
  color: "var(--sf-warm-100)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  transition: "opacity 0.15s cubic-bezier(0.77, 0, 0.175, 1)",
};

const sectionSpacing: React.CSSProperties = {
  padding: "48px 0",
};

/* ─── NASA Archive data ─── */
const archives = [
  {
    title: "Raw images",
    subtitle: "1.2M+ photos from 23 cameras",
    href: "https://mars.nasa.gov/mars2020/multimedia/raw-images/",
  },
  {
    title: "Rover location",
    subtitle: "Current position on Mars",
    href: "https://mars.nasa.gov/mars2020/mission/where-is-the-rover/",
  },
  {
    title: "MEDA archive",
    subtitle: "Full weather dataset",
    href: "https://mars.nasa.gov/mars2020/spacecraft/instruments/meda/",
  },
  {
    title: "PDS science data",
    subtitle: "Complete instrument archives",
    href: "https://pds-geosciences.wustl.edu/missions/mars2020/",
  },
  {
    title: "Mars audio",
    subtitle: "5 hours of Martian sounds",
    href: "https://mars.nasa.gov/mars2020/participate/sounds/",
  },
  {
    title: "Ingenuity logs",
    subtitle: "72 flights, 17km flown",
    href: "https://mars.nasa.gov/technology/helicopter/",
  },
];

/* ─── Footer columns ─── */
const footerColumns = [
  {
    heading: "Products",
    links: [
      "Claude",
      "Claude Code",
      "Claude Code Enterprise",
      "Cowork",
      "Claude in Chrome",
      "Claude in Excel",
    ],
  },
  {
    heading: "Solutions",
    links: [
      "AI agents",
      "Code modernization",
      "Coding",
      "Customer support",
      "Education",
      "Financial services",
    ],
  },
  {
    heading: "Learn",
    links: [
      "Blog",
      "Claude partner network",
      "Connectors",
      "Courses",
      "Customer stories",
      "Engineering at Anthropic",
    ],
  },
  {
    heading: "Help and security",
    links: ["Availability", "Status", "Support center"],
  },
  {
    heading: "Terms and policies",
    links: [
      "Privacy choices",
      "Privacy policy",
      "Consumer health data privacy policy",
      "Responsible disclosure policy",
      "Terms of service: Commercial",
      "Terms of service: Consumer",
      "Usage policy",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "var(--sf-cream)",
      }}
    >
      {/* ═══ 1. STICKY SITE HEADER ═══ */}
      <SiteHeader />

      {/* ═══ 2. HERO SECTION ═══ */}
      <section
        style={{
          position: "relative",
          padding: "80px 48px 0",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <FadeIn
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 120,
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              color: "var(--sf-cream)",
              margin: 0,
            }}
          >
            FOUR HUNDRED
            <br />
            METERS{" "}
            <span
              style={{
                fontStyle: "italic",
                textTransform: "lowercase",
              }}
            >
              on
            </span>
            <br />
            MARS
          </h1>
        </FadeIn>

        {/* Mars globe placeholder */}
        <FadeIn delay={0.6} duration={1.2} style={{ marginTop: -60, position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 1000,
              height: 1000,
              maxWidth: "90vw",
              maxHeight: "90vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 45% 45%, #c4603a 0%, #8b3a1a 30%, #4a1a0a 60%, #1a0a04 80%, transparent 100%)",
              boxShadow:
                "inset -40px -30px 80px rgba(0,0,0,0.7), 0 0 200px rgba(196, 96, 58, 0.2), 0 0 80px rgba(196, 96, 58, 0.1)",
              position: "relative",
            }}
          >
            {/* Surface detail overlay - polar ice cap hint */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at 55% 15%, rgba(212, 149, 107, 0.3) 0%, transparent 25%), radial-gradient(ellipse at 35% 55%, rgba(139, 58, 26, 0.4) 0%, transparent 30%), radial-gradient(ellipse at 60% 70%, rgba(74, 26, 10, 0.5) 0%, transparent 25%)",
              }}
            />
            {/* Atmospheric limb glow */}
            <div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 40%, transparent 45%, rgba(212, 149, 107, 0.08) 50%, transparent 55%)",
              }}
            />
          </div>
        </FadeIn>

        {/* Subtitle below globe */}
        <FadeIn delay={0.9} style={{ textAlign: "center", marginTop: -80, position: "relative", zIndex: 2 }}>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 400,
              color: "var(--sf-warm-100)",
              marginBottom: 48,
            }}
          >
            The first AI-planned drive on another planet.
          </p>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 32,
              fontWeight: 400,
              color: "var(--sf-warm-100)",
              maxWidth: 640,
              margin: "0 auto",
              lineHeight: 1.3,
            }}
          >
            Claude AI Powers NASA&apos;s First AI-Planned Mars Rover Drive
          </h2>
        </FadeIn>
      </section>

      {/* ═══ 3. MARS SIGNAL DOTS ═══ */}
      <section style={{ ...sectionSpacing, padding: "80px 48px" }}>
        <div style={readingColumn}>
          <MarsSignal />
        </div>
      </section>

      {/* ═══ 4. ARTICLE BODY TEXT - Part 1 ═══ */}
      <section style={sectionSpacing}>
        <div style={readingColumn}>
          <FadeIn>
            <p
              style={{
                ...bodyText,
                marginBottom: 32,
              }}
            >
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--sf-warm-100)",
                }}
              >
                EXPLORING NEW PLANETS
              </span>{" "}
              means that you&apos;re always operating in the past. It takes
              about twenty minutes for a signal to reach a Mars rover from
              Earth; by the time a new instruction arrives, the rover will
              already have acted on the previous one.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              But on December 8 and 10, 2025, the commands that were sent to
              NASA&apos;s Perseverance Rover looked like something from the
              future. That&apos;s because, for the first time ever, they&apos;d
              been written by an AI.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Specifically, they were written by Anthropic&apos;s AI model,
              Claude. Engineers at NASA&apos;s{" "}
              <a
                href="https://www.jpl.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                style={inlineLink}
              >
                Jet Propulsion Laboratory
              </a>{" "}
              (JPL) used Claude to plot out the route for Perseverance to
              navigate an approximately four-hundred-meter path through a field
              of rocks on the Martian surface.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Because of the delay in the signal to the rover, operators
              can&apos;t micromanage where it drives. They plan a route, send
              it, and only later see the results. Until now, human experts have
              always been the ones to do that planning. This time, Claude lent a
              hand.
            </p>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Four hundred meters isn&apos;t far: it&apos;s one lap of a
              running track. But it&apos;s a start. Claude—the same AI model
              that people use to draft emails, build software apps, and analyze
              their company&apos;s finances—is now helping humanity explore
              other worlds.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 5. CAMERA SECTION ═══ */}
      <section style={{ padding: "48px 48px" }}>
        <FadeIn>
          <CameraSection />
        </FadeIn>
      </section>

      {/* ═══ 6. DRAGGABLE WINDOWS (Simplified) ═══ */}
      <section style={{ padding: "48px 48px" }}>
        <StaggerReveal
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Hyperdrive window */}
          <div
            data-reveal-item
            style={{
              width: 480,
              background: "var(--sf-warm-950)",
              border: "1px solid var(--sf-warm-800)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                borderBottom: "1px solid var(--sf-warm-800)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--sf-warm-700)",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--sf-warm-700)",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--sf-warm-700)",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: "var(--sf-warm-400)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginLeft: 8,
                }}
              >
                Hyperdrive
              </span>
            </div>
            <div
              style={{
                height: 280,
                background:
                  "linear-gradient(145deg, #1a120a 0%, #2e1f14 30%, #3d2a1a 50%, #2e1f14 70%, #1a120a 100%)",
                position: "relative",
              }}
            >
              {/* Simulated 3D rover/terrain */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 50% 65%, #6b4a30 0%, #4a3020 20%, transparent 50%), radial-gradient(circle at 30% 50%, rgba(139, 94, 60, 0.2) 0%, transparent 25%), radial-gradient(circle at 70% 45%, rgba(107, 58, 26, 0.15) 0%, transparent 20%)",
                }}
              />
            </div>
          </div>

          {/* Caspian window */}
          <div
            data-reveal-item
            style={{
              width: 480,
              background: "var(--sf-warm-950)",
              border: "1px solid var(--sf-warm-800)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                borderBottom: "1px solid var(--sf-warm-800)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--sf-warm-700)",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--sf-warm-700)",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--sf-warm-700)",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: "var(--sf-warm-400)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginLeft: 8,
                }}
              >
                Caspian
              </span>
            </div>
            <div
              style={{
                height: 280,
                background:
                  "linear-gradient(180deg, #1a120a 0%, #2a1c12 30%, #3d2a1a 60%, #1a120a 100%)",
                position: "relative",
              }}
            >
              {/* Simulated 3D terrain with path lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(107, 74, 48, 0.3) 20%, transparent 40%, rgba(107, 74, 48, 0.25) 60%, transparent 80%), radial-gradient(ellipse at 50% 70%, rgba(139, 94, 60, 0.2) 0%, transparent 40%)",
                }}
              />
              {/* Path trace overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 35% 40%, rgba(196, 96, 58, 0.12) 0%, transparent 15%), radial-gradient(circle at 55% 55%, rgba(196, 96, 58, 0.1) 0%, transparent 12%), radial-gradient(circle at 65% 35%, rgba(196, 96, 58, 0.08) 0%, transparent 10%)",
                }}
              />
            </div>
          </div>
        </StaggerReveal>

        {/* Caption */}
        <FadeIn delay={0.3}>
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
            }}
          >
            <p
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--sf-warm-500)",
                marginBottom: 8,
              }}
            >
              REAL FOOTAGE FROM JPL USER INTERFACES ON SOL 1709
            </p>
            <a
              href="https://www-robotics.jpl.nasa.gov/what-we-do/applications/user-interfaces/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...inlineLink,
                fontFamily: SANS,
                fontSize: 14,
                color: "var(--sf-warm-400)",
              }}
            >
              Read more about the interfaces ↗
            </a>
          </div>
        </FadeIn>
      </section>

      {/* ═══ 7-9. MORE ARTICLE BODY + PULL QUOTE ═══ */}
      <section style={sectionSpacing}>
        <div style={readingColumn}>
          <FadeIn>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              The Perseverance Rover—a car-sized robot bristling with cameras
              and scientific equipment—has been active on Mars since it landed
              in February 2021. Its mission is to characterize the
              planet&apos;s geology and past climate, collecting samples of
              Martian rock and regolith (broken rocks and dust) and paving the
              way for human exploration of the Red Planet.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              But driving on the Martian surface is hardly trivial. Every rover
              drive needs to be carefully planned, lest the machine slide, tip,
              spin its wheels, or get beached.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              This is high-stakes work. In 2009, the{" "}
              <a
                href="https://science.nasa.gov/mission/mer-spirit/"
                target="_blank"
                rel="noopener noreferrer"
                style={inlineLink}
              >
                Spirit
              </a>{" "}
              rover, one of the forebears of Perseverance, drove into a sand
              trap and never moved again.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              JPL&apos;s engineers tested whether Claude could save them some
              of that laborious work by helping to plan Perseverance&apos;s
              route—and do so with the same level of accuracy as a human
              operator. They set up a process in Claude Code to delegate the
              waypoint-setting to the AI.
            </p>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Claude didn&apos;t do this with a single prompt. Instead, the
              model needed context before it could effectively plot the
              waypoints.
            </p>
          </FadeIn>

          {/* Pull Quote 1 */}
          <FadeIn delay={0.1}>
            <blockquote
              style={{
                fontFamily: SERIF,
                fontSize: 44,
                fontWeight: 300,
                lineHeight: 1.15,
                color: "var(--sf-cream)",
                margin: "64px 0",
                padding: 0,
                border: "none",
              }}
            >
              Over 500,000 variables were modeled to check the projected
              positions of the rover and predict any hazards along its route.
            </blockquote>
          </FadeIn>

          <FadeIn>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              The engineers estimate that using Claude in this way will cut the
              route-planning time in half, and make the journeys more
              consistent.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 10. PHOTO COLLAGE ═══ */}
      <section style={{ padding: "48px 48px" }}>
        <StaggerReveal
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(2, 200px)",
            gap: 4,
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          {/* Tile 1: Wide rust-brown panorama */}
          <div
            data-reveal-item
            style={{
              gridColumn: "1 / 3",
              background:
                "linear-gradient(135deg, #8b5e3c 0%, #6b3a1a 30%, #4a2810 60%, #6b3a1a 100%)",
              borderRadius: 2,
            }}
          />
          {/* Tile 2: Gray rocky surface */}
          <div
            data-reveal-item
            style={{
              background:
                "linear-gradient(180deg, #5a5550 0%, #3d3a36 50%, #2e2c28 100%)",
              borderRadius: 2,
            }}
          />
          {/* Tile 3: Ochre sandy terrain */}
          <div
            data-reveal-item
            style={{
              background:
                "linear-gradient(225deg, #d4956b 0%, #a06840 50%, #6b4020 100%)",
              borderRadius: 2,
            }}
          />
          {/* Tile 4: Dark basalt */}
          <div
            data-reveal-item
            style={{
              background:
                "linear-gradient(90deg, #352518 0%, #4a3525 50%, #2e1f14 100%)",
              borderRadius: 2,
            }}
          />
          {/* Tile 5: Red dust storm */}
          <div
            data-reveal-item
            style={{
              background:
                "linear-gradient(315deg, #c4603a 0%, #8b3a1a 50%, #5a2210 100%)",
              borderRadius: 2,
            }}
          />
          {/* Tile 6: Wide horizon view */}
          <div
            data-reveal-item
            style={{
              gridColumn: "3 / 5",
              background:
                "linear-gradient(45deg, #4a3020 0%, #6b4a30 25%, #8b6540 50%, #6b4a30 75%, #3d2a1a 100%)",
              borderRadius: 2,
            }}
          />
        </StaggerReveal>

        {/* View more link */}
        <div style={{ textAlign: "right", maxWidth: 1000, margin: "16px auto 0" }}>
          <a
            href="https://mars.nasa.gov/mars2020/multimedia/raw-images/?begin_sol=1707&end_sol=1709#raw-images"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: "var(--sf-warm-400)",
              textDecoration: "none",
              transition: "opacity 0.15s ease",
            }}
          >
            View more images ↗
          </a>
        </div>
      </section>

      {/* ═══ 11. MORE ARTICLE + PULL QUOTE 2 ═══ */}
      <section style={sectionSpacing}>
        <div style={readingColumn}>
          <FadeIn>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Claude&apos;s role in the Perseverance mission is in many ways
              just a test run for what comes next.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              The kinds of autonomous capabilities that Claude showed on the
              Mars rover drive—quickly understanding novel situations, writing
              code to operate complex instruments, making smart decisions
              without too much hand-holding from its operators—are exactly
              those that&apos;ll prove useful on longer and more ambitious
              space missions.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              NASA&apos;s upcoming{" "}
              <a
                href="https://www.nasa.gov/mission/artemis-i/"
                target="_blank"
                rel="noopener noreferrer"
                style={inlineLink}
              >
                Artemis
              </a>{" "}
              campaign aims to send humans back to the Moon, and to eventually
              establish a US-led base on the lunar south pole. Doing so will
              involve overcoming countless engineering challenges—and just like
              on Mars, using resources efficiently will be the watchword.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Just as Claude can apply its intelligence to the range of rather
              more sublunary tasks we carry out on Earth, developing a general
              AI assistant that&apos;s versatile and reliable enough to help
              with everything from mapping lunar geology to monitoring the
              astronauts&apos; life-support systems will be a force multiplier
              for NASA missions to the Moon and Mars.
            </p>
          </FadeIn>

          {/* Pull Quote 2 */}
          <FadeIn delay={0.1}>
            <blockquote
              style={{
                fontFamily: SERIF,
                fontSize: 44,
                fontWeight: 300,
                lineHeight: 1.15,
                color: "var(--sf-cream)",
                margin: "64px 0",
                padding: 0,
                border: "none",
              }}
            >
              NASA&apos;s upcoming Artemis campaign aims to send humans back
              to the Moon, and to eventually establish a US-led base on the
              lunar south pole.
            </blockquote>
          </FadeIn>

          <FadeIn>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Even further in the future, autonomous AI systems could help
              probes explore ever more distant parts of the solar system. Such
              missions would present fearful to technical problems: solar power
              would become low and less viable; the delay on sending signals
              from Earth could stretch to hours; and the pressure, temperature,
              and radiation of the destinations would conspire to render a
              robotic explorer&apos;s lifetime far smaller—and far shorter.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 12. LARGE DISPLAY QUOTE (86px) ═══ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 64px",
          position: "relative",
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 80%, var(--sf-warm-900) 0%, var(--sf-black) 70%)",
            opacity: 0.4,
          }}
        />
        <FadeIn>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 86,
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: "var(--sf-cream)",
              textAlign: "center",
              maxWidth: 1100,
              margin: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            &ldquo;AUTONOMOUS AI SYSTEMS COULD HELP PROBES EXPLORE EVER MORE
            DISTANT PARTS{" "}
            <span
              style={{
                fontStyle: "italic",
                textTransform: "lowercase",
              }}
            >
              of the
            </span>{" "}
            SOLAR SYSTEM.&rdquo;
          </h2>
        </FadeIn>
      </section>

      {/* ═══ 13-14. FINAL ARTICLE TEXT ═══ */}
      <section style={sectionSpacing}>
        <div style={readingColumn}>
          <FadeIn>
            <p style={{ ...bodyText, marginBottom: 32 }}>
              Claude&apos;s four hundred meter drive on Mars provides the first
              glimmer that we might be able to solve these problems, and build
              a future full of truly autonomous machines that can make fast,
              adaptive, efficient decisions without waiting for human input. A
              future where one day our probes might rain down like{" "}
              <a
                href="https://science.nasa.gov/mission/europa-clipper/"
                target="_blank"
                rel="noopener noreferrer"
                style={inlineLink}
              >
                Europa
              </a>{" "}
              or{" "}
              <a
                href="https://science.nasa.gov/mission/dragonfly/"
                target="_blank"
                rel="noopener noreferrer"
                style={inlineLink}
              >
                Titan
              </a>
              , descend through their icy shells, and chart their own course
              through the dark oceans below.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 15. CLAUDE CTA SECTION ═══ */}
      <section
        style={{
          position: "relative",
          height: 480,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Mars landscape placeholder */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, var(--sf-black) 0%, var(--sf-warm-800) 30%, var(--sf-mars-ochre) 60%, var(--sf-warm-700) 80%, var(--sf-warm-800) 100%)",
            opacity: 0.4,
          }}
        />
        <FadeIn
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          {/* Claude wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {/* Sparkle icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="var(--sf-cream)"
            >
              <path d="M14 0C14 7.732 7.732 14 0 14C7.732 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.732 14 0Z" />
            </svg>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 48,
                fontWeight: 300,
                color: "var(--sf-cream)",
              }}
            >
              Claude
            </span>
          </div>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--sf-warm-300)",
              marginBottom: 32,
            }}
          >
            Keep thinking.
          </p>
          <a
            href="https://claude.ai/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 500,
              padding: "10px 24px",
              borderRadius: 9999,
              border: "1px solid var(--sf-warm-600)",
              color: "var(--sf-warm-100)",
              textDecoration: "none",
              transition: "background-color 0.2s ease",
              background: "transparent",
            }}
          >
            Try Claude
          </a>
        </FadeIn>
      </section>

      {/* ═══ 16. EXPLORE MORE SECTION ═══ */}
      <section style={{ padding: "96px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 44,
                fontWeight: 400,
                color: "var(--sf-cream)",
                marginBottom: 16,
              }}
            >
              Explore more from NASA JPL
            </h2>
          </FadeIn>

          {/* Rover wireframe placeholder */}
          <FadeIn delay={0.2}>
            <div
              style={{
                width: "100%",
                height: 360,
                margin: "48px 0",
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
              }}
            >
              {/* Rover wireframe simulation */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: "var(--sf-warm-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    textAlign: "center",
                  }}
                >
                  MARS PERSEVERANCE ROVER
                  <br />
                  <span style={{ fontSize: 10, color: "var(--sf-warm-600)" }}>
                    Interactive 3D model
                  </span>
                </div>
              </div>

              {/* Annotation labels */}
              {[
                { label: "SUPERCAM", x: "40%", y: "15%" },
                { label: "MASTCAM-Z", x: "45%", y: "22%" },
                { label: "NAVCAMS", x: "42%", y: "28%" },
                { label: "ROBOTIC ARM", x: "18%", y: "50%" },
                { label: "FRONT HAZCAMS", x: "30%", y: "55%" },
                { label: "ROVER BODY", x: "52%", y: "45%" },
                { label: "MMRTG", x: "72%", y: "30%" },
                { label: "REAR HAZCAMS", x: "75%", y: "55%" },
                { label: "WHEELS", x: "50%", y: "78%" },
                { label: "CORING DRILL", x: "22%", y: "25%" },
              ].map((ann) => (
                <div
                  key={ann.label}
                  style={{
                    position: "absolute",
                    left: ann.x,
                    top: ann.y,
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "var(--sf-warm-500)",
                    letterSpacing: "0.06em",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "color 0.4s ease",
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "var(--sf-warm-500)",
                    }}
                  />
                  {ann.label}
                </div>
              ))}
            </div>
          </FadeIn>

          {/* NASA ARCHIVES subheading + grid */}
          <FadeIn delay={0.3}>
            <h3
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--sf-warm-100)",
                marginBottom: 20,
              }}
            >
              NASA ARCHIVES
            </h3>
          </FadeIn>

          <StaggerReveal
            staggerDelay={0.1}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {archives.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal-item
                style={{
                  display: "block",
                  padding: "20px 24px",
                  border: "1px solid var(--sf-warm-800)",
                  borderRadius: 8,
                  background: "transparent",
                  textDecoration: "none",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--sf-warm-100)",
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    color: "var(--sf-warm-500)",
                  }}
                >
                  {item.subtitle}
                </div>
              </a>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ═══ 17. FOOTER ═══ */}
      <footer
        style={{
          borderTop: "1px solid var(--sf-warm-800)",
          padding: "64px 48px 48px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "140px repeat(5, 1fr)",
            gap: 48,
          }}
        >
          {/* Logo column */}
          <div>
            <svg
              width="32"
              height="20"
              viewBox="0 0 120 72"
              fill="var(--sf-warm-100)"
              style={{ marginBottom: 24 }}
            >
              <path d="M81.5 0L120 72H100.2L61.7 0H81.5ZM38.3 0L0 72H19.8L58.3 0H38.3Z" />
            </svg>
          </div>

          {/* Nav columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4
                style={{
                  fontFamily: SANS,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--sf-warm-100)",
                  marginBottom: 16,
                }}
              >
                {col.heading}
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        fontFamily: SANS,
                        fontSize: 14,
                        color: "var(--sf-warm-500)",
                        textDecoration: "none",
                        transition:
                          "color 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)",
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            maxWidth: 1100,
            margin: "48px auto 0",
            paddingTop: 24,
            borderTop: "1px solid var(--sf-warm-800)",
            fontFamily: SANS,
            fontSize: 13,
            color: "var(--sf-warm-600)",
          }}
        >
          &copy; 2026 Anthropic PBC
        </div>
      </footer>
    </div>
  );
}
