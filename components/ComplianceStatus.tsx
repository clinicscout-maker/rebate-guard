import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ValidationResult } from '@/lib/compliance';

type Props = {
    result: ValidationResult | null;
};

export function ComplianceStatus({ result }: Props) {
    if (!result) return null;

    const isSafe = result.status === 'SAFE';

    return (
        <div className={`mt-6 p-6 rounded-xl border-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${isSafe
                ? 'bg-emerald-50 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-red-50 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${isSafe ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {isSafe ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                </div>

                <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${isSafe ? 'text-emerald-900' : 'text-red-900'}`}>
                        {isSafe ? 'COMPLIANCE VERIFIED' : 'COMPLIANCE FAILED'}
                    </h3>
                    <p className={`text-sm font-medium uppercase tracking-wider mb-3 ${isSafe ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isSafe ? 'Eligible for Rebate' : 'Ineligible for Rebate'}
                    </p>

                    <div className="space-y-2">
                        {result.messages.map((msg, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm font-medium">
                                {isSafe ? (
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                ) : (
                                    <AlertCircle size={16} className="text-red-600" />
                                )}
                                <span className={isSafe ? 'text-emerald-800' : 'text-red-800'}>{msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
