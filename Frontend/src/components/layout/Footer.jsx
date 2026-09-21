import { Github, Linkedin, Mail, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#e2e8f0] bg-white text-[#637083] px-6 py-4 mt-auto">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#475569]">
          <span className="font-semibold text-[#0f172a]">TSP Algorithm Analyzer</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 text-[#64748b]">
            <GraduationCap className="h-3.5 w-3.5 text-[#2563eb]" /> DAA / Complex Computing Problem · CS-301
          </span>
          <span>·</span>
          <span className="text-[#64748b]">Muhammad Ahmed (Iqra University)</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://github.com/Muhammad-Ahmed-71037"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#475569] hover:text-[#0f172a] transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/muhammad-ahmed-201ba1344/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#475569] hover:text-[#0a66c2] transition-colors"
          >
            <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />
            <span>LinkedIn</span>
          </a>
          <a
            href="mailto:ahmed319144@gmail.com"
            className="flex items-center gap-1.5 text-[#475569] hover:text-[#d97706] transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-[#d97706]" />
            <span>ahmed319144@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
