import "./app-layout.css";
import { useEffect, useState } from "react";
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
import { useTheme } from "@/lib/theme";

const NAV = [
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

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "Match system", icon: MonitorIcon },
];

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
    >
      {({ isActive }) => (
        <>
          <Icon weight={isActive ? "fill" : "regular"} />
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="user-button">
        <Avatar name={user?.name} image={user?.image} small />
        <span className="user-text">
          <span className="user-name">{user?.name}</span>
          <span className="user-email">{user?.email}</span>
        </span>
        <CaretUpDownIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" style={{ width: 208 }}>
        <DropdownMenuItem icon={<GearSixIcon />} onSelect={() => navigate("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            icon={<theme.icon />}
            shortcut={preference === theme.value ? "✓" : undefined}
            onSelect={(event) => {
              event.preventDefault();
              setPreference(theme.value);
            }}
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

function SidebarBody({ onOpenSearch, onNavigate }) {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <Link to="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <div className="sidebar-section">
        <button onClick={onOpenSearch} className="sidebar-search">
          <MagnifyingGlassIcon />
          <span className="sidebar-search-label">Search</span>
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Main">
        {NAV.map((group, i) => (
          <div key={i} className="sidebar-group">
            {group.label ? <div className="sidebar-group-label">{group.label}</div> : null}
            {group.items.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
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
    function onKeyDown(event) {
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
    <div>
      <aside className="shell-sidebar">
        <SidebarBody onOpenSearch={() => setSearchOpen(true)} />
      </aside>

      <header className="shell-mobilebar">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <div className="mobilebar-actions">
          <button onClick={() => setSearchOpen(true)} className="icon-button" aria-label="Search">
            <MagnifyingGlassIcon />
          </button>
          <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogPrimitive.Trigger className="icon-button" aria-label="Open menu">
              <ListIcon />
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="overlay" />
              <DialogPrimitive.Content className="drawer">
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

      <main className="shell-main">
        <Outlet />
      </main>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
