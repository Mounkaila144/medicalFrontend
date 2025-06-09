"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  Calendar,
  Users,
  CheckCircle
} from "lucide-react";

export function LandingContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      content: "contact@medclinic.fr",
      description: "Réponse sous 24h",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Téléphone",
      content: "+33 1 23 45 67 89",
      description: "Lun-Ven 9h-18h",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Adresse",
      content: "123 Avenue de la Santé",
      description: "75001 Paris, France",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Horaires",
      content: "Lun-Ven 9h-18h",
      description: "Support 24/7 disponible",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const supportOptions = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Chat en direct",
      description: "Discutez avec notre équipe support",
      action: "Démarrer le chat",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Planifier une démo",
      description: "Découvrez MedClinic en action",
      action: "Réserver un créneau",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Formation personnalisée",
      description: "Formation adaptée à votre équipe",
      action: "En savoir plus",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  return (
    <section id="contact" className="relative py-20 md:py-32 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/15 to-pink-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50 mb-6">
            <MessageCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Nous Contacter</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Parlons de Votre
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Projet Médical</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Notre équipe d'experts est là pour vous accompagner dans la transformation digitale de votre cabinet.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {contactInfo.map((info, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 hover:-translate-y-2"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${info.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {info.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-gray-900 font-medium mb-1">{info.content}</p>
              <p className="text-gray-600 text-sm">{info.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-8 shadow-lg border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Dr. Jean Dupont"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="jean.dupont@cabinet.fr"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-gray-700 font-medium">Sujet</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Demande d'information"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-700 font-medium">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Décrivez vos besoins et nous vous recontacterons rapidement..."
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Envoyer le message
              </Button>
            </form>
          </div>

          {/* Support Options */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Autres moyens de nous contacter</h3>
              <p className="text-gray-600 mb-8">
                Choisissez le canal qui vous convient le mieux pour obtenir l'aide dont vous avez besoin.
              </p>
            </div>

            <div className="space-y-6">
              {supportOptions.map((option, index) => (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-r ${option.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h4>
                      <p className="text-gray-600 mb-4">{option.description}</p>
                      <Button 
                        variant="outline" 
                        className="border-2 border-gray-300 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
                      >
                        {option.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-bold text-gray-900">Questions fréquentes</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Consultez notre FAQ pour trouver rapidement des réponses aux questions les plus courantes.
              </p>
              <Button variant="outline" className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50">
                Voir la FAQ
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Trust Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pourquoi choisir MedClinic ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600">Satisfaction client</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600">Support disponible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
                <div className="text-gray-600">Praticiens satisfaits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 