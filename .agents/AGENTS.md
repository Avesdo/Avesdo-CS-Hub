# V2 Redesign Directory Constraint
When working on the UI/UX redesign (V2), you MUST target all file edits, reads, and terminal commands to the `../Avesdo_CS_Hub_V2` directory. The current directory (`Avesdo_CS_Hub`) is reserved ONLY for live v1 bug fixes. Always double-check your file paths before editing to ensure you are modifying the V2 codebase and not V1.

# Budget and Tech Stack Constraints
1. **$0 Budget Rule**: We are operating on a strict $0 budget. Do not introduce any paid tools, APIs, or services unless there is absolutely no other alternative and you have received explicit user approval.
2. **Google Ecosystem**: Prefer Google ecosystem tools (Firebase, Google Cloud, Apps Script) whenever backend or cloud services are needed, maximizing the free tiers.
3. **Enterprise UI Standard**: Utilize modern, free, open-source libraries like `shadcn/ui`, `Tailwind CSS`, and `Framer Motion` to achieve a premium, "Linear-like" SaaS aesthetic.

# Typography Constraint
Do not use ALL CAPS (uppercase CSS classes or raw capital strings) in the UI. We prefer standard capitalization or lowercase for a more premium, softer SaaS look.
