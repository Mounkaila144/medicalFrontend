import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import LandingHero from '@/components/landing/landing-hero';
import { LandingFeatures } from '@/components/landing/landing-features';
import { LandingTestimonials } from '@/components/landing/landing-testimonials';
import { LandingPricing } from '@/components/landing/landing-pricing';
import { LandingContact } from '@/components/landing/landing-contact';
import { LandingCTA } from '@/components/landing/landing-cta';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 border-b border-gray-200/50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MedClinic
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Fonctionnalités
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Témoignages
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Tarifs
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hover:bg-blue-50 hover:text-blue-600">
              <Link href="/auth/login">Se Connecter</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
              <Link href="/auth/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col">
      <LandingHero />
        <div id="features">
      <LandingFeatures />
        </div>
        <div id="testimonials">
      <LandingTestimonials />
        </div>
        <div id="pricing">
          <LandingPricing />
        </div>
        <div id="contact">
          <LandingContact />
        </div>
      <LandingCTA />
    </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MedClinic</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                La solution complète pour la gestion de votre cabinet médical. 
                Moderne, sécurisée et intuitive.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intégrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Communauté</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>contact@medclinic.fr</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>Paris, France</span>
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Link href="#contact">Nous Contacter</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 MedClinic. Tous droits réservés. Système de gestion médicale professionnel.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
                <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
                <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}