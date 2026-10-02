import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CopySimpleIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  PencilSimpleLineIcon,
  TextAaIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { downloadResumePdf, useDeleteResume, useDuplicateResume, useUpdateResume } from "./api";

export function RenameDialog({ resume, open, onOpenChange }) {
  const [title, setTitle] = useState(resume.title);
  const update = useUpdateResume();

  async function onSubmit(event) {
    event.preventDefault();
    const next = title.trim();
    if (!next) return;
    try {
      await update.mutateAsync({ id: resume.id, patch: { title: next } });
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Rename resume" description="Only you see this name. It isn't printed on the resume.">
        <form onSubmit={onSubmit}>
          <DialogBody>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              autoFocus
              aria-label="Resume name"
            />
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={update.isPending} disabled={!title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({ resume, open, onOpenChange, onDeleted }) {
  const remove = useDeleteResume();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={`Delete “${resume.title}”?`}
        description="This removes the resume and its content for good. Downloaded PDFs aren't affected."
      >
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={async () => {
              try {
                await remove.mutateAsync(resume.id);
                onOpenChange(false);
                onDeleted?.();
                toast.success("Resume deleted");
              } catch (error) {
                toast.error(errorMessage(error));
              }
            }}
          >
            Delete resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** "…" menu used on resume cards and rows. */
export function ResumeMenu({ resume, trigger }) {
  const navigate = useNavigate();
  const duplicate = useDuplicateResume();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${resume.title}`}>
              <DotsThreeIcon weight="bold" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem icon={<PencilSimpleLineIcon />} onSelect={() => navigate(`/resumes/${resume.id}/edit`)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<DownloadSimpleIcon />}
            onSelect={() => {
              const done = downloadResumePdf(resume.id);
              toast.promise(done, {
                loading: "Preparing your PDF…",
                success: "PDF downloaded",
                error: (e) => errorMessage(e),
              });
            }}
          >
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem icon={<TextAaIcon />} onSelect={() => setRenaming(true)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<CopySimpleIcon />}
            onSelect={async () => {
              try {
                await duplicate.mutateAsync(resume.id);
                toast.success("Copy created");
              } catch (error) {
                toast.error(errorMessage(error));
              }
            }}
          >
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={<TrashIcon />} tone="danger" onSelect={() => setDeleting(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {renaming ? <RenameDialog resume={resume} open={renaming} onOpenChange={setRenaming} /> : null}
      <DeleteDialog resume={resume} open={deleting} onOpenChange={setDeleting} />
    </>
  );
}
