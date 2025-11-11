import React from "react";
import Image from "next/image";
import { Wallet, Zap, TrendingUp, Plug2 } from "lucide-react";
import logo from "@/assets/mnee-pay-logo.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const features = [
    {
      icon: Wallet,
      title: "Accept any stablecoin",
      description:
        "Your customers pay with what they have, you receive one unified asset: MNEE",
    },
    {
      icon: Zap,
      title: "Instant, low fee-settlement",
      description:
        "Get paid in seconds for a 1%, avoiding 3+% credit card fees",
    },
    {
      icon: TrendingUp,
      title: "Earn while you hold",
      description:
        "Coming soon: MNEE balances generate yield automatically, turning idel funds into income.",
    },
    {
      icon: Plug2,
      title: "Plug and play integration",
      description:
        "Drop in a customized module button and start accepting crypto in minutes - no code, no new rails.",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 p-12 flex-col overflow-auto justify-center">
        <div className="flex flex-col gap-16 max-w-2xl">
          <div>
            <Image
              src={logo}
              alt="MNEE PAY"
              width={120}
              height={32}
              className="object-contain"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">
              Accept every stablecoin.
              <br />
              Manage it once.
            </h1>
            <p className="text-slate-600 mb-8">
              MNEE Pay merchant unifies crypto payments, slashes fees, and turns
              your balance into an earning asset.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
                >
                  <feature.icon className="w-6 h-6 mb-3 text-slate-900" />
                  <h3 className="font-semibold mb-2 text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
