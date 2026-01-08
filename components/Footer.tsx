import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-900 py-12 px-6">
      <div className="container mx-auto grid md:grid-cols-4 gap-8 text-sm">
        
        {/* Brand Column */}
        <div className="col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-haldi-900/20 flex items-center justify-center border border-haldi-500/20">
               <Sparkles className="w-4 h-4 text-haldi-500" />
            </div>
            <span className="font-serif text-xl text-stone-100 tracking-wide">PRAVARA</span>
          </div>
          <p className="text-stone-500 leading-relaxed">
            Tradition meets Intelligence. The modern matchmaker for families who value heritage.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Company</h4>
          <ul className="space-y-2 text-stone-500">
            <li className="hover:text-haldi-500 cursor-pointer transition-colors">About Sutradhar</li>
            <li className="hover:text-haldi-500 cursor-pointer transition-colors">Our Values</li>
            <li className="hover:text-haldi-500 cursor-pointer transition-colors">Contact Us</li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Legal</h4>
          <ul className="space-y-2 text-stone-500">
            <li className="hover:text-haldi-500 cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-haldi-500 cursor-pointer transition-colors">Terms of Service</li>
            <li className="hover:text-haldi-500 cursor-pointer transition-colors">Trust & Safety</li>
          </ul>
        </div>

        {/* Social / Copy */}
        <div className="space-y-3">
           <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Connect</h4>
           <p className="text-stone-600">Made with ❤️ for the Community.</p>
           <p className="text-stone-700 text-xs mt-4">© 2024 Pravara Inc.</p>
        </div>

      </div>
    </footer>
  );
}
