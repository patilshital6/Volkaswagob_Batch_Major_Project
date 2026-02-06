import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const Terms = () => {
    return (
        <div className="py-8">
            <PageHeader
                title="Terms of Service"
                subtitle="Governing rules for the use of the Zeta University Campus Portal."
            />
            <div className="max-w-4xl mx-auto space-y-8 px-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 shadow-sm">
                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing and using the Zeta University Campus Portal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and Zeta University’s Digital Use Policy. If you do not agree to these terms, please do not use the portal.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">2. User Accounts and Security</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            You are responsible for maintaining the confidentiality of your login credentials (Roll Number/Employee ID and Password).
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-3">
                            <li>You agree to notify IT Support immediately of any unauthorized use of your account.</li>
                            <li>Sharing credentials with other users is strictly prohibited.</li>
                            <li>Zeta University is not liable for any loss resulting from unauthorized use of your account.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">3. Academic Integrity and Conduct</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            All submissions made via the portal are subject to Zeta University's Academic Integrity Policy.
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-3">
                            <li>Plagiarism, cheating, or any form of academic dishonesty will result in disciplinary action.</li>
                            <li>Users must not upload offensive, defamatory, or unlawful material.</li>
                            <li>The portal must not be used for any commercial or unauthorized marketing purposes.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">4. Intellectual Property</h2>
                        <p className="text-slate-600 leading-relaxed">
                            All content on the portal, including designs, text, and graphics, is the property of Zeta University. Academic materials provided by faculty are for your personal educational use only and may not be redistributed without permission.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">5. System Availability and Modifications</h2>
                        <p className="text-slate-600 leading-relaxed">
                            While we strive for 24/7 uptime, portal access may be temporarily suspended for maintenance or updates. Zeta University reserves the right to modify portal features or these terms at any time without prior notice.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">6. Limitation of Liability</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Zeta University shall not be held liable for any direct, indirect, or incidental damages arising out of the use or inability to use the portal, including data loss or system errors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">7. Governing Law</h2>
                        <p className="text-slate-600 leading-relaxed">
                            These terms are governed by the laws of the jurisdiction in which Zeta University is located. Any disputes will be subject to the exclusive jurisdiction of its courts.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
