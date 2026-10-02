import type { ComponentType, ReactNode } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router";
import {
  FilePlusIcon,
  FileTextIcon,
  FilesIcon,
  GearSixIcon,
  LayoutIcon,
  BookOpenTextIcon,
  MagnifyingGlassIcon,
  MonitorIcon,
  MoonIcon,
  SquaresFourIcon,
  SunIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { useResumes } from "@/features/resume/api";
import { useNewResume } from "@/features/resume/use-new-resume";
import { useTheme } from "@/lib/theme";
import { timeAgo } from "@/lib/utils";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Item({
  icon: Icon,
  children,
  hint,
  onSelect,
  value,
}: {
  icon: ComponentType<IconProps>;
  children: ReactNode;
  hint?: string;
  onSelect: () => void;
  value?: string;
}) {
  return (
    <Command.Item value={value} onSelect={onSelect} className="cmdk-item">
      <Icon className="size-4 shrink-0 text-ink-3" />
      <span className="flex-1 truncate">{children}</span>
      {hint ? <span className="shrink-0 text-[12px] text-ink-4">{hint}</span> : null}
    </Command.Item>
  );
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate();
  const { data: resumes } = useResumes();
  const { start } = useNewResume();
  const { setPreference } = useTheme();

  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search and commands"
      overlayClassName="fixed inset-0 z-50 bg-[#0b0e14]/40 backdrop-blur-[2px]"
      contentClassName="fixed top-[14vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface shadow-pop animate-pop-in"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4">
        <MagnifyingGlassIcon className="size-[18px] text-ink-3" />
        <Command.Input
          placeholder="Search resumes or jump to…"
          className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
        />
      </div>
      <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-1.5 scrollbar-thin">
        <Command.Empty className="px-3 py-8 text-center text-[13px] text-ink-3">Nothing matches that.</Command.Empty>

        <Command.Group heading="Create" className="cmdk-group">
          <Item icon={FilePlusIcon} onSelect={() => run(() => void start({ starter: "blank" }))}>
            New blank resume
          </Item>
          <Item icon={BookOpenTextIcon} onSelect={() => run(() => void start({ starter: "example" }))}>
            New resume from an example
          </Item>
        </Command.Group>

        {resumes && resumes.length > 0 ? (
          <Command.Group heading="Resumes" className="cmdk-group">
            {resumes.slice(0, 8).map((resume) => (
              <Item
                key={resume.id}
                value={`resume ${resume.title} ${resume.id}`}
                icon={FileTextIcon}
                hint={timeAgo(resume.updatedAt)}
                onSelect={() => run(() => navigate(`/resumes/${resume.id}/edit`))}
              >
                {resume.title}
              </Item>
            ))}
          </Command.Group>
        ) : null}

        <Command.Group heading="Go to" className="cmdk-group">
          <Item icon={SquaresFourIcon} onSelect={() => run(() => navigate("/dashboard"))}>
            Dashboard
          </Item>
          <Item icon={FilesIcon} onSelect={() => run(() => navigate("/resumes"))}>
            All resumes
          </Item>
          <Item icon={LayoutIcon} onSelect={() => run(() => navigate("/templates"))}>
            Templates
          </Item>
          <Item icon={GearSixIcon} onSelect={() => run(() => navigate("/settings"))}>
            Settings
          </Item>
        </Command.Group>

        <Command.Group heading="Theme" className="cmdk-group">
          <Item icon={SunIcon} onSelect={() => run(() => setPreference("light"))}>
            Light theme
          </Item>
          <Item icon={MoonIcon} onSelect={() => run(() => setPreference("dark"))}>
            Dark theme
          </Item>
          <Item icon={MonitorIcon} onSelect={() => run(() => setPreference("system"))}>
            Match system theme
          </Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
