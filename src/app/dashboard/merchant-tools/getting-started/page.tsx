import { Wrench, Book, Code2, Palette, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { PackageManagerTabs } from "@/components/docs/PackageManagerTabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function GettingStartedPage() {
  const quickStartCode = `import { MneeCheckout } from '@mnee/checkout';

function App() {
  return (
    <MneeCheckout
      checkoutType="paywall"
      payment={{
        amount: 5,
        mneeDepositAddress: '1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC',
      }}
      paywallConfig={{
        title: 'Unlock Premium Content',
        description: 'Get lifetime access to this article',
      }}
      onSuccess={(result) => {
        console.log('Payment successful!', result);
      }}
    />
  );
}`;

  return (
    <div className="flex flex-col gap-2.5 h-full pl-0 pr-2 py-2">
      <Breadcrumb
        items={[
          {
            label: "Merchant tools",
            icon: Wrench,
          },
          {
            label: "Getting started",
          },
        ]}
      />

      <div className="flex-1 flex flex-col gap-6 px-0 py-6 overflow-y-auto">
        <div className="flex flex-col gap-4 px-6">
            {/* Hero Section */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground">
                Getting Started
              </h1>
              <p className="text-base text-muted-foreground">
                Add professional crypto payments to your React application in minutes.
              </p>
            </div>

            {/* Installation Section */}
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Installation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Install the package using your favorite package manager:
                </p>
              </div>

              <PackageManagerTabs packageName="@mnee/checkout" />
            </div>

            {/* Peer Dependencies Section */}
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Peer Dependencies
                </h2>
                <p className="text-sm text-muted-foreground">
                  Make sure you have React 18 or higher installed:
                </p>
              </div>

              <CodeBlock
                code="npm install react@^18.2.0 react-dom@^18.2.0"
                language="bash"
              />
            </div>

            {/* Import Styles Section */}
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Import Styles
                </h2>
                <p className="text-sm text-muted-foreground">
                  Import the CSS in your app&apos;s entry point (e.g.,{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    main.tsx
                  </code>{" "}
                  or{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    App.tsx
                  </code>
                  ):
                </p>
              </div>

              <CodeBlock
                code="import '@mnee/checkout/styles.css';"
                language="typescript"
              />
            </div>

            {/* Quick Start Section */}
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Quick Start
                </h2>
                <p className="text-sm text-muted-foreground">
                  Here&apos;s a minimal example to get you started with a paywall:
                </p>
              </div>

              <CodeBlock
                code={quickStartCode}
                language="tsx"
                showLineNumbers
              />
            </div>

            {/* Next Steps Section */}
            <div className="flex flex-col gap-4 mt-6 mb-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Next Steps
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/merchant-tools/modules">
                  <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Grid3x3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Modules</CardTitle>
                          <CardDescription className="text-sm">
                            Create and manage your payment modules
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/merchant-tools/api-documentation">
                  <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Book className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            API Documentation
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Explore the complete API reference
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/merchant-tools/examples">
                  <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Code2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Examples</CardTitle>
                          <CardDescription className="text-sm">
                            See real-world integration examples
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/merchant-tools/styles-and-theming">
                  <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Palette className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            Styles & Theming
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Customize the appearance to match your brand
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
