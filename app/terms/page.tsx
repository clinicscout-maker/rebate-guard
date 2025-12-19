import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-green-500/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors gap-2 font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>
                </div>

                {/* Last Updated Banner */}
                <div className="bg-slate-900 border-l-4 border-green-500 p-4 mb-10 rounded-r-lg">
                    <p className="text-sm text-slate-400">
                        Last Updated: <span className="font-semibold text-slate-200">{currentDate}</span>
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-slate max-w-none">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-8">Terms of Service & Disclaimer</h1>

                    <h2>1. Disclaimer of Warranties (The "As-Is" Clause)</h2>
                    <p>
                        The RebateGuard Service, including all data, rebate estimates, and compliance checks, is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind. To the fullest extent permitted by applicable law (including the laws of Ontario and Canada), RebateGuard expressly disclaims all warranties, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                    </p>

                    <h2>2. No Guarantee of Rebates (The "Estimate" Clause)</h2>
                    <p>
                        RebateGuard is a data aggregation tool that provides <strong>estimates</strong> based on public third-party databases (including Natural Resources Canada and AHRI). You acknowledge and agree that:
                    </p>
                    <ul>
                        <li>(a) Government rebate programs (e.g., Enbridge HER+, CleanBC) are subject to change without notice;</li>
                        <li>(b) RebateGuard does not guarantee that any specific equipment combination will be approved for a rebate by the relevant authority;</li>
                        <li>(c) The final decision on rebate eligibility rests solely with the program administrator, not RebateGuard.</li>
                    </ul>

                    <h2>3. Professional Responsibility (The "User is Pro" Clause)</h2>
                    <p>
                        You acknowledge that you are a professional HVAC contractor or energy advisor and that you use RebateGuard solely as a support tool. You agree that <strong>you are solely responsible</strong> for:
                    </p>
                    <ul>
                        <li>(a) Verifying the accuracy of all model numbers, AHRI ratings, and eligibility criteria before submitting any quote or application;</li>
                        <li>(b) Ensuring compliance with all local building codes and program-specific installation requirements (e.g., pre-retrofit audits);</li>
                        <li>(c) Communicating to your end-customers that rebate amounts are estimates and not guaranteed.</li>
                    </ul>

                    <h2>4. Limitation of Liability (The "Cap" Clause)</h2>
                    <p>
                        In no event shall RebateGuard, its founders, affiliates, or licensors be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:
                    </p>
                    <ul>
                        <li>(a) <strong>Loss of expected rebates or grants;</strong></li>
                        <li>(b) Loss of profits, data, use, or goodwill;</li>
                        <li>(c) Costs of procuring substitute goods or services.</li>
                    </ul>
                    <p>
                        RebateGuard's total cumulative liability to you for any claims arising out of or relating to this Agreement or your use of the Service shall <strong>not exceed the total amount paid by you to RebateGuard</strong> in the three (3) months preceding the claim.
                    </p>

                    <h2>5. Indemnification</h2>
                    <p>
                        You agree to indemnify and hold harmless RebateGuard from any claims, damages, liabilities, costs, or expenses (including legal fees) arising from your use of the Service, including any claims brought by your customers regarding denied rebates or system performance.
                    </p>
                </div>
            </div>
        </div>
    );
}
