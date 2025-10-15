
import React, { useEffect, useRef, useState } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import VideoModal from './VideoModal';
import AuthButton from './AuthButton';
import { useActiveAccount } from 'thirdweb/react';
import { useNavigate } from 'react-router-dom';

const BlockchainBlock: React.FC<{ index: number; hash: string; prevHash: string }> = ({ index, hash, prevHash }) => (
    <div className="bg-white rounded-lg p-3 text-xs shadow-md border border-slate-200">
        <div className="font-bold text-primary">Block #{index}</div>
        <div className="mt-1 text-slate-500 break-all">
            <p><span className="font-semibold text-slate-700">Hash:</span> {hash}...</p>
            <p><span className="font-semibold text-slate-700">Prev:</span> {prevHash}...</p>
        </div>
    </div>
);

// Componente personalizzato per il tasto "Vai al Servizio"
const VaiAlServizioButton: React.FC = () => {
    const account = useActiveAccount();
    const navigate = useNavigate();
    const authButtonRef = useRef<HTMLDivElement>(null);
    
    const handleClick = () => {
        if (account?.address) {
            // Se loggato, vai alla dashboard
            console.log('🚀 Going to dashboard, account:', account?.address);
            navigate('/dashboard');
        } else {
            // Se non loggato, clicca l'AuthButton nascosto
            console.log('🔐 Triggering login modal');
            const button = authButtonRef.current?.querySelector('button');
            if (button) {
                button.click();
            }
        }
    };
    
    return (
        <>
            {/* AuthButton nascosto che viene triggerato */}
            <div ref={authButtonRef} style={{ display: 'none' }}>
                <AuthButton 
                    label="Vai al Servizio" 
                    includeMetamask={false}
                    disableAA={false}
                />
            </div>
            
            {/* Il nostro tasto personalizzato */}
            <button
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-700 shadow-lg transform hover:-translate-y-1 transition-all"
            >
                Vai al Servizio
            </button>
        </>
    );
};

const Hero: React.FC = () => {
    const [openVideo, setOpenVideo] = useState(false);
    const account = useActiveAccount();
    const navigate = useNavigate();
    const initialHasAccount = useRef<boolean>(!!account?.address);

    // Redirect to dashboard only on fresh connection from home (not if already logged in on load)
    useEffect(() => {
        if (!initialHasAccount.current && account?.address) {
            initialHasAccount.current = true;
            navigate('/dashboard');
        }
    }, [account?.address, navigate]);
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-40">
                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-transparent"></div>
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        {/* Badge */}
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Innovazione Blockchain per Aziende
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
                            La certificazione <span className="text-primary">Blockchain</span> facile.
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-xl mx-auto md:mx-0">
                            Semplice, sicura e potente. Per aziende italiane che vogliono innovare senza complessità.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <VaiAlServizioButton />
                            <button onClick={() => setOpenVideo(true)} className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-lg transform hover:-translate-y-1 transition-all">
                                <PlayIcon className="h-5 w-5" />
                                Come Funziona
                            </button>
                        </div>
                    </div>

                    {/* Visual Content */}
                    <div className="relative order-1 md:order-2">
                        <div className="relative group">
                            {/* Subtle animated glow effect */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>
                            
                            {/* Main video container with elegant border */}
                            <div className="relative bg-gradient-to-br from-white via-slate-50 to-white p-2 rounded-3xl shadow-2xl shadow-slate-200/50 group-hover:shadow-purple-200/30 transition-all duration-500">
                                {/* Inner border with subtle animation */}
                                <div className="relative bg-gradient-to-br from-purple-100/30 to-blue-100/30 p-1 rounded-2xl">
                                    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-inner">
                                        <div className="relative pt-[56.25%] group-hover:scale-[1.02] transition-transform duration-700">
                                            <video
                                                src="/hero.mp4"
                                                className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                            {/* Subtle overlay for depth */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-xl"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Elegant floating elements with better positioning */}
                            <div className="absolute -top-3 -right-3 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-ping opacity-70"></div>
                            <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-bounce opacity-60"></div>
                            <div className="absolute top-1/3 -left-4 w-1.5 h-1.5 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full animate-pulse opacity-50"></div>
                            <div className="absolute top-2/3 -right-4 w-1.5 h-1.5 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full animate-pulse opacity-50"></div>
                            
                            {/* Subtle corner accents */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-purple-200/50 rounded-lg rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
                            <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-blue-200/50 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>



            <VideoModal open={openVideo} onClose={() => setOpenVideo(false)} src="https://www.youtube.com/embed/OfOG1rqH9D0" />
        </section>
    );
};

export default Hero;
