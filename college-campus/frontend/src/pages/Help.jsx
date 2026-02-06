import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { HelpCircle, ChevronRight, ChevronDown, User, BookOpen, Clock, ShieldCheck } from 'lucide-react';

import { Link } from 'react-router-dom';

const Help = () => {
    const categories = [
        {
            title: "General Portal Access",
            icon: <User size={18} className="text-indigo-600" />,
            faqs: [
                {
                    q: "I cannot log in to my account. What should I do?",
                    a: "Ensure you are using the correct Roll Number/Employee ID. If you've forgotten your password, use the 'Forgot Password' link or visit the IT Support desk in AB-1."
                },
                {
                    q: "How do I update my profile details?",
                    a: "Go to the 'Profile' section. For basic updates like contact info, you can edit them directly. For permanent records like your name or department, contact the Admission Office."
                }
            ]
        },
        {
            title: "Courses & Academics",
            icon: <BookOpen size={18} className="text-indigo-600" />,
            faqs: [
                {
                    q: "Where can I see my class schedule?",
                    a: "Your personalized weekly schedule is available in the 'Timetable' module. It includes session timings, faculty names, and room numbers."
                },
                {
                    q: "How does the Course Registration work?",
                    a: "During the open window, navigate to 'Registration', browse available courses for your department, and click 'Enroll'. Availability is based on credits and prerequisites."
                },
                {
                    q: "I cannot see my grades for the current semester.",
                    a: "Grades are displayed once faculty members complete the evaluation and submit them to the Registrar. Check the 'Grades' page regularly for updates."
                }
            ]
        },
        {
            title: "Assignments & Submissions",
            icon: <Clock size={18} className="text-indigo-600" />,
            faqs: [
                {
                    q: "How do I submit an assignment link?",
                    a: "Go to the 'Assignments' page, find the pending task, and click 'Submit'. Provide a publicly accessible URL (Google Drive, GitHub, etc.) for the faculty to review."
                },
                {
                    q: "Can I edit an assignment after I've submitted it?",
                    a: "Resubmission depends on the specific course policy set by the teacher. If the 'Submit' button is still active, you may update your link."
                }
            ]
        },
        {
            title: "Security & Guidelines",
            icon: <ShieldCheck size={18} className="text-indigo-600" />,
            faqs: [
                {
                    q: "Is it safe to access the portal on public Wi-Fi?",
                    a: "The portal uses SSL encryption, but we recommend using a secure network for transactions or sensitive data entry. Always log out when using a shared terminal."
                }
            ]
        }
    ];

    return (
        <div className="py-8">
            <PageHeader
                title="Help Center"
                subtitle="Your guide to navigating the Zeta University Campus Portal."
            />

            <div className="max-w-4xl mx-auto space-y-12 px-4">
                {/* Search / Intro */}
                <div className="text-center bg-slate-900 rounded-[40px] p-10 text-white">
                    <HelpCircle size={48} className="mx-auto mb-4 text-indigo-400 opacity-50" />
                    <h2 className="text-2xl font-black mb-2">How can we help you?</h2>
                    <p className="text-slate-400 max-w-md mx-auto">Explore our categories below or search for specific academic and technical queries.</p>
                </div>

                {/* FAQ Categories */}
                <div className="grid grid-cols-1 gap-8">
                    {categories.map((cat, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <span className="p-2 bg-indigo-50 rounded-xl">{cat.icon}</span>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{cat.title}</h3>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {cat.faqs.map((faq, j) => (
                                    <FAQItem key={j} q={faq.q} a={faq.a} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Support Ticket */}
                <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-12 text-center shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Still have questions?</h3>
                    <p className="text-slate-500 mb-8 max-w-lg mx-auto">If you couldn't find an answer here, our technical support team is ready to assist you round the clock.</p>
                    <div className="flex justify-center">
                        <Link
                            to="/support"
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all text-center"
                        >
                            Submit a Ticket
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FAQItem = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`bg-white border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-lg border-indigo-100' : 'hover:border-slate-200'}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-900'}`}>{q}</span>
                {isOpen ? <ChevronDown size={18} className="text-indigo-400" /> : <ChevronRight size={18} className="text-slate-300" />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 animate-fadeIn">
                    <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">
                        {a}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Help;
