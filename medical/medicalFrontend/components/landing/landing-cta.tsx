import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles, Zap } from "lucide-react";

export function LandingCTA() {
  const features = [
    "Essai gratuit de 30 jours",
    "Configuration en moins de 5 minutes",
    "Support dédié inclus",
    "Aucun engagement"
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-300/30 rounded-full animate-ping delay-700" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-300/25 rounded-full animate-ping delay-1000" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Offre Limitée</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Prêt à Transformer
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Votre Cabinet ?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Rejoignez des milliers de professionnels de santé qui ont optimisé leurs opérations avec MedClinic.
            </p>
          </div>

          {/* Main CTA Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  Commencez Dès Aujourd'hui
                </h3>
                
                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-blue-100">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    asChild
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Link href="/auth/register" className="flex items-center gap-2">
                      Commencer Gratuitement
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
            </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    asChild
                    className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                  >
                    <Link href="/auth/login">Se Connecter</Link>
            </Button>
                </div>
              </div>

              {/* Right Content - Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">1000+</div>
                  <div className="text-blue-200 text-sm">Praticiens Actifs</div>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
                  <div className="text-blue-200 text-sm">Satisfaction</div>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-blue-200 text-sm">Support</div>
                </div>
                
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">5min</div>
                  <div className="text-blue-200 text-sm">Configuration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="text-center mt-16">
            <p className="text-blue-200 mb-8">Ils nous font confiance :</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-semibold">Clinique Santé+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-semibold">Centre Médical Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-semibold">Cabinet Moderne</span>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-400/30">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">Conforme RGPD • Données Sécurisées • Hébergement Français</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}