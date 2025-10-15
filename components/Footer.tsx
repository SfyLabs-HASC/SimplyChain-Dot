
import React from 'react';
import { Twitter, Linkedin, Globe, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer id="about" className="bg-gradient-to-br from-slate-50 to-slate-100 border-t border-slate-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid gap-10 md:grid-cols-2 items-start">
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-semibold text-slate-900 mb-3">Links</h4>
                        <div className="flex items-center justify-center md:justify-start gap-6 text-base text-slate-700">
                            <a href="/termini" className="hover:text-primary">Terms</a>
                            <span className="hidden md:inline text-slate-300">•</span>
                            <a href="/privacy" className="hover:text-primary">Privacy</a>
                            <span className="hidden md:inline text-slate-300">•</span>
                            <a href="/cookie" className="hover:text-primary">Cookies</a>
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-end gap-4">
                            <a href="#" aria-label="Pagina X" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#4f46e5] text-white hover:opacity-90">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" aria-label="LinkedIn" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#4f46e5] text-white hover:opacity-90">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://stickyfactory.it" target="_blank" rel="noopener noreferrer" aria-label="Sito web" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#4f46e5] text-white hover:opacity-90">
                                <Globe className="w-5 h-5" />
                            </a>
                            <a href="/contatti" aria-label="Contatti" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#4f46e5] text-white hover:opacity-90">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="mt-3 text-xs text-slate-500">Powered by <a className="text-primary hover:underline" href="https://arbitrum.io/" target="_blank" rel="noopener noreferrer">Arbitrum</a></div>
                    </div>
                </div>

                <div className="mt-10 border-t border-slate-200 pt-6 flex flex-col items-center justify-center gap-2">
                    <div className="text-sm text-slate-600 text-center">
                        &copy; {new Date().getFullYear()} SimplyChain. All rights reserved.
                    </div>
                    <div className="text-xs text-slate-500 text-center">
                        SFY s.r.l. - <a href="https://www.stickyfactory.it" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">www.stickyfactory.it</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
