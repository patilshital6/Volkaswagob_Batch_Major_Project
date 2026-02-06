import PageHeader from '../components/layout/PageHeader';
import HeroCarousel from '../components/common/HeroCarousel';

const FacultyHome = () => {
    return (
        <div className="py-8">
            <PageHeader
                title="Faculty Overview"
                subtitle="Manage your classes, students, and research publications."
            />

            <HeroCarousel />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Students', value: '142' },
                    { label: 'Active Classes', value: '4' },
                    { label: 'Pending Grades', value: '28' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default FacultyHome;
