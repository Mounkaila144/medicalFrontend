import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowRight, Shield, Users, Clock } from "lucide-react";
import Image from "next/image";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-200/25 rounded-full blur-xl animate-pulse delay-500" />

      <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Solution Médicale Innovante</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-gray-900">Révolutionnez</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Votre Cabinet Médical
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                MedClinic transforme la gestion de votre cabinet avec une plateforme intelligente, 
                sécurisée et intuitive. Optimisez vos consultations, simplifiez vos processus.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Conforme RGPD</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>+1000 Praticiens</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Support 24/7</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/auth/register" className="flex items-center gap-2">
                  Démarrer Gratuitement
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                <Link href="/auth/login">Se Connecter</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Ils nous font confiance :</p>
              <div className="flex items-center gap-8 opacity-60">
                <div className="text-lg font-semibold text-gray-400">Clinique Santé+</div>
                <div className="text-lg font-semibold text-gray-400">Centre Médical Pro</div>
                <div className="text-lg font-semibold text-gray-400">Cabinet Moderne</div>
              </div>
            </div>
          </div>

          {/* Right Content - Medical Doctor Image */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative">
                {/* Doctor Image */}
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-blue-100 overflow-hidden">
                  <Image
                    src="/images/applicationmedical.png"
                    alt="Femme médecin tenant un ordinateur portable - Application médicale MedClinic"
                    width={600}
                    height={700}
                    className="w-full h-auto object-cover rounded-2xl"
                    priority
                  />
                  
                  {/* Overlay gradient for better integration */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 to-transparent rounded-2xl"></div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Système Actif</span>
                </div>
              </div>

              <div className="absolute top-1/2 -left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-green-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1000+</div>
                  <div className="text-xs text-gray-600">Praticiens</div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-purple-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-xs text-gray-600">Satisfaction</div>
                </div>
              </div>

              <div className="absolute bottom-1/3 -right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">RGPD</div>
                    <div className="text-xs text-gray-600">Conforme</div>
                  </div>
                </div>
              </div>

              {/* Floating particles around the image */}
              <div className="absolute top-20 -left-4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce"></div>
              <div className="absolute top-40 -right-2 w-3 h-3 bg-indigo-400/60 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-32 -left-2 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-700"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}