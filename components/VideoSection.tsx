import React from 'react';
import { ThumbsUp, Shield, Zap } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const VideoSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Lottie Animation */}
          <div className="relative">
            <div className="relative w-full aspect-square">
              <DotLottieReact
                src="/animazione.json"
                loop
                autoplay
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ThumbsUp className="w-7 h-7 text-[#4f46e5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Zero Complessità Tecnica</h3>
                    <p className="text-slate-600">
                      Non serve conoscere blockchain, wallet o criptovalute. SimplyChain gestisce tutto per te 
                      con la tecnologia Account Abstraction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-[#4f46e5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sicurezza Garantita</h3>
                    <p className="text-slate-600">
                      I tuoi documenti vengono protetti con hash SHA-256 e registrati sulla blockchain Arbitrum, 
                      garantendo immutabilità e tracciabilità permanente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-[#4f46e5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Velocità e Efficienza</h3>
                    <p className="text-slate-600">
                      Transazioni rapide sulla rete Arbitrum con costi minimi. 
                      Certifica hash dei documenti e traccia filiere in pochi secondi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-1">20</div>
                <div className="text-sm font-medium text-primary-700">Crediti Gratuiti</div>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-1">&lt;30s</div>
                <div className="text-sm font-medium text-primary-700">Tempo di Iscrizione</div>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm font-medium text-primary-700">Disponibilità</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="rounded-2xl p-8 border bg-[#4f46e5]/10 border-[#4f46e5]/20">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Pronto a Innovare la Tua Azienda?
            </h3>
            <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
              Unisciti alle centinaia di aziende italiane che hanno già scelto SimplyChain 
              per proteggere i loro documenti e tracciare le loro filiere produttive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contatti" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-700 shadow-lg transform hover:-translate-y-1 transition-all"
              >
                Contattaci
              </a>
              <a 
                href="/form" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-100 shadow-lg transform hover:-translate-y-1 transition-all"
              >
                Registrati
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;