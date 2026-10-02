import { BookOpenTextIcon, CaretDownIcon, FilePlusIcon, PlusIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNewResume } from "./use-new-resume";

export function NewResumeButton({ template }) {
  const { start, pending } = useNewResume();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="primary" loading={pending}>
          <PlusIcon /> New resume <CaretDownIcon style={{ width: 14, height: 14, marginRight: -4, opacity: 0.8 }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{ width: 240 }}>
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
