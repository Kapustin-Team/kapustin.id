interface ProjectCardProps {
  project: {
    name: string;
    url: string;
    icon: string;
    description: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all duration-[var(--transition-fast)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] text-[20px]">
          {project.icon}
        </span>
        <span className="text-[14px] font-semibold tracking-[-0.3px] text-[var(--fg)] group-hover:text-[var(--fg)]">
          {project.name}
        </span>
      </div>
      <p className="text-[13px] tracking-[-0.25px] text-[var(--fg-secondary)] leading-[1.5]">
        {project.description}
      </p>
    </a>
  );
}
