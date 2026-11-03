// The Homework Companion (being built — see AUTHORING.md).
export interface CompanionProps { dark: boolean; compact: boolean; onCompact: (on: boolean) => void; onOpenDemo: (id: string, input?: string) => void }
export function Companion(_props: CompanionProps) {
  return <div className="home"><header className="home-hero"><h1>Homework Companion</h1><p>Coming in the next build phase.</p></header></div>;
}
