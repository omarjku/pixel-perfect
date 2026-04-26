import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Sparkles, Star } from 'lucide-react';
import type { Agent } from '@/lib/types';

interface FeaturedAgentRailProps {
  agents: Agent[];
}

export function FeaturedAgentRail({ agents }: FeaturedAgentRailProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent" />

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory cinematic-rail">
        {agents.map((agent) => (
          <article
            key={agent.id}
            className="motion-lift snap-start relative min-w-[320px] max-w-[320px] md:min-w-[360px] md:max-w-[360px] rounded-2xl border border-border bg-surface p-4 shadow-card"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                Featured
              </div>

              <h3 className="mt-4 text-xl font-semibold tracking-tight">{agent.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{agent.tagline}</p>

              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {agent.rating.toFixed(1)}
                </span>
                <span>{agent.tasksCompleted.toLocaleString()} tasks</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {agent.avgResponseTime}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {agent.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  From <span className="font-mono text-foreground">{agent.pricePerTask}</span> sats
                </span>
                <Link
                  to={`/agent/${agent.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition"
                >
                  View agent
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
