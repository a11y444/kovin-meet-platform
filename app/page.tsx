"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Video, 
  Shield, 
  Server, 
  Users, 
  Calendar,
  Ticket,
  Mail,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Globe,
  Lock,
  Zap,
  Building2,
  Palette,
  Sun,
  Moon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/providers/i18n-provider"
import { useTheme } from "@/components/providers/theme-provider"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const { t, lang } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()

  const features = [
    {
      icon: Video,
      title: t("feature1Title"),
      description: t("feature1Desc")
    },
    {
      icon: Building2,
      title: t("feature5Title"),
      description: t("feature5Desc")
    },
    {
      icon: Palette,
      title: t("feature4Title"),
      description: t("feature4Desc")
    },
    {
      icon: Calendar,
      title: t("calendar"),
      description: lang === "de" 
        ? "Planen und verwalten Sie Meetings mit integriertem Kalendersystem."
        : "Schedule and manage meetings with a built-in calendar system."
    },
    {
      icon: Ticket,
      title: t("tickets"),
      description: lang === "de"
        ? "Verkaufen Sie Tickets für Webinare und virtuelle Events. QR-Code Check-in."
        : "Sell tickets to webinars and virtual events. QR code check-in."
    },
    {
      icon: Mail,
      title: t("emailCampaigns"),
      description: lang === "de"
        ? "Integriertes E-Mail-System für Einladungen, Erinnerungen und Marketing."
        : "Built-in email system for invitations, reminders, and marketing campaigns."
    },
    {
      icon: Users,
      title: t("roles"),
      description: lang === "de"
        ? "Granulare Berechtigungen mit anpassbaren Rollen."
        : "Granular permissions with customizable roles."
    },
    {
      icon: BarChart3,
      title: t("analytics"),
      description: lang === "de"
        ? "Detaillierte Einblicke in Meeting-Nutzung und Engagement."
        : "Detailed insights on meeting usage, attendance, and engagement metrics."
    },
    {
      icon: Zap,
      title: t("recording"),
      description: t("feature3Desc")
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">KOVIN Meet</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("features")}
              </Link>
              <Link href="#enterprise" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Enterprise
              </Link>
              <Link href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {lang === "de" ? "Sicherheit" : "Security"}
              </Link>
              <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("contact")}
              </Link>
            </nav>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <Link href="/login">
                <Button variant="ghost" size="sm">{t("login")}</Button>
              </Link>
              <Link href="#contact">
                <Button size="sm">
                  {lang === "de" ? "Demo anfragen" : "Request Demo"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Server className="w-4 h-4" />
                {t("feature6Title")}
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance"
            >
              {t("heroTitle")}{" "}
              <span className="text-gradient">
                {lang === "de" ? "nach Ihren Regeln" : "On Your Terms"}
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty"
            >
              {t("heroSubtitle")}
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="#contact">
                <Button size="lg" className="gap-2">
                  {lang === "de" ? "Beratung vereinbaren" : "Schedule a Consultation"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  {t("learnMore")}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Hero Visual */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <div className="rounded-xl overflow-hidden border border-border shadow-2xl bg-card">
                <div className="aspect-video bg-gradient-to-br from-sidebar to-sidebar-accent flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-3xl">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i}
                        className="aspect-video rounded-lg bg-sidebar-border/50 flex items-center justify-center"
                      >
                        <Users className="w-8 h-8 text-sidebar-foreground/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">
                {lang === "de" ? "Ende-zu-Ende-Verschlüsselung" : "End-to-End Encryption"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              <span className="text-sm font-medium">
                {lang === "de" ? "100% Selbst gehostet" : "100% Self-Hosted"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">
                {lang === "de" ? "DSGVO-konform" : "GDPR Compliant"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">
                {lang === "de" ? "Ihre Infrastruktur" : "Your Infrastructure"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">
              {lang === "de" 
                ? "Alles was Sie für Enterprise-Kommunikation brauchen"
                : "Everything You Need for Enterprise Communication"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === "de"
                ? "Eine komplette Plattform, die über Videoanrufe hinausgeht - Meetings, Events, Tickets und Kommunikation an einem Ort."
                : "A complete platform that goes beyond video calls — manage meetings, events, tickets, and communications all in one place."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-24 px-4 sm:px-6 lg:px-8 bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-balance">
                {lang === "de" 
                  ? "Entwickelt für Enterprise-Anforderungen"
                  : "Built for Enterprise Requirements"}
              </h2>
              <p className="mt-4 text-lg text-sidebar-foreground/70">
                {lang === "de"
                  ? "KOVIN Meet wurde von Grund auf entwickelt, um die strengen Anforderungen von Unternehmensorganisationen zu erfüllen."
                  : "KOVIN Meet is designed from the ground up to meet the stringent requirements of enterprise organizations."}
              </p>
              
              <ul className="mt-8 space-y-4">
                {(lang === "de" ? [
                  "Deployment auf eigenen Servern oder privater Cloud",
                  "Volle Datenhoheit und -souveränität",
                  "Individuelle SSO und LDAP-Integration verfügbar",
                  "Audit-Logs für Compliance-Anforderungen",
                  "Dedizierter Support und Implementierungshilfe",
                  "Source-Code-Escrow-Optionen verfügbar"
                ] : [
                  "Deploy on your own servers or private cloud",
                  "Full data ownership and sovereignty",
                  "Custom SSO and LDAP integration available",
                  "Audit logs for compliance requirements",
                  "Dedicated support and implementation assistance",
                  "Source code escrow options available"
                ]).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-sidebar-primary shrink-0 mt-0.5" />
                    <span className="text-sidebar-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10">
                <Link href="#contact">
                  <Button size="lg" variant="secondary" className="gap-2">
                    {lang === "de" ? "Vertrieb kontaktieren" : "Talk to Sales"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-sidebar-accent/30 border border-sidebar-border p-8">
                <div className="h-full rounded-xl bg-sidebar-accent/50 flex items-center justify-center">
                  <div className="text-center">
                    <Server className="w-16 h-16 text-sidebar-primary mx-auto mb-4" />
                    <p className="text-xl font-semibold">
                      {lang === "de" ? "Ihre Infrastruktur" : "Your Infrastructure"}
                    </p>
                    <p className="text-sidebar-foreground/60 mt-2">
                      {lang === "de" ? "Volle Kontrolle, keine Kompromisse" : "Complete control, zero compromise"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">
              {lang === "de" ? "Sicherheit ohne Kompromisse" : "Security Without Compromise"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === "de"
                ? "Ihre Daten verlassen niemals Ihre Infrastruktur. KOVIN Meet wurde mit Sicherheit als Grundprinzip entwickelt."
                : "Your data never leaves your infrastructure. KOVIN Meet is built with security as a foundational principle."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {(lang === "de" ? [
              {
                title: "Ende-zu-Ende-Verschlüsselung",
                description: "Alle Video-, Audio- und Chat-Kommunikationen werden mit branchenüblichen Protokollen verschlüsselt."
              },
              {
                title: "Selbst gehostete Architektur",
                description: "Deployment auf eigenen Servern. Ihre Daten, Ihre Regeln. Kein Zugriff durch Dritte."
              },
              {
                title: "Audit-Protokollierung",
                description: "Umfassende Audit-Trails für alle Aktionen. Erfüllen Sie Compliance-Anforderungen mit Leichtigkeit."
              }
            ] : [
              {
                title: "End-to-End Encryption",
                description: "All video, audio, and chat communications are encrypted using industry-standard protocols."
              },
              {
                title: "Self-Hosted Architecture",
                description: "Deploy on your own servers. Your data, your rules. No third-party access."
              },
              {
                title: "Audit Logging",
                description: "Comprehensive audit trails for all actions. Meet compliance requirements with ease."
              }
            ]).map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-balance">
            {lang === "de" 
              ? "Bereit, die Kontrolle über Ihre Kommunikation zu übernehmen?"
              : "Ready to Take Control of Your Communications?"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {lang === "de"
              ? "Kontaktieren Sie unser Team, um Ihre Anforderungen zu besprechen."
              : "Contact our team to discuss your requirements and get a personalized implementation plan."}
          </p>
          
          <Card className="mt-10">
            <CardContent className="pt-6">
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">
                      {lang === "de" ? "Name" : "Name"}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder={lang === "de" ? "Ihr Name" : "Your name"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">
                      {lang === "de" ? "Unternehmen" : "Company"}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder={lang === "de" ? "Firmenname" : "Company name"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-left">{t("email")}</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="work@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-left">
                    {lang === "de" ? "Nachricht" : "Message"}
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder={lang === "de" ? "Erzählen Sie uns von Ihren Anforderungen..." : "Tell us about your requirements..."}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  {lang === "de" ? "Beratung anfragen" : "Request Consultation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">KOVIN Meet</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {lang === "de" 
                ? "Enterprise-Videokonferenzen, selbst gehostet und White-Label-fähig."
                : "Enterprise video conferencing, self-hosted and white-label ready."}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                {t("login")}
              </Link>
              <Link href="/superadmin/login" className="hover:text-foreground transition-colors">
                {t("superadmin")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
