'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        // Listen for install prompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSModal(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback or maybe already installed but not detectable perfectly
            alert("To install, look for the 'Add to Home Screen' option in your browser menu.");
        }
    };

    if (isStandalone) return null; // Don't show if already installed

    // Only show button if we have a prompt (Android) OR we are on iOS
    if (!deferredPrompt && !isIOS) return null;

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-green-400 border border-green-900/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
                <Download size={16} />
                <span>Install App</span>
            </button>

            {/* iOS Instructions Modal */}
            {showIOSModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
                        onClick={() => setShowIOSModal(false)}
                    ></div>
                    <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowIOSModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-4">Install RebateGuard</h3>
                        <p className="text-slate-300 text-sm mb-6">
                            Install this web app on your iPhone for the best experience.
                        </p>

                        <div className="space-y-4 text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full text-white font-bold text-sm">1</span>
                                <span className="text-slate-300 text-sm">Tap the <Share className="inline w-4 h-4 mx-1" /> Share button in Safari</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full text-white font-bold text-sm">2</span>
                                <span className="text-slate-300 text-sm">Scroll down and tap <PlusSquare className="inline w-4 h-4 mx-1" /> <strong>Add to Home Screen</strong></span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowIOSModal(false)}
                            className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
