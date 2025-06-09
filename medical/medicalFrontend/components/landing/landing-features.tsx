import {
  Calendar,
  ClipboardList,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Planification Intelligente",
      description: "Prise de rendez-vous intelligente avec détection de conflits et rappels automatiques.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "Dossiers Médicaux Électroniques",
      description: "Historique médical complet des patients, diagnostics et plans de traitement centralisés.",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestion des Patients",
      description: "Profils patients complets avec historique médical, documents et informations de contact.",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Documentation Clinique",
      description: "Modèles standardisés pour consultations, prescriptions et certificats médicaux.",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Facturation & Paiements",
      description: "Génération de factures professionnelles, suivi des paiements et gestion des assurances.",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analyses & Rapports",
      description: "Insights sur les performances de votre cabinet avec rapports personnalisables et tableaux de bord.",
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Sécurisé & Conforme",
      description: "Plateforme conforme aux normes de santé avec contrôle d'accès par rôles et chiffrement des données.",
      gradient: "from-slate-500 to-gray-500",
      bgGradient: "from-slate-50 to-gray-50",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Automatisation Efficace",
      description: "Automatisez les tâches routinières : rappels de RDV, renouvellements d'ordonnances et suivis.",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
    }
  ];

  const benefits = [
    "Réduction de 60% du temps administratif",
    "Amélioration de 40% de la satisfaction patient",
    "Conformité RGPD garantie",
    "Support technique 24/7",
  ];

  return (
    <section className="relative py-20 md:py-32 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50 mb-6">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Fonctionnalités Avancées</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Gestion Complète de Votre
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Cabinet Médical</span>
            </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Tout ce dont vous avez besoin pour gérer efficacement votre cabinet médical et offrir les meilleurs soins à vos patients.
            </p>
          </div>

        {/* Benefits Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-800">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 hover:-translate-y-2"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>

                {/* Hover Effect Arrow */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    En savoir plus
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <span className="font-semibold">Découvrir toutes les fonctionnalités</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}