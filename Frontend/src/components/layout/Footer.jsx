import { Github, Linkedin, Mail, Network, Sparkles, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#263449] bg-[#0F172A] text-[#94a3b8] px-6 py-10 sm:px-10 mt-auto transition-colors">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between pb-8 border-b border-[#263449]/70">
          {/* Project Brand & Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#172033] border border-[#263449] flex items-center justify-center text-[#f97316]">
                <Network className="h-4.5 w-4.5" />
              </div>
              <p className="text-base font-display font-semibold text-[#f8fafc] tracking-tight">
                TSP Algorithm Visualizer
              </p>
            </div>
            <p className="text-xs text-[#94a3b8] max-w-md leading-relaxed">
              Design &amp; Analysis of Algorithms (DAA) Coursework Project. Real-world dataset routing, exact &amp; heuristic algorithmic paradigms, interactive graph visualizations, and AI-assisted route reasoning.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#172033] border border-[#263449] text-[#cbd5e1]">
                <GraduationCap className="h-3.5 w-3.5 text-[#f97316]" /> DAA Coursework · CS-301
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#172033] border border-[#263449] text-[#cbd5e1]">
                <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" /> 50,000+ Real Geographic Nodes
              </span>
            </div>
          </div>

          {/* Developer Credentials & Socials */}
          <div className="md:col-span-6 flex flex-col md:items-end justify-center space-y-3 text-xs text-[#8b95b5]">
            <div className="md:text-right">
              <p className="text-sm font-semibold text-white tracking-wide">
                Muhammad Ahmed
              </p>
              <p className="mt-0.5 text-xs text-[#9aa3c4] flex items-center md:justify-end gap-1.5">
                <span>BS Computer Science</span>
                <span>·</span>
                <span className="text-[#aeb6d4] font-medium">Iqra University</span>
              </p>
            </div>

            {/* Interactive Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/Muhammad-Ahmed-71037"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#172033] border border-[#263449] text-[#cbd5e1] hover:text-[#f8fafc] hover:border-[#f97316]/50 transition-all duration-200 text-xs font-medium shadow-sm"
                aria-label="GitHub Profile"
              >
                <Github size={15} />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/muhammad-ahmed-201ba1344/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#172033] border border-[#263449] text-[#cbd5e1] hover:text-[#f8fafc] hover:border-[#38bdf8]/50 transition-all duration-200 text-xs font-medium shadow-sm"
                aria-label="LinkedIn Profile"
              >
                <Linkedin size={15} className="text-[#38bdf8]" />
                <span>LinkedIn</span>
              </a>

              <a
                href="mailto:ahmed319144@gmail.com"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#172033] border border-[#263449] text-[#cbd5e1] hover:text-[#f8fafc] hover:border-[#f59e0b]/50 transition-all duration-200 text-xs font-medium shadow-sm"
                aria-label="Email Address"
              >
                <Mail size={15} className="text-[#f59e0b]" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[11px] text-[#64748b]">
          <p>
            &copy; 2026 <span className="text-[#cbd5e1] font-medium">Muhammad Ahmed</span> · Iqra University. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#94a3b8]">
            <span className="hover:text-white transition-colors">Dynamic Programming</span>
            <span>·</span>
            <span className="hover:text-white transition-colors">Greedy Heuristic</span>
            <span>·</span>
            <span className="hover:text-white transition-colors">Dijkstra SSSP</span>
            <span>·</span>
            <span className="hover:text-white transition-colors">AI Route Planner</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
