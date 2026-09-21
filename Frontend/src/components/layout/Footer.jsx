import { Github, Linkedin, Mail, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#e5bebe] bg-[#fffdf5] text-[#4a4a4a] px-6 py-4 mt-auto">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#4a4a4a]">
          <span className="font-bold text-[#1e1e1e]">TSP Algorithm Analyzer</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 text-[#4a4a4a] font-medium">
            <GraduationCap className="h-3.5 w-3.5 text-[#8ea66b]" /> DAA / Complex Computing Problem · CS-301
          </span>
          <span>·</span>
          <span className="text-[#66615a] font-medium">Muhammad Ahmed (Iqra University)</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://github.com/Muhammad-Ahmed-71037"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#4a4a4a] hover:text-[#1e1e1e] font-semibold transition-colors"
          >
            <Github className="h-3.5 w-3.5 text-[#252525]" />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/muhammad-ahmed-201ba1344/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#4a4a4a] hover:text-[#1e1e1e] font-semibold transition-colors"
          >
            <Linkedin className="h-3.5 w-3.5 text-[#8ea66b]" />
            <span>LinkedIn</span>
          </a>
          <a
            href="mailto:ahmed319144@gmail.com"
            className="flex items-center gap-1.5 text-[#4a4a4a] hover:text-[#1e1e1e] font-semibold transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-[#d8a2a2]" />
            <span>ahmed319144@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
