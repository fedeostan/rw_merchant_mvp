"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  CreditCard,
  Wrench,
  LogOut,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import logoImage from "@/assets/mnee-pay-logo.png";

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
];

const merchantToolsSubItems = [
  {
    name: "Getting started",
    href: "/dashboard/merchant-tools/getting-started",
  },
  {
    name: "API documentation",
    href: "/dashboard/merchant-tools/api-documentation",
  },
  {
    name: "Modules",
    href: "/dashboard/merchant-tools/modules",
  },
  {
    name: "Examples",
    href: "/dashboard/merchant-tools/examples",
  },
  {
    name: "Styles & theming",
    href: "/dashboard/merchant-tools/styles-and-theming",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMerchantToolsExpanded, setIsMerchantToolsExpanded] = useState(false);

  // Check if we're on any merchant tools page
  const isMerchantToolsActive = pathname.startsWith("/dashboard/merchant-tools");

  return (
    <div className="fixed left-0 top-0 h-screen w-[277px] bg-sidebar flex flex-col">
      {/* Header with Logo */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between w-full">
          <div className="h-[57px] w-[134px] relative">
            <Image
              src={logoImage}
              alt="MNEE PAY"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <Badge
            variant="secondary"
            className="h-6 px-2.5 py-1 bg-amber-50 text-muted-foreground border-0 rounded-lg hover:bg-amber-50"
          >
            Beta
          </Badge>
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
                </Link>
              );
            })}

            {/* Merchant Tools - Expandable Section */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsMerchantToolsExpanded(!isMerchantToolsExpanded)}
                className={cn(
                  "flex items-center gap-2 h-8 px-2 rounded-md transition-colors",
                  isMerchantToolsActive
                    ? "bg-card border border-border"
                    : "hover:bg-card/50"
                )}
              >
                <Wrench className="w-4 h-4 text-foreground" />
                <span className="text-sm font-normal text-foreground">
                  Merchant tools
                </span>
                <div className="flex-1 flex justify-end">
                  {isMerchantToolsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-foreground transition-transform" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-foreground transition-transform" />
                  )}
                </div>
              </button>

              {/* Sub-navigation - Expandable */}
              {isMerchantToolsExpanded && (
                <div className="flex px-3.5">
                  <div className="flex-1 flex flex-col gap-2 border-l border-sidebar-border pl-2.5 py-0.5">
                    {merchantToolsSubItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-2 h-7 px-2 rounded-md transition-colors",
                            isSubActive
                              ? "bg-card border border-border"
                              : "hover:bg-card/50"
                          )}
                        >
                          <span className="text-sm font-normal text-foreground">
                            {subItem.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
