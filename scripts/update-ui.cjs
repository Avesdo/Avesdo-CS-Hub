const fs = require('fs');

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/ClientHealth.tsx',
  'src/pages/ProjectTracker.tsx',
  'src/pages/ServiceHub.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add framer-motion imports if missing
  if (!content.includes('framer-motion')) {
    content = content.replace('import React', 'import React from \\\'react\\\';\\nimport { motion, AnimatePresence } from \\\'framer-motion\\\';\\n//');
    changed = true;
  }

  // Dashboard metric cards glassmorphism
  if (file.includes('Dashboard')) {
    content = content.replace(/className=\"cursor-pointer flex flex-col rounded-xl border border-border bg-white/g, 
      'className=\"cursor-pointer flex flex-col rounded-xl border border-white/50 bg-white/70 backdrop-blur-xl');
    
    // Add staggered animations
    if (!content.includes('containerVariants')) {
      const variants = \`
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};
\`;
      content = content.replace('export default function Dashboard() {', variants + '\\nexport default function Dashboard() {');
    }

    content = content.replace(/<div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 px-4 md:px-6 pt-4\">/g, 
      '<motion.div variants={containerVariants} initial=\"hidden\" animate=\"visible\" className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 px-4 md:px-6 pt-4\">');
    
    content = content.replace(/<div\\n              onClick=\{\\(\\) => navigate\\('\\/clients'/g, 
      '<motion.div variants={itemVariants}\\n              onClick={() => navigate(\\'/clients\\'');
      
    content = content.replace(/<div\\n              onClick=\{\\(\\) =>\\n                navigate\\('\\/projects'/g, 
      '<motion.div variants={itemVariants}\\n              onClick={() =>\\n                navigate(\\'/projects\\'');
      
    content = content.replace(/<div\\n              onClick=\{\\(\\) => navigate\\('\\/projects', \{ state: \{ ptTab: 'Actively Onboarding' \} \}\\)\\}/g, 
      '<motion.div variants={itemVariants}\\n              onClick={() => navigate(\\'/projects\\', { state: { ptTab: \\'Actively Onboarding\\' } })}');
      
    content = content.replace(/<div\\n              onClick=\{\\(\\) => \{\\n                const d = new Date\\(\\);/g, 
      '<motion.div variants={itemVariants}\\n              onClick={() => {\\n                const d = new Date();');
      
    content = content.replace(/<\\/TrendIndicator>\\n            <\\/div>/g, '</TrendIndicator>\\n            </motion.div>');
    content = content.replace(/see index\\n                  <\\/div>\\n                <\\/div>\\n              \\)}/g, 'see index\\n                  </div>\\n                </div>\\n              )}\\n            </motion.div>');
    content = content.replace(/neutral=\{true\} \\/>\\n            <\\/div>/g, 'neutral={true} />\\n            </motion.div>');

    changed = true;
  }

  // ClientHealth.tsx stagger
  if (file.includes('ClientHealth')) {
    if (!content.includes('containerVariants')) {
      const variants = \`
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};
\`;
      content = content.replace('export default function ClientHealth() {', variants + '\\nexport default function ClientHealth() {');
    }
    
    content = content.replace(/<tbody className=\"divide-y divide-border\">/g, '<motion.tbody variants={containerVariants} initial=\"hidden\" animate=\"visible\" className=\"divide-y divide-border\">');
    content = content.replace(/<tr\\n                        key=\{client.id\}/g, '<motion.tr variants={itemVariants} key={client.id}');
    content = content.replace(/<\\/tr>\\n                    \\)\\)}/g, '</motion.tr>\\n                    ))}');
    changed = true;
  }

  // ProjectTracker.tsx stagger
  if (file.includes('ProjectTracker')) {
    if (!content.includes('containerVariants')) {
      const variants = \`
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};
\`;
      content = content.replace('export default function ProjectTracker() {', variants + '\\nexport default function ProjectTracker() {');
    }
    content = content.replace(/<tbody className=\"divide-y divide-border\">/g, '<motion.tbody variants={containerVariants} initial=\"hidden\" animate=\"visible\" className=\"divide-y divide-border\">');
    content = content.replace(/<tr\\n                        key=\{project.id\}/g, '<motion.tr variants={itemVariants} key={project.id}');
    content = content.replace(/<\\/tr>\\n                    \\)\\)}/g, '</motion.tr>\\n                    ))}');
    changed = true;
  }

  // ServiceHub.tsx stagger
  if (file.includes('ServiceHub')) {
    if (!content.includes('containerVariants')) {
      const variants = \`
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};
\`;
      content = content.replace('export default function ServiceHub() {', variants + '\\nexport default function ServiceHub() {');
    }
    content = content.replace(/<tbody className=\"divide-y divide-border\">/g, '<motion.tbody variants={containerVariants} initial=\"hidden\" animate=\"visible\" className=\"divide-y divide-border\">');
    content = content.replace(/<tr\\n                        key=\{service.id\}/g, '<motion.tr variants={itemVariants} key={service.id}');
    content = content.replace(/<\\/tr>\\n                    \\)\\)}/g, '</motion.tr>\\n                    ))}');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
