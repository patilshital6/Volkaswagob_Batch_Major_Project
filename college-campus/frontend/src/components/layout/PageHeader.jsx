/**
 * Reusable PageHeader component to maintain consistency across the portal.
 * Use this at the top of every new page in src/pages/.
 */
const PageHeader = ({ title, subtitle }) => {
    return (
        <div className="border-b border-slate-200 pb-6 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
    );
};

export default PageHeader;
