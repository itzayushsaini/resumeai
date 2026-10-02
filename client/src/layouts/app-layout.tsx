import { useEffect, useState, type ComponentType } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  CaretUpDownIcon,
  FilesIcon,
  GearSixIcon,
  LayoutIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MonitorIcon,
  MoonIcon,
  SignOutIcon,
  SquaresFourIcon,
  SunIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/brand/logo";
import { Avatar, Kbd } from "@/components/ui/misc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandMenu } from "@/components/app/command-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface NavItemDef {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
}

const NAV: { label?: string; items: NavItemDef[] }[] = [
  {
    items: [
      { to: "/dashboard", label: "Dashboard", icon: SquaresFourIcon },
      { to: "/resumes", label: "Resumes", icon: FilesIcon },
      { to: "/templates", label: "Templates", icon: LayoutIcon },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Settings", icon: GearSixIcon }],
  },
];

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function NavItem({ item, onNavigate }: { item: NavItemDef; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] font-medium transition-colors",
          isActive ? "bg-rail-3 text-rail-ink" : "text-rail-ink-2 hover:bg-rail-2 hover:text-rail-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon weight={isActive ? "fill" : "regular"} className={cn("size-[17px]", isActive && "text-[#8ba2ff]")} />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

function UserMenu() {
  const { data } = useSession();
  const { preference, setPreference } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = data?.user;

  const themes: { value: ThemePreference; label: string; icon: ComponentType<IconProps> }[] = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "Match system", icon: MonitorIcon },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left outline-none hover:bg-rail-2 focus-visible:ring-2 focus-visible:ring-[#8ba2ff]/50">
        <Avatar name={user?.name} image={user?.image} className="size-7" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-rail-ink">{user?.name}</span>
          <span className="block truncate text-[11.5px] text-rail-ink-2">{user?.email}</span>
        </span>
        <CaretUpDownIcon className="size-3.5 text-rail-ink-2" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-[208px]">
        <DropdownMenuItem icon={<GearSixIcon />} onSelect={() => navigate("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            icon={<theme.icon />}
            onSelect={(event) => {
              event.preventDefault();
              setPreference(theme.value);
            }}
            shortcut={preference === theme.value ? "✓" : undefined}
          >
            {theme.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={<SignOutIcon />}
          onSelect={async () => {
            await signOut();
            queryClient.clear();
            navigate("/sign-in", { replace: true });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarBody({ onOpenSearch, onNavigate }: { onOpenSearch: () => void; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4">
        <Link to="/dashboard" onClick={onNavigate} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#8ba2ff]/50">
          <Logo tone="light" />
        </Link>
      </div>

      <div className="px-3">
        <button
          onClick={onOpenSearch}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-rail-line bg-rail-2 px-2.5 text-[13px] text-rail-ink-2 transition-colors hover:border-rail-3 hover:text-rail-ink"
        >
          <MagnifyingGlassIcon className="size-4" />
          <span className="flex-1 text-left">Search</span>
          <span className="flex gap-0.5">
            <Kbd className="border-rail-line bg-rail-3 text-rail-ink-2 shadow-none">{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd className="border-rail-line bg-rail-3 text-rail-ink-2 shadow-none">K</Kbd>
          </span>
        </button>
      </div>

      <nav className="mt-4 flex flex-col gap-5 px-3" aria-label="Main">
        {NAV.map((group, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            {group.label ? (
              <div className="px-2.5 pb-1 text-[11.5px] font-medium text-rail-ink-2/80">{group.label}</div>
            ) : null}
            {group.items.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-rail-line p-2">
        <UserMenu />
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] border-r border-rail-line bg-rail lg:block">
        <SidebarBody onOpenSearch={() => setSearchOpen(true)} />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="grid size-9 place-items-center rounded-md text-ink-2 hover:bg-ink/5"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="size-5" />
          </button>
          <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogPrimitive.Trigger className="grid size-9 place-items-center rounded-md text-ink-2 hover:bg-ink/5" aria-label="Open menu">
              <ListIcon className="size-5" />
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-fade-in" />
              <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[264px] bg-rail shadow-pop outline-none data-[state=open]:animate-slide-up">
                <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">Main navigation</DialogPrimitive.Description>
                <SidebarBody
                  onOpenSearch={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  onNavigate={() => setMobileOpen(false)}
                />
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </div>
      </header>

      <main className="lg:pl-[232px]">
        <Outlet />
      </main>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
