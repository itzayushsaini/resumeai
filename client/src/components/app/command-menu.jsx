import { Command } from "cmdk";
import { useNavigate } from "react-router";
import {
  BookOpenTextIcon,
  FilePlusIcon,
  FileTextIcon,
  FilesIcon,
  GearSixIcon,
  LayoutIcon,
  MagnifyingGlassIcon,
  MonitorIcon,
  MoonIcon,
  SquaresFourIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { useResumes } from "@/features/resume/api";
import { useNewResume } from "@/features/resume/use-new-resume";
import { useTheme } from "@/lib/theme";
import { timeAgo } from "@/lib/utils";

function Item({ icon: Icon, children, hint, onSelect, value }) {
  return (
    <Command.Item value={value} onSelect={onSelect} className="cmdk-item">
      <Icon />
      <span className="cmdk-item-label">{children}</span>
      {hint ? <span className="cmdk-item-hint">{hint}</span> : null}
    </Command.Item>
  );
}

export function CommandMenu({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { data: resumes } = useResumes();
  const { start } = useNewResume();
  const { setPreference } = useTheme();

  function run(action) {
    onOpenChange(false);
    action();
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search and commands"
      overlayClassName="cmdk-overlay"
      contentClassName="cmdk-dialog"
    >
      <div className="cmdk-search">
        <MagnifyingGlassIcon />
        <Command.Input placeholder="Search resumes or jump to…" className="cmdk-input" />
      </div>
      <Command.List className="cmdk-list scroll-thin">
        <Command.Empty className="cmdk-empty">Nothing matches that.</Command.Empty>

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
