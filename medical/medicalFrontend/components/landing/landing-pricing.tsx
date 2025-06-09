import { Check, Star, Zap, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingPricing() {
  const plans = [
    {
      name: "Starter",
      description: "Parfait pour les praticiens individuels",
      price: "29",
      period: "mois",
      icon: <Zap className="h-6 w-6" />,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      popular: false,
      features: [
        "Jusqu'à 100 patients",
        "Gestion des rendez-vous",
        "Dossiers médicaux de base",
        "Facturation simple",
        "Support email",
        "1 utilisateur"
      ]
    },
    {
      name: "Professional",
      description: "Idéal pour les cabinets en croissance",
      price: "79",
      period: "mois",
      icon: <Star className="h-6 w-6" />,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      popular: true,
      features: [
        "Patients illimités",
        "Gestion avancée des RDV",
        "Dossiers médicaux complets",
        "Facturation automatisée",
        "Analyses et rapports",
        "Support prioritaire",
        "Jusqu'à 5 utilisateurs",
        "Intégrations tierces"
      ]
    },
    {
      name: "Enterprise",
      description: "Pour les grandes structures médicales",
      price: "149",
      period: "mois",
      icon: <Crown className="h-6 w-6" />,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      popular: false,
      features: [
        "Tout du plan Professional",
        "Utilisateurs illimités",
        "API complète",
        "Personnalisation avancée",
        "Formation dédiée",
        "Support 24/7",
        "Gestionnaire de compte",
        "Conformité renforcée"
      ]
    }
  ];

  return (
    <section id="pricing" className="relative py-20 md:py-32 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-200/15 to-pink-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm mb-6">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Tarification Transparente</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choisissez le Plan
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Parfait pour Vous</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Des tarifs adaptés à chaque taille de cabinet. Commencez gratuitement, évoluez selon vos besoins.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border ${
                plan.popular 
                  ? 'border-blue-200 ring-2 ring-blue-500/20 scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              } hover:-translate-y-2`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Le plus populaire
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {plan.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}€</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Facturation mensuelle</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                asChild
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } transition-all duration-300 group-hover:shadow-lg`}
                size="lg"
              >
                <Link href="/auth/register">
                  {plan.popular ? 'Commencer maintenant' : 'Choisir ce plan'}
                </Link>
              </Button>

              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Besoin d'une solution sur mesure ?
            </h3>
            <p className="text-gray-600 mb-6">
              Contactez notre équipe pour discuter de vos besoins spécifiques et obtenir un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Demander un devis
              </Button>
              <Button variant="outline" className="border-2 border-gray-300 hover:border-blue-300 hover:text-blue-600">
                Planifier une démo
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Essai gratuit 30 jours</h4>
            <p className="text-gray-600 text-sm">Testez toutes les fonctionnalités sans engagement</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Sécurité garantie</h4>
            <p className="text-gray-600 text-sm">Conformité RGPD et chiffrement de bout en bout</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Support expert</h4>
            <p className="text-gray-600 text-sm">Équipe dédiée aux professionnels de santé</p>
          </div>
        </div>
      </div>
    </section>
  );
} 