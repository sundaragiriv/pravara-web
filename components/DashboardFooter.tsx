export default function DashboardFooter() {
    return (
        <footer className="w-full py-8 mt-auto border-t border-stone-900/50">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Brand / Copyright */}
                <div className="text-center md:text-left">
                    <p className="text-xs text-stone-600">
                        &copy; {new Date().getFullYear()} Pravara Matrimony.
                    </p>
                    <p className="text-[10px] text-stone-700 mt-1">
                        Made with ❤️ for Tradition & Technology.
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-6 text-xs text-stone-500 font-medium">
                    <a href="#" className="hover:text-haldi-500 transition-colors">Help Center</a>
                    <a href="#" className="hover:text-haldi-500 transition-colors">Safety Tips</a>
                    <a href="#" className="hover:text-haldi-500 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-haldi-500 transition-colors">Terms</a>
                </div>
            </div>
        </footer>
    );
}
