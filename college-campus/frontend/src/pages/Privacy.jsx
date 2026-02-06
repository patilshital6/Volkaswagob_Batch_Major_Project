import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const Privacy = () => {
    return (
        <div className="py-8">
            <PageHeader
                title="Privacy Policy"
                subtitle="Information about how we collect, use, and handle your data."
            />
            <div className="max-w-4xl mx-auto space-y-8 px-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 shadow-sm">
                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">1. Introduction</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Welcome to the Zeta University Campus Portal. We are committed to protecting your privacy and ensuring the security of your personal and academic information. This Privacy Policy outlines our practices regarding information collection, usage, and disclosure when you use our portal services.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">2. Information We Collect</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Personal Identification</h3>
                                <p className="text-slate-600 leading-relaxed">Name, Roll Number, Employee ID, Email address, and contact details provided during registration.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Academic Records</h3>
                                <p className="text-slate-600 leading-relaxed">Course enrollments, grades, attendance, assignment submissions, and examination schedules.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Usage Data</h3>
                                <p className="text-slate-600 leading-relaxed">Log files, browser type, device information, and activity timestamps to improve portal performance and security.</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">3. How We Use Your Data</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-3">
                            <li>Facilitating course registration and academic management.</li>
                            <li>Maintaining and updating student and faculty records.</li>
                            <li>Providing notifications regarding events, deadlines, and grades.</li>
                            <li>Ensuring portal security and preventing unauthorized access.</li>
                            <li>Improving the user experience through diagnostic analysis.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">4. Data Sharing and Disclosure</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Zeta University does not sell or rent your personal information. We may share data with legal authorities when required by law or with academic partners for essential educational services, ensuring they adhere to equivalent privacy standards.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">5. Your Privacy Rights</h2>
                        <p className="text-slate-600 leading-relaxed">
                            You have the right to access your personal data, request corrections for inaccuracies, and in some cases, request the deletion of non-essential records. For academic record corrections, please contact the Registrar's Office.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">6. Contact Information</h2>
                        <p className="text-slate-600 leading-relaxed">
                            For any privacy-related inquiries or concerns, please contact our Data Protection Officer at <strong>privacy@zeta.edu</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
