import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  FileText,
  FolderOpen,
  Layers,
  Menu,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { AppearanceToggle } from "@/components/AppearanceToggle";
import { PRICING_PLANS, type BillingPeriod } from "@/lib/pricing";
import "@/styles/landing-refresh.css";

const tabs = ["Overview", "Flashcards", "Practice quiz"] as const;
type PreviewTab = (typeof tabs)[number];
const questions = [
  {
    question: "What is the main role of mitochondria?",
    options: [
      "Store genetic information",
      "Produce energy for the cell",
      "Control what enters the cell",
    ],
    answer: 1,
    explanation:
      "Mitochondria convert energy from nutrients into ATP, which powers the cell's activities.",
  },
  {
    question: "Which structure controls what enters and leaves a cell?",
    options: ["Cell membrane", "Nucleus", "Ribosome"],
    answer: 0,
    explanation:
      "The selectively permeable cell membrane regulates movement into and out of the cell.",
  },
];

function WorkspacePreview() {
  const [tab, setTab] = useState<PreviewTab>("Overview");
  const [flipped, setFlipped] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const question = questions[questionIndex];
  return (
    <div
      className="cx-preview"
      aria-label="Interactive study workspace preview"
    >
      <div className="cx-preview-top">
        <span className="cx-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>your workspace, connected</span>
        <span className="cx-preview-demo">Interactive preview</span>
      </div>
      <div className="cx-preview-body">
        <aside className="cx-preview-sidebar" aria-hidden="true">
          <BrandMark />
          <MessageSquare />
          <BookOpen className="is-active" />
          <FolderOpen />
          <Layers />
          <span className="cx-preview-avatar">JD</span>
        </aside>
        <div className="cx-preview-content">
          <div className="cx-preview-breadcrumb">
            <span>
              Study space <span>/</span> Biology
            </span>
            <span>
              <ShieldCheck size={12} /> Your sources
            </span>
          </div>
          <div className="cx-preview-heading">
            <div>
              <h3>Study your source</h3>
              <p>Summarize the material, then practice recalling it.</p>
            </div>
            <span className="cx-preview-spark">
              <Sparkles size={19} />
            </span>
          </div>
          <div className="cx-preview-source">
            <span className="cx-file-icon">
              <FileText size={21} />
            </span>
            <div>
              <strong>Chapter 03 · Cell biology</strong>
              <small>PDF document · Sample source</small>
            </div>
            <span className="cx-ready">
              <Check size={11} /> Ready to study
            </span>
          </div>
          <div
            className="cx-preview-tabs"
            role="tablist"
            aria-label="Preview study tools"
          >
            {tabs.map((item) => (
              <button
                key={item}
                id={`preview-tab-${item.replace(/ /g, "-")}`}
                role="tab"
                aria-selected={tab === item}
                aria-controls="preview-panel"
                tabIndex={tab === item ? 0 : -1}
                onClick={() => setTab(item)}
                onKeyDown={(event) => {
                  const direction =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (!direction) return;
                  event.preventDefault();
                  const next =
                    tabs[
                      (tabs.indexOf(tab) + direction + tabs.length) %
                        tabs.length
                    ];
                  setTab(next);
                  document
                    .getElementById(`preview-tab-${next.replace(/ /g, "-")}`)
                    ?.focus();
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <div
            className="cx-preview-panel"
            id="preview-panel"
            role="tabpanel"
            aria-labelledby={`preview-tab-${tab.replace(/ /g, "-")}`}
          >
            {tab === "Overview" && (
              <>
                <div className="cx-preview-summary">
                  <span>
                    <Sparkles size={13} /> The big picture
                  </span>
                  <p>
                    Cells are the building blocks of life. Each organelle has a
                    specialized role, working together to keep the cell
                    functioning.
                  </p>
                  <small>
                    <FileText size={10} /> Chapter 03, page 4 · Sample summary
                  </small>
                </div>
                <div className="cx-preview-tools">
                  <button onClick={() => setTab("Flashcards")}>
                    <span className="purple">
                      <Layers size={17} />
                    </span>
                    <strong>Review with flashcards</strong>
                    <small>Review flashcards</small>
                    <ArrowUpRight size={13} />
                  </button>
                  <button onClick={() => setTab("Practice quiz")}>
                    <span className="green">
                      <BrainCircuit size={17} />
                    </span>
                    <strong>Test yourself</strong>
                    <small>Try a quick question</small>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </>
            )}
            {tab === "Flashcards" && (
              <button
                className="cx-demo-flashcard"
                onClick={() => setFlipped(!flipped)}
                aria-label={
                  flipped
                    ? "Show flashcard question"
                    : "Reveal flashcard answer"
                }
              >
                <span>
                  <Layers size={15} /> {flipped ? "THE ANSWER" : "QUICK RECALL"}
                </span>
                <strong>
                  {flipped
                    ? "The mitochondrion produces ATP through cellular respiration."
                    : "Which organelle is the powerhouse of the cell?"}
                </strong>
                <small>
                  {flipped
                    ? "Click to see the question"
                    : "Think it through, then click to reveal"}
                </small>
              </button>
            )}
            {tab === "Practice quiz" && (
              <div className="cx-demo-quiz">
                <strong>{question.question}</strong>
                <div>
                  {question.options.map((option, index) => (
                    <button
                      key={option}
                      disabled={answer !== null}
                      className={
                        answer !== null
                          ? index === question.answer
                            ? "correct"
                            : index === answer
                              ? "incorrect"
                              : ""
                          : ""
                      }
                      onClick={() => setAnswer(index)}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>
                      {option}
                      {answer !== null && index === question.answer && (
                        <Check size={13} />
                      )}
                    </button>
                  ))}
                </div>
                {answer !== null && (
                  <p role="status">
                    {question.explanation}{" "}
                    <button
                      onClick={() => {
                        setQuestionIndex(
                          (questionIndex + 1) % questions.length,
                        );
                        setAnswer(null);
                      }}
                    >
                      Next question <ArrowRight size={11} />
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="cx-preview-bottom">
            <span>
              <span className="cx-online-dot" /> Summary, flashcards, and
              practice questions.
            </span>
            <span>Powered by Cryonex</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  [
    "What can I upload?",
    "Bring PDFs, lecture notes, YouTube links, or scanned class material into your study workspace. Cryonex uses your selected sources to build summaries, flashcards, quizzes, and explanations.",
  ],
  [
    "Can I try Cryonex for free?",
    "Yes. The Free plan includes credits to try the core study and AI workflows. You can create an account and start with your own material before choosing a paid plan.",
  ],
  [
    "Does it work on my phone?",
    "Yes. Cryonex has responsive web layouts and native mobile support, so you can capture material, review flashcards, and continue your study sessions on smaller screens.",
  ],
  [
    "Are answers connected to my sources?",
    "Study explanations can include inline citations to your selected source material. Review those references when preparing for an assessment.",
  ],
];

export default function ModernLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [currency, setCurrency] = useState<"sar" | "egp" | "usdFallback">(
    "usdFallback",
  );
  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    if (window.location.hash)
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(window.location.hash.slice(1)))
          ?.scrollIntoView(),
      );
    else window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);
  return (
    <div className="cx-landing">
      <a href="#main-content" className="cx-skip-link">
        Skip to content
      </a>
      <header className="cx-landing-header">
        <div className="cx-landing-container cx-header-inner">
          <Link to="/" className="cx-landing-brand" aria-label="Cryonex home">
            <BrandMark />
            <strong>cryonex</strong>
          </Link>
          <nav className="cx-header-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="cx-header-actions">
            <AppearanceToggle />
            <Link to="/login" className="cx-sign-in">
              Sign in
            </Link>
            <Link to="/login" className="cx-landing-button cx-button-small">
              Get started free <ArrowUpRight size={15} />
            </Link>
            <button
              className="cx-mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-nav"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            className="cx-mobile-nav"
            id="landing-mobile-nav"
            aria-label="Mobile navigation"
          >
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>
              Pricing
            </a>
            <Link to="/login">
              Sign in <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>
      <main id="main-content">
        <section className="cx-hero cx-landing-container">
          <div className="cx-hero-copy">
            <div className="cx-hero-badge">
              <span /> Built for your study sessions <ArrowUpRight size={12} />
            </div>
            <h1>
              Your material.
              <br />
              Your study space.
            </h1>
            <p>
              Bring your notes, lectures, and questions into Cryonex. Work
              through them with AI, then build understanding with summaries,
              flashcards, and quizzes.
            </p>
            <div className="cx-hero-actions">
              <Link to="/login" className="cx-landing-button">
                Start your free workspace <ArrowRight size={17} />
              </Link>
              <a
                href="#workspace-preview"
                className="cx-landing-button cx-button-outline"
              >
                Take a look inside <ArrowDown size={16} />
              </a>
            </div>
            <div className="cx-hero-proof">
              <span>
                <Check size={13} /> Free to get started
              </span>
              <span>
                <Check size={13} /> No credit card needed
              </span>
            </div>
          </div>
          <div className="cx-hero-visual" id="workspace-preview">
            <div className="cx-visual-label">
              <span className="cx-line" /> Explore a sample study session
            </div>
            <WorkspacePreview />
            <div className="cx-floating-note">
              <span>
                <Zap size={17} />
              </span>
              <div>
                <strong>Study directly from your source.</strong>
                <small>Keep explanations connected to your material.</small>
              </div>
            </div>
            <span className="cx-visual-caption">
              Try the flashcards and quiz in this sample workspace.
            </span>
          </div>
        </section>
        <section className="cx-capabilities">
          <div className="cx-landing-container">
            <span>Your tools in one workspace</span>
            <div>
              <span>
                <MessageSquare /> AI conversations
              </span>
              <span>
                <BookOpen /> Smarter studying
              </span>
              <span>
                <FolderOpen /> Connected projects
              </span>
              <span>
                <Layers /> Your knowledge library
              </span>
            </div>
          </div>
        </section>
        <section
          className="cx-features-section cx-landing-container"
          id="features"
        >
          <div className="cx-section-heading">
            <span className="cx-section-eyebrow">Tools for learning</span>
            <h2>
              Work through the material.
              <br />
              Then put it into practice.
            </h2>
            <p>
              Your tools work together, so you can spend less time switching
              tabs and more time moving forward.
            </p>
          </div>
          <div className="cx-feature-grid">
            <article className="cx-feature-card cx-feature-chat">
              <div className="cx-feature-card-copy">
                <span className="cx-feature-icon">
                  <MessageSquare size={21} />
                </span>
                <h3>Ask, explain, and explore.</h3>
                <p>
                  Explore a question, untangle a tricky concept, or get a fresh
                  perspective with your choice of AI models.
                </p>
                <Link to="/app">
                  Meet your assistant <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="cx-chat-illustration">
                <div className="cx-illustration-user">
                  Explain it like I'm learning it for the first time.
                </div>
                <div className="cx-illustration-answer">
                  <BrandMark />
                  <div>
                    <strong>Let's break it down together.</strong>
                    <p>
                      Start with the big idea. Then connect the pieces, one step
                      at a time.
                    </p>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="cx-illustration-input">
                  Ask a question. Find your next idea.
                  <span>
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </article>
            <article className="cx-feature-card cx-feature-study">
              <span className="cx-feature-icon purple">
                <BrainCircuit size={21} />
              </span>
              <h3>Practice what you learn.</h3>
              <p>
                Turn your course material into summaries, flashcards, and
                practice quizzes.
              </p>
              <div className="cx-study-illustration">
                <div>
                  <FileText size={22} />
                  <span>Your material</span>
                </div>
                <ArrowRight size={18} />
                <div>
                  <Layers size={22} />
                  <span>Active recall</span>
                </div>
              </div>
              <Link to="/study/dashboard">
                Open your study space <ArrowUpRight size={16} />
              </Link>
            </article>
            <article className="cx-feature-card cx-feature-library">
              <span className="cx-feature-icon green">
                <FolderOpen size={21} />
              </span>
              <h3>
                Keep your notes
                <br />
                and projects together.
              </h3>
              <p>
                Save notes in your library and organize related work into
                projects.
              </p>
              <div className="cx-library-illustration">
                <span>
                  <FileText size={15} /> Research notes <small>NOTES</small>
                </span>
                <span>
                  <Layers size={15} /> Exam revision <small>STUDY</small>
                </span>
                <span>
                  <FolderOpen size={15} /> Research project{" "}
                  <small>PROJECT</small>
                </span>
              </div>
              <Link to="/library">
                Build your knowledge base <ArrowUpRight size={16} />
              </Link>
            </article>
          </div>
        </section>
        <section className="cx-how-section" id="how-it-works">
          <div className="cx-landing-container">
            <div className="cx-section-heading">
              <span className="cx-section-eyebrow">How to use Cryonex</span>
              <h2>
                Start with your material.
                <br />
                <span>Build your study session.</span>
              </h2>
            </div>
            <div className="cx-steps">
              {[
                {
                  title: "Add your material",
                  body: "Upload a document, add notes, or start with a question.",
                  icon: Plus,
                },
                {
                  title: "Understand the key ideas",
                  body: "Read a summary, ask for an explanation, and check the original source.",
                  icon: Sparkles,
                },
                {
                  title: "Put it into practice",
                  body: "Use flashcards and quizzes to check recall and review your mistakes.",
                  icon: ArrowUpRight,
                },
              ].map((step, index) => (
                <article key={step.title}>
                  <span className="cx-step-number">0{index + 1}</span>
                  <step.icon size={24} />
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="cx-pricing-section cx-landing-container"
          id="pricing"
        >
          <div className="cx-section-heading">
            <span className="cx-section-eyebrow">Plans</span>
            <h2>Choose your Cryonex plan.</h2>
            <p>Start free, or choose a plan with more monthly credits.</p>
          </div>
          <div className="cx-pricing-controls">
            <div className="cx-billing-toggle" aria-label="Billing period">
              <button
                aria-pressed={billing === "monthly"}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                aria-pressed={billing === "yearly"}
                onClick={() => setBilling("yearly")}
              >
                Yearly <span>Save more</span>
              </button>
            </div>
            <label>
              Currency{" "}
              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as typeof currency)
                }
              >
                <option value="usdFallback">USD</option>
                <option value="sar">SAR</option>
                <option value="egp">EGP</option>
              </select>
            </label>
          </div>
          <div className="cx-pricing-grid">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`cx-price-card ${plan.id === "PLUS" ? "cx-price-featured" : ""}`}
              >
                {plan.id === "PLUS" && (
                  <span className="cx-price-popular">
                    <Sparkles size={12} /> Regular study
                  </span>
                )}
                <span className="cx-price-name">{plan.name}</span>
                <p>
                  {plan.id === "FREE"
                    ? "Start with the essential tools."
                    : plan.id === "PLUS"
                      ? "More room for regular study sessions."
                      : "Higher limits for intensive study."}
                </p>
                <div className="cx-price-value">
                  {plan.prices[billing][currency]}
                  <span>{plan.prices[billing].cadenceLabel}</span>
                </div>
                <Link
                  to={plan.ctaHref}
                  className={`cx-landing-button ${plan.id === "PLUS" ? "" : "cx-button-outline"}`}
                >
                  {plan.ctaLabel}
                  <ArrowUpRight size={15} />
                </Link>
                <ul>
                  {[
                    `${(plan.allowance.studyCredits ?? 0) + (plan.allowance.cryoCredits ?? 0)} ${plan.id === "FREE" ? "starter" : "monthly"} credits`,
                    "Source-grounded AI assistance",
                    "Summaries, flashcards & practice quizzes",
                    plan.id === "FREE"
                      ? "Try the core study workflows"
                      : plan.id === "PLUS"
                        ? "More room for your weekly study routine"
                        : "Higher limits for intensive exam prep",
                  ].map((feature) => (
                    <li key={feature}>
                      <Check size={14} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="cx-pricing-note">
            Credits are shared across study and AI workflows. Usage varies by
            tool.{" "}
            <Link to="/plans">
              See full plan details <ArrowUpRight size={12} />
            </Link>
          </p>
        </section>
        <section className="cx-faq-section cx-landing-container">
          <div>
            <span className="cx-section-eyebrow">Getting started</span>
            <h2>Common questions.</h2>
            <p>Uploads, plans, devices, and your sources.</p>
          </div>
          <div className="cx-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={17} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="cx-final-section cx-landing-container">
          <div className="cx-final-cta">
            <div>
              <span className="cx-section-eyebrow">Your study workspace</span>
              <h2>Start your next study session.</h2>
              <p>Bring your material and choose your next study tool.</p>
            </div>
            <Link to="/login" className="cx-landing-button">
              Let's get started <ArrowUpRight size={18} />
            </Link>
            <div className="cx-cta-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
              <BrandMark />
            </div>
          </div>
        </section>
      </main>
      <footer className="cx-landing-footer cx-landing-container">
        <div>
          <Link to="/" className="cx-landing-brand">
            <BrandMark />
            <strong>cryonex</strong>
          </Link>
          <p>Your material, connected to your learning.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/login">
            Get started <ArrowUpRight size={12} />
          </Link>
        </nav>
        <small>© {new Date().getFullYear()} Cryonex.</small>
      </footer>
    </div>
  );
}
