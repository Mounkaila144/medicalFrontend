import { Star, Quote } from "lucide-react";

export function LandingTestimonials() {
  const testimonials = [
    {
      quote: "MedClinic a complètement transformé le fonctionnement de notre clinique. Le système de planification seul nous a fait économiser d'innombrables heures.",
      author: "Dr. Sarah Dubois",
      role: "Médecine Générale, Clinique Santé Plus",
      rating: 5,
      avatar: "SD",
      specialty: "15 ans d'expérience",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      quote: "Les modules de gestion des patients et des dossiers médicaux sont intuitifs et complets. Notre équipe s'est adaptée au système en quelques jours.",
      author: "Dr. Michel Tremblay",
      role: "Pédiatre, Centre de Bien-être Enfants",
      rating: 5,
      avatar: "MT",
      specialty: "Spécialiste pédiatrie",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      quote: "En tant que gestionnaire de cabinet, le tableau de bord analytique me donne des insights précieux sur nos opérations que nous n'avions jamais eus auparavant.",
      author: "Rebecca Martin",
      role: "Gestionnaire de Cabinet, Spécialistes Cardio",
      rating: 5,
      avatar: "RM",
      specialty: "Gestion médicale",
      gradient: "from-purple-500 to-indigo-500",
    }
  ];

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-200/10 to-blue-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm mb-6">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">Témoignages Clients</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Approuvé par les
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Professionnels de Santé</span>
            </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Découvrez ce que les professionnels médicaux disent de notre plateforme
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600 font-medium">Praticiens Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600 font-medium">Satisfaction Client</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">Support Technique</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-12 w-12 text-gray-400" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 relative z-10">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {testimonial.avatar}
                </div>
                
                {/* Author Info */}
                <div>
                  <div className="font-bold text-gray-900 text-lg">{testimonial.author}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  <div className="text-blue-600 text-xs font-medium">{testimonial.specialty}</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-blue-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative Elements */}
              <div className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Rejoignez des milliers de professionnels satisfaits
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez votre essai gratuit dès aujourd'hui et découvrez pourquoi MedClinic est le choix préféré des professionnels de santé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                Essai Gratuit 30 Jours
              </button>
              <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-blue-300 hover:text-blue-600 transition-all duration-300">
                Demander une Démo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}