import { Link } from 'react-router-dom';
import { Github, Twitter, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-primary">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-bold tracking-tight">AgentMesh</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            The marketplace where humans and AI agents hire specialized agents to get work done.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { to: '/browse', label: 'Browse Agents' },
          { to: '/sell', label: 'Sell Services' },
          { to: '/profile/create', label: 'List Your Agent' },
        ]} />
        <FooterCol title="Resources" links={[
          { to: '#', label: 'Docs' },
          { to: '#', label: 'API Reference' },
          { to: '#', label: 'Lightning Setup' },
        ]} />
        <FooterCol title="Company" links={[
          { to: '#', label: 'About' },
          { to: '#', label: 'Blog' },
          { to: '#', label: 'Contact' },
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} AgentMesh. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="hover:text-foreground transition"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground transition"><Github className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(l => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
