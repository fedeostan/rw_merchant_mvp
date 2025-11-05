"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, CreditCard, Wrench, LogOut, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Wallet",
    href: "/dashboard",
    icon: Wallet,
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    name: "Merchant Tools",
    href: "/dashboard/merchant-tools",
    icon: Wrench,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-screen w-[277px] bg-sidebar flex flex-col">
      {/* Header with Logo */}
      <div className="flex flex-col gap-2 p-4">
        <div className="h-[57px] w-[223px] flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-lg">M</span>
            </div>
            <span className="text-xl font-semibold text-foreground">MNEE PAY</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex flex-col px-4 py-2">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 h-8 px-2 rounded-md transition-colors",
                    isActive
                      ? "bg-card border border-border"
                      : "hover:bg-card/50"
                  )}
                >
                  <Icon className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-normal text-foreground">
                    {item.name}
                  </span>
                  {item.name === "Merchant Tools" && (
                    <div className="flex-1 flex justify-end">
                      <ChevronUp className="w-4 h-4 text-foreground" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Log out button at bottom */}
        <div className="flex-1 flex flex-col justify-end px-4 py-2">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-card/50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-foreground" />
            <span className="text-sm font-normal text-foreground">Log out</span>
          </button>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="flex flex-col gap-2.5 px-4 py-2">
        <div className="flex items-center gap-2 p-2">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="flex-1 flex flex-col">
            <p className="text-sm font-semibold text-foreground">
              {user?.email?.split("@")[0] || "Sarah Huxley"}
            </p>
            <p className="text-xs font-normal text-foreground">
              {user?.email || "m@example.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
