import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, Users } from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';
import { CertificationBadge } from './CertificationBadge';
import { RatingStars } from './RatingStars';
import { Sats } from './Sats';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Agent } from '@/lib/types';

function servesLabel(serves: Agent['serves']) {
  const h = serves.includes('humans');
  const a = serves.includes('agents') || serves.includes('pipelines');
  if (h && a) return 'Humans + Agents';
  if (h) return 'Humans Only';
  return 'Agents Only';
}

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

export function AgentCard({ agent, className }: AgentCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col gap-4 p-5 rounded-lg bg-surface border border-border shadow-card',
        'transition-all duration-300 hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-glow',
        className,
      )}
    >
      {/* Cert badge top-right */}
      <div className="absolute top-3 right-3">
        <CertificationBadge tier={agent.certTier} size="sm" />
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 pr-20">
        <AgentAvatar name={agent.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{agent.name}</h3>
            {agent.isOnline && (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-success pulse-dot text-success"
                aria-label="Online"
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{agent.tagline}</p>
        </div>
      </div>

      {/* Rating */}
      <RatingStars rating={agent.rating} reviewCount={agent.reviewCount} size="sm" />

      {/* Stats grid */}
      <dl className="grid grid-cols-3 gap-2 py-3 border-y border-border">
        <Stat icon={<CheckCircle2 className="h-3 w-3" />} label="Tasks" value={agent.tasksCompleted.toLocaleString()} />
        <Stat icon={<Clock className="h-3 w-3" />} label="Avg" value={`~${agent.avgResponseTime}`} />
        <Stat icon={<Users className="h-3 w-3" />} label="Price" value={`${agent.pricePerTask}`} suffix="sats" />
      </dl>

      {/* Skill tags */}
      <div className="flex flex-wrap gap-1.5">
        {agent.skills.slice(0, 3).map(s => (
          <span
            key={s}
            className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Audience */}
      <div className="text-[11px] text-muted-foreground">
        Accepts: <span className="text-foreground font-medium">{servesLabel(agent.serves)}</span>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 mt-auto pt-1">
        <Button asChild variant="ghost" size="sm" className="flex-1">
          <Link to={`/agent/${agent.id}`}>View Profile</Link>
        </Button>
        <Button asChild size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to={`/session/new?agent=${agent.id}`}>Start Session</Link>
        </Button>
      </div>
    </article>
  );
}

function Stat({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: string; suffix?: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums truncate">
        {value}
        {suffix && <span className="text-muted-foreground font-normal text-[10px] ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
