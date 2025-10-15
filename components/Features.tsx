
import React from 'react';
import { GiftIcon } from './icons/GiftIcon';
import ShieldIcon from './icons/ShieldIcon';
import { BookIcon } from './icons/BookIcon';
import { Bot, QrCode } from 'lucide-react';
import { FileTextIcon } from './icons/FileTextIcon';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-primary/30 hover:-translate-y-2 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    <div className="relative">
      <div className="flex items-center justify-center h-20 w-20 rounded-3xl bg-[#4f46e5] text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-lg">{description}</p>
    </div>
  </div>
);

const Features: React.FC = () => {
  const featuresData = [
    {
      icon: <GiftIcon className="h-8 w-8 text-white" />,
      title: 'Iscriviti senza costi',
      description: 'Per te 20 crediti gratuiti per poter testare la piattaforma senza vincoli.',
    },
    {
      icon: <ShieldIcon className="h-8 w-8 text-white" />,
      title: 'Uso Semplificato',
      description: 'Non servono wallet o asset cryptografici. Opera senza complessità.',
    },
    {
      icon: <FileTextIcon className="h-8 w-8 text-white" />,
      title: 'Certifica Documenti',
      description: 'Certifica documenti e contratti con l\'iscrizione degli hash onchain.',
    },
    {
      icon: <QrCode className="h-8 w-8 text-white" />,
      title: 'QR Code',
      description: 'Crea Qr code delle iscrizioni che potrai usare sulle etichette del prodotto.',
    },
    {
      icon: <Bot className="h-8 w-8 text-white" />,
      title: 'Agente AI',
      description: 'Con il piano Custom, un agente AI può gestire tutto in modo automatizzato.',
    },
    {
      icon: <BookIcon className="h-8 w-8 text-white" />,
      title: 'Documentazione',
      description: 'Una guida semplice per iniziare e integrare SimplyChain nei tuoi processi.',
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-4">
            Funzionalità Avanzate
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-12">
            Scopri come SimplyChain può rivoluzionare i tuoi processi aziendali 
            con la potenza della tecnologia blockchain.
          </p>
        </div>





        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature, index) => (
            <div 
              key={index} 
              className="transform transition-all duration-700 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
