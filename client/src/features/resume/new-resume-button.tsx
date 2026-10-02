import { BookOpenTextIcon, CaretDownIcon, FilePlusIcon, PlusIcon } from "@phosphor-icons/react";
import type { TemplateId } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNewResume } from "./use-new-resume";

export function NewResumeButton({ template }: { template?: TemplateId }) {
  const { start, pending } = useNewResume();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="primary" loading={pending}>
          <PlusIcon /> New resume <CaretDownIcon className="-mr-1 size-3.5! opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]">
        <DropdownMenuItem icon={<FilePlusIcon />} onSelect={() => start({ starter: "blank", template })}>
          Blank resume
        </DropdownMenuItem>
        <DropdownMenuItem icon={<BookOpenTextIcon />} onSelect={() => start({ starter: "example", template })}>
          Start from an example
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
