import Image from "next/image";
import Link from "next/link";
import {
  Cpu, Workflow, ShoppingBag, Server, Globe, GraduationCap,
  ArrowRight, Calendar, LogIn, Phone, Mail,
} from "lucide-react";

const services = [
  { icon: Cpu, title: "Custom SaaS Development", desc: "Client portals, booking systems, inventory management, CRM tools, and payment integrations built around your business." },
  { icon: Workflow, title: "Business Process Automation", desc: "Replace manual workflows, paper forms, spreadsheets, and email chains with automated systems that save hours every week." },
  { icon: ShoppingBag, title: "Shopify & E-commerce", desc: "Custom store setup for boutique retail — theme customization, product import, AI shopping agents, and checkout automations." },
  { icon: Server, title: "IT Support & Infrastructure", desc: "Managed IT, cloud migration, system maintenance, security hardening, and backup solutions for peace of mind." },
  { icon: Globe, title: "Website & Digital Presence", desc: "Website redesign, SEO, and online branding — often the foot-in-the-door that leads to bigger transformations." },
  { icon: GraduationCap, title: "Training & Consulting", desc: "Tech training, digital transformation strategy, workflow audits, and adoption coaching so your team can thrive." },
];

const process = [
  { step: "1", title: "Diagnose the Problems", desc: "We identify bottlenecks, wasted time, and missed opportunities in your current operations." },
  { step: "2", title: "Solve Them", desc: "We implement the right tools, automations, and workflows — tailored to how your business already works." },
  { step: "3", title: "Create Savings", desc: "Get smoother operations, stronger business value, and the knowledge to move forward with confidence." },
];

const values = [
  { title: "Built Around You", desc: "Solutions tailored to your processes, team, and goals — not generic off-the-shelf software." },
  { title: "Smarter Operations", desc: "Automate repetitive work and improve day-to-day flow so you can focus on what matters." },
  { title: "Real Business Value", desc: "Focus on improvements that deliver practical, measurable results — not flashy gimmicks." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/DreamForgeConsultingLogo.png" alt="DreamForge" width={40} height={40} className="rounded-lg" />
            <div>
              <span className="font-display text-lg text-primary">DreamForge</span>
              <span className="ml-1 text-xs text-muted-foreground tracking-widest">CONSULTING</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://cal.com/emile-du-toit-lhb4qv/discovery-call"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Book a Call
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Client Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 sm:py-32 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Smart Automation Solutions<br />
            That Help Small Businesses<br />
            <span className="text-primary">Save Time & Cut Costs</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Custom SaaS, workflow automation, IT support & technology training for small businesses.
            Fast results, real guidance. We listen, understand, and deliver real value.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://cal.com/emile-du-toit-lhb4qv/discovery-call"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Calendar className="h-5 w-5" />
              Book a Free Discovery Call
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-base font-medium hover:bg-muted transition-colors"
            >
              <LogIn className="h-5 w-5" />
              Client Portal Login
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <Phone className="inline h-3.5 w-3.5 mr-1" />
            Call Emile at (972) 900-6286
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-display text-lg text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-muted/20 border-y border-border/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl text-center mb-2">Our Simple 3-Step Process</h2>
          <p className="text-center text-muted-foreground mb-12">
            Identify what&apos;s slowing you down, fix it, and create value.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {process.map((p, i) => (
              <div key={p.step} className="relative rounded-xl border border-border/50 bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg">
                  {p.step}
                </div>
                <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                {i < process.length - 1 && (
                  <ArrowRight className="hidden sm:block absolute top-1/2 -right-4 h-5 w-5 text-primary/50 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-2">What We Offer</h2>
        <p className="text-center text-muted-foreground mb-12">
          Practical solutions designed specifically for small businesses.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="group rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 transition-colors">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-muted/20 border-y border-border/30">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl mb-6">We Listen, Understand, and Deliver Real Value</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our process begins by learning how your business actually works — what challenges you&apos;re facing
            and where opportunities exist. We diagnose the issues, implement practical solutions, and focus on
            results that create real savings and better workflows.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We believe in showing you how things work and teaching you how to solve common challenges yourself,
            so you&apos;re not dependent on outside help for every small problem.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our goal is to build solutions that work for your business today while giving you the knowledge
            and tools to move forward with confidence.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl mb-4">Ready to Streamline Your Business?</h2>
          <p className="text-muted-foreground mb-8">
            Book a free 30-minute discovery call. We&apos;ll learn about your business, identify quick wins,
            and show you exactly how we can help.
          </p>
          <a
            href="https://cal.com/emile-du-toit-lhb4qv/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Calendar className="h-5 w-5" />
            Book a Discovery Call
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/DreamForgeConsultingLogo.png" alt="DreamForge" width={32} height={32} className="rounded-lg" />
              <div>
                <p className="font-display text-primary">DreamForge Consulting</p>
                <p className="text-xs text-muted-foreground">Emile du Toit · 30+ Years of Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="tel:9729006286" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Phone className="h-3.5 w-3.5" />
                (972) 900-6286
              </a>
              <a href="mailto:dutoit.emile@gmail.com" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
              <Link href="/login" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <LogIn className="h-3.5 w-3.5" />
                Client Portal
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} DreamForge Consulting. All Rights Reserved. Powered by Real People.
          </div>
        </div>
      </footer>
    </div>
  );
}
