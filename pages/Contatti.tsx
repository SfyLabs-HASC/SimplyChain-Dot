import React, { useState } from 'react';

const Contatti: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    azienda: '',
    messaggio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/send-email?action=contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ nome: '', email: '', azienda: '', messaggio: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Contattaci</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            Hai domande su SimplyChain? Vuoi saperne di più sui nostri servizi? 
            Siamo qui per aiutarti a innovare la tua azienda.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <p className="text-lg text-slate-700 mb-4">
              Che tu stia pianificando un progetto su larga scala, necessiti di un'integrazione particolare o semplicemente desideri un quantitativo di crediti specifico, il nostro team è pronto ad ascoltarti. Analizzeremo le tue esigenze per costruire un piano su misura che massimizzi il tuo investimento e ti garantisca la massima flessibilità.
            </p>
            <p className="text-xl font-semibold text-slate-900">
              Parla con un nostro esperto per la tua offerta personalizzata
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form di contatto */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Invia un messaggio</h2>
            
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Messaggio inviato!</h3>
                <p className="text-green-500">Ti risponderemo al più presto.</p>
              </div>
            ) : submitStatus === 'error' ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-6xl mb-4">✗</div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Errore nell'invio</h3>
                <p className="text-red-500 mb-4">Si è verificato un errore. Riprova più tardi.</p>
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="bg-primary hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Riprova
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      placeholder="tua@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Azienda
                  </label>
                  <input
                    type="text"
                    value={formData.azienda}
                    onChange={(e) => setFormData(prev => ({ ...prev, azienda: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Nome della tua azienda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Messaggio *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.messaggio}
                    onChange={(e) => setFormData(prev => ({ ...prev, messaggio: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                    placeholder="Come possiamo aiutarti?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Invio in corso...
                    </>
                  ) : (
                    'Invia Messaggio'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Informazioni di contatto */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Informazioni di contatto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                    <p className="text-slate-600">info@simplychain.it</p>
                    <p className="text-sm text-slate-500">Rispondiamo entro 24 ore</p>
                  </div>
                </div>

                

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Orari</h3>
                    <p className="text-slate-600">Lunedì - Venerdì</p>
                    <p className="text-sm text-slate-500">9:00 - 18:00 CET</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-purple-50 rounded-2xl p-8 border border-primary/10">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Perché contattarci?</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Consulenza gratuita per la tua azienda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Demo personalizzata della piattaforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Supporto tecnico specializzato</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Preventivi su misura per servizi custom</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contatti;

