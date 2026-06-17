import fs from 'fs';
const content = fs.readFileSync('src/pages/ProjectTracker.tsx', 'utf-8');

let newContent = content.replace(
  'import { useLocation } from \'react-router-dom\';',
  'import { useLocation } from \'react-router-dom\';\nimport { useUrlState } from \'../hooks/useUrlState\';'
);

const arrayOptions = \{ serialize: (v: string[]) => JSON.stringify(v), deserialize: (v: string) => { try { return JSON.parse(v); } catch(e) { return []; } } }\;
const dateOptions = \{ serialize: (v: any) => v === 'no-date' ? 'no-date' : JSON.stringify(v), deserialize: (v: string) => v === 'no-date' ? 'no-date' : JSON.parse(v) }\;

newContent = newContent.replace(
  /const \\\[activeTab, setActiveTab\\\] = useState<string>\\([\\s\\S]*?\\);/,
  \const [activeTab, setActiveTab] = useUrlState<string>('tab', location.state?.ptTab || 'Actively Onboarding');\
);

newContent = newContent.replace(
  /const \\\[searchTerm, setSearchTerm\\\] = useState\\(''\\);/,
  \const [searchTerm, setSearchTerm] = useUrlState<string>('search', '');\
);

newContent = newContent.replace(
  /const \\\[sortCol, setSortCol\\\] = useState\\(\\(\\) => \\{[\\s\\S]*?\\}\\);/,
  \const [sortCol, setSortCol] = useUrlState<string>('sortCol', (() => {
    if (location.state?.ptTab === 'No Due Date' || location.state?.ptTab === 'Suspended') return 'name';
    return 'releaseDateVal';
  })());\
);

newContent = newContent.replace(
  /const \\\[sortAsc, setSortAsc\\\] = useState\\(\\(\\) => \\{[\\s\\S]*?\\}\\);/,
  \const [sortAsc, setSortAsc] = useUrlState<boolean>('sortAsc', (() => {
    if (location.state?.ptTab === 'All Released' || location.state?.ptTab === 'All Projects') return false;
    return true;
  })(), { serialize: (v) => v ? 'true' : 'false', deserialize: (v) => v === 'true' });\
);

newContent = newContent.replace(
  /const \\\[statusFilter, setStatusFilter\\\] = useState<string\\\[\\\]>\\([\\s\\S]*?\\);/,
  \const [statusFilter, setStatusFilter] = useUrlState<string[]>('status', location.state?.kpiFilter === 'units' ? ['Active', 'Suspended'] : location.state?.kpiFilter === 'onboarding' ? ['Onboarding'] : [], \);\
);

const simpleArrays = ['healthFilter', 'nameFilter', 'clientFilter', 'managerFilter', 'timelineFilter', 'phaseFilter', 'featuresFilter'];
for (const arr of simpleArrays) {
  const shortKey = arr.replace('Filter', '');
  newContent = newContent.replace(
    new RegExp(\const \\\\\\\[\, set\\\\\\\\] = useState<string\\\\\\\[\\\\\\\]>\\\\(\\\\[\\\\]\\\\);\),
    \const [\, set\] = useUrlState<string[]>('\', [], \);\
  );
}

newContent = newContent.replace(
  /const \\\[releaseDateFilter, setReleaseDateFilter\\\] = useState<[\\s\\S]*?>\\(null\\);/,
  \const [releaseDateFilter, setReleaseDateFilter] = useUrlState<{ start: string; end: string } | 'no-date' | null>('releaseDate', null, \);\
);

fs.writeFileSync('src/pages/ProjectTracker.tsx', newContent);
console.log('done');
