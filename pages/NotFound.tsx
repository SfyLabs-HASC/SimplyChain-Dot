import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '../components/icons/HomeIcon';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number with Animation */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-600 leading-none">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Pagina non trovata
          </h2>
          <p className="text-lg text-slate-600 mb-6 max-w-md mx-auto">
            Oops! La pagina che stai cercando non esiste o è stata spostata.
          </p>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
            <p className="text-slate-500 text-sm">
              Potrebbe essere un errore di digitazione nell'URL o la pagina potrebbe essere stata rimossa.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-700 text-white font-semibold rounded-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <HomeIcon className="h-5 w-5" />
            Torna alla Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold rounded-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Torna Indietro
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 mb-4">Oppure prova una di queste pagine:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/prezzi"
              className="text-primary hover:text-primary-700 font-medium transition-colors"
            >
              Piani
            </Link>
            <Link
              to="/documentazione"
              className="text-primary hover:text-primary-700 font-medium transition-colors"
            >
              Documentazione
            </Link>
            <Link
              to="/contatti"
              className="text-primary hover:text-primary-700 font-medium transition-colors"
            >
              Contatti
            </Link>
            <Link
              to="/form"
              className="text-primary hover:text-primary-700 font-medium transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-primary/10 rounded-full blur-lg"></div>
        <div className="absolute top-1/3 right-5 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

export default NotFound;