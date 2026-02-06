import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);

    const contactMethods = [
        {
            icon: <Mail className="text-indigo-600" />,
            title: "Email Support",
            primary: "support@zeta.edu",
            secondary: "registrar@zeta.edu",
            description: "For technical queries, academic records, and general support."
        },
        {
            icon: <Phone className="text-indigo-600" />,
            title: "Call Center",
            primary: "+1 (800) 123-4567",
            secondary: "+1 (800) 987-6543",
            description: "Available Mon-Fri, 9:00 AM - 6:00 PM for urgent inquiries."
        },
        {
            icon: <MapPin className="text-indigo-600" />,
            title: "Campus Office",
            primary: "Block AB-1, Suite 204",
            secondary: "Main Zeta University Campus",
            description: "Visit us for in-person consultations and document verification."
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="py-8">
            <PageHeader
                title="Support Directory"
                subtitle="Connect with our administrative and technical teams."
            />

            <div className="max-w-6xl mx-auto space-y-12 px-4">
                {/* Contact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {contactMethods.map((method, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                {method.icon}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">{method.title}</h3>
                            <div className="space-y-1 mb-4">
                                <p className="text-sm font-bold text-indigo-600">{method.primary}</p>
                                <p className="text-sm text-slate-500 font-medium">{method.secondary}</p>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{method.description}</p>
                        </div>
                    ))}
                </div>

                {/* Main Form & Hours Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inquiry Form */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-8 md:p-12 shadow-sm">
                        {submitted ? (
                            <div className="py-12 text-center animate-fadeIn">
                                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Message Sent Successfully</h3>
                                <p className="text-slate-500 mb-8">We've received your inquiry and will respond within 24-48 business hours.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-black text-slate-900 mb-8">Submit an Inquiry</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Full Name</label>
                                            <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all" placeholder="Enter your name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Academic ID</label>
                                            <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all" placeholder="Roll No. or Faculty ID" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Subject</label>
                                        <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all">
                                            <option>Grade Correction</option>
                                            <option>Technical Access Issue</option>
                                            <option>Course Registration Help</option>
                                            <option>Financial Query</option>
                                            <option>Other / General Inquiry</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Your Message</label>
                                        <textarea required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all min-h-[160px]" placeholder="Describe your issue in detail..."></textarea>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                                        SEND MESSAGE <Send size={16} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Operational Hours */}
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white h-fit">
                        <Clock className="mb-6 text-indigo-400 opacity-50" size={32} />
                        <h3 className="text-xl font-black mb-6">Operational Hours</h3>
                        <div className="space-y-6">
                            <div className="pb-6 border-b border-slate-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Main Campus Office</p>
                                <p className="text-sm font-bold">Mon - Fri • 09:00 - 18:00</p>
                                <p className="text-sm font-bold text-slate-400">Sat • 10:00 - 14:00</p>
                            </div>
                            <div className="pb-6 border-b border-slate-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Support</p>
                                <p className="text-sm font-bold">Mon - Sun • 24 / 7 Online</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Zeta University Library</p>
                                <p className="text-sm font-bold">Mon - Sat • 08:00 - 22:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
