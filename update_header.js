const fs = require('fs');
const file = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/ClientPortal.tsx';
let content = fs.readFileSync(file, 'utf8');

const teamworkButton = 
  {project.teamworkLink && (
    <a 
      href={project.teamworkLink} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 hover:text-primary px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5"
    >
      <ExternalLink className="w-4 h-4" />
      Teamwork
    </a>
  )}
;

const progressBanner = 
        <div className="max-w-5xl mx-auto px-6 relative z-10 pb-16 pt-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009bc2] to-[#00bdd9]">{project.name}</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                Manage your project onboarding requirements and track certification progress securely in one place.
              </p>
            </div>
            
            {/* Progress Tracker */}
            {assignedForms.length > 0 && (
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-600">Onboarding Progress</span>
                  <span className="text-sm font-bold text-slate-900">{completedCount} of {assignedForms.length} Tasks</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#009bc2] to-[#00bdd9]"
                    initial={{ width: 0 }}
                    animate={{ width: progressPercentage + '%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-2 text-right">
                  <span className="text-xs font-bold text-[#00bdd9]">{progressPercentage}% Complete</span>
                </div>
              </div>
            )}
          </div>
        </div>
;

const newHeader = 
        {/* Header Bar */}
        <div className="relative z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                alt="Avesdo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/d/1HgOfOymPbhh2hjSxeqiZmbe20o6uDlVk"
              />
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold border border-slate-200 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Client Portal
              </div>
            </div>
             + teamworkButton + 
          </div>
        </div>
;

content = content.replace(
  /\{\/\* Header Bar \*\/\}[\s\S]*?(?=<div className="grid grid-cols-1 md:grid-cols-2)/,
  newHeader + 
        
        {/* Subtle Brand Gradients */}
        <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute -top-[100%] -left-[10%] w-[50%] h-[200%] bg-gradient-to-r from-[#00bdd9]/20 to-transparent transform rotate-12 blur-3xl"></div>
          <div className="absolute top-[20%] right-[0%] w-[30%] h-[100%] bg-gradient-to-l from-blue-500/10 to-transparent transform -rotate-12 blur-3xl"></div>
        </div>

 + progressBanner + 
      </div>
      
      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-20 pb-24">\n
);

fs.writeFileSync(file, content);
console.log('Dashboard Header updated');
