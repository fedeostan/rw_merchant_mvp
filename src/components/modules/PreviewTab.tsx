"use client";

import type { Module } from "@/lib/api/generated/schemas/module";
import type { ModuleConfiguration } from "@/lib/schemas/module";
import { Card } from "@/components/ui/card";

interface PreviewTabProps {
  module: Module;
  configuration: ModuleConfiguration;
}

export function PreviewTab({ module, configuration }: PreviewTabProps) {
  const { kind } = module;

  return (
    <div className="flex flex-col gap-6">
      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          This is a visual preview of how your module will appear to customers.
          The actual component will be interactive when embedded on your website.
        </p>
      </div>

      {/* Preview Container */}
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border border-border min-h-[400px]">
        <Card className="w-full max-w-md p-6 flex flex-col gap-4">
          {/* Paywall Preview */}
          {kind === "paywall" && configuration.paywall && (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {configuration.paywall.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {configuration.paywall.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 py-4 border-y border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-semibold text-foreground">
                    ${configuration.amount} USD
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Deposit Address
                  </span>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate">
                    {configuration.mneeDepositAddress}
                  </code>
                </div>
              </div>

              {configuration.collectEmail && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              )}

              <button
                disabled
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {configuration.paywall.buttonText || "Unlock Content"}
              </button>
            </>
          )}

          {/* E-commerce Preview */}
          {kind === "e-commerce" && configuration.ecommerce && (
            <>
              {configuration.ecommerce.productImage && (
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    Product Image
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {configuration.ecommerce.productName}
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  ${configuration.amount}
                </p>
              </div>

              {configuration.ecommerce.showQuantitySelector && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-foreground">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="w-8 h-8 border border-border rounded-md disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      1
                    </span>
                    <button
                      disabled
                      className="w-8 h-8 border border-border rounded-md disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {configuration.collectEmail && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              )}

              {configuration.ecommerce.collectShipping && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-foreground">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main St, City, State, ZIP"
                    disabled
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              )}

              <button
                disabled
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Purchase with Crypto
              </button>
            </>
          )}

          {/* Donation Preview */}
          {kind === "donation" && configuration.donation && (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {configuration.donation.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {configuration.donation.description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm text-foreground">
                  Select an amount
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {configuration.donation.suggestedAmounts.map(
                    (amount, index) => (
                      <button
                        key={index}
                        disabled
                        className={`px-4 py-2 text-sm font-medium border border-border rounded-md transition-colors disabled:opacity-50 ${
                          index === 0
                            ? "bg-primary text-white"
                            : "bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        ${amount.toFixed(2)}
                      </button>
                    )
                  )}
                </div>
                {configuration.donation.allowCustomAmount && (
                  <input
                    type="text"
                    placeholder="Custom amount"
                    disabled
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                  />
                )}
              </div>

              {configuration.collectEmail && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              )}

              <button
                disabled
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Donate
              </button>
            </>
          )}

          {/* Confetti indicator */}
          {configuration.showConfetti && (
            <p className="text-xs text-center text-muted-foreground">
              🎉 Confetti will appear on successful payment
            </p>
          )}
        </Card>
      </div>

      {/* Preview Notes */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Preview Notes
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>This preview shows the visual layout only</li>
          <li>Actual form fields will be fully functional when embedded</li>
          <li>
            The module automatically handles payment validation and confirmation
          </li>
          <li>Update the configuration tab to see changes reflected here</li>
        </ul>
      </div>
    </div>
  );
}
