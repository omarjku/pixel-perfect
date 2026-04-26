import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, List as ListIcon, X, SlidersHorizontal } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AgentCard } from '@/components/AgentCard';
import { AgentListRow } from '@/components/AgentListRow';
import { searchAgents } from '@/lib/mockData';
import type { Agent, CertTier } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortKey = 'relevance' | 'rating' | 'fastest' | 'cheapest' | 'active';

const ALL_TIERS: CertTier[] = ['Unverified', 'Basic', 'Verified', 'Elite'];

const Browse = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [minRating, setMinRating] = useState(3);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [responseTime, setResponseTime] = useState<'any' | '10s' | '30s' | '2min'>('any');
  const [tiers, setTiers] = useState<Set<CertTier>>(new Set(ALL_TIERS));
  const [acceptsHumans, setAcceptsHumans] = useState(true);
  const [acceptsAgents, setAcceptsAgents] = useState(true);
  const [taskMode, setTaskMode] = useState<'any' | 'single' | 'competitive'>('any');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  // Fetch when query changes (mocked).
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real endpoint — GET /api/agents?q=:q
    searchAgents(query).then(r => {
      setAgents(r);
      setLoading(false);
    });
  }, [query]);

  // Sync URL on submit
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(query ? { q: query } : {});
  };

  const filtered = useMemo(() => {
    let r = agents.filter(a => {
      if (a.rating < minRating) return false;
      if (a.pricePerTask < priceRange[0] || a.pricePerTask > priceRange[1]) return false;
      if (!tiers.has(a.certTier)) return false;
      const respSec = parseInt(a.avgResponseTime);
      if (responseTime === '10s' && respSec > 10) return false;
      if (responseTime === '30s' && respSec > 30) return false;
      if (responseTime === '2min' && respSec > 120) return false;
      const wantsHumans = acceptsHumans && a.serves.includes('humans');
      const wantsAgents = acceptsAgents && (a.serves.includes('agents') || a.serves.includes('pipelines'));
      if (!wantsHumans && !wantsAgents) return false;
      if (taskMode !== 'any' && !a.taskModes.includes(taskMode)) return false;
      return true;
    });
    switch (sort) {
      case 'rating':   r = [...r].sort((a, b) => b.rating - a.rating); break;
      case 'fastest':  r = [...r].sort((a, b) => parseInt(a.avgResponseTime) - parseInt(b.avgResponseTime)); break;
      case 'cheapest': r = [...r].sort((a, b) => a.pricePerTask - b.pricePerTask); break;
      case 'active':   r = [...r].sort((a, b) => b.tasksCompleted - a.tasksCompleted); break;
    }
    return r;
  }, [agents, sort, minRating, priceRange, responseTime, tiers, acceptsHumans, acceptsAgents, taskMode]);

  // Reset page when filters/results change
  useEffect(() => { setPage(1); }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setSort('relevance'); setMinRating(3); setPriceRange([0, 1000]);
    setResponseTime('any'); setTiers(new Set(ALL_TIERS));
    setAcceptsHumans(true); setAcceptsAgents(true); setTaskMode('any');
  };

  const toggleTier = (t: CertTier) => {
    const next = new Set(tiers);
    if (next.has(t)) next.delete(t); else next.add(t);
    setTiers(next);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Search bar */}
        <form onSubmit={submit} className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by skill, name, or task type…"
            className="w-full h-12 pl-11 pr-28 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition"
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-9">Search</Button>
        </form>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <aside className="space-y-6 lg:sticky lg:top-20 self-start">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h2>
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <X className="h-3 w-3" /> Reset
              </button>
            </div>

            <FilterBlock title="Sort By">
              <RadioGroup value={sort} onValueChange={(v) => setSort(v as SortKey)} className="space-y-1.5">
                {([
                  ['relevance', 'Relevance'],
                  ['rating', 'Best Rated'],
                  ['fastest', 'Fastest Completion'],
                  ['cheapest', 'Lowest Cost'],
                  ['active', 'Most Active'],
                ] as const).map(([v, l]) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem value={v} id={`sort-${v}`} />
                    <Label htmlFor={`sort-${v}`} className="text-sm font-normal cursor-pointer">{l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </FilterBlock>

            <FilterBlock title="Minimum Rating">
              <div className="space-y-2">
                <Slider value={[minRating]} min={0} max={5} step={0.5} onValueChange={(v) => setMinRating(v[0])} />
                <div className="text-xs text-muted-foreground tabular-nums">{minRating.toFixed(1)}+ stars</div>
              </div>
            </FilterBlock>

            <FilterBlock title="Price Range (sats)">
              <div className="space-y-2">
                <Slider value={priceRange} min={0} max={1000} step={10} onValueChange={(v) => setPriceRange([v[0], v[1]])} />
                <div className="text-xs text-muted-foreground font-mono tabular-nums">{priceRange[0]} – {priceRange[1]}</div>
              </div>
            </FilterBlock>

            <FilterBlock title="Response Time">
              <RadioGroup value={responseTime} onValueChange={(v) => setResponseTime(v as typeof responseTime)} className="space-y-1.5">
                {([['any', 'Any'], ['10s', 'Under 10s'], ['30s', 'Under 30s'], ['2min', 'Under 2 min']] as const).map(([v, l]) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem value={v} id={`rt-${v}`} />
                    <Label htmlFor={`rt-${v}`} className="text-sm font-normal cursor-pointer">{l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </FilterBlock>

            <FilterBlock title="Certification Tier">
              <div className="space-y-1.5">
                {ALL_TIERS.map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={tiers.has(t)} onCheckedChange={() => toggleTier(t)} />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Accepts">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={acceptsHumans} onCheckedChange={(c) => setAcceptsHumans(!!c)} />
                  <span className="text-sm">Human Requests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={acceptsAgents} onCheckedChange={(c) => setAcceptsAgents(!!c)} />
                  <span className="text-sm">Agent Requests</span>
                </label>
              </div>
            </FilterBlock>

            <FilterBlock title="Task Mode">
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-surface-2 rounded-md">
                {(['any', 'single', 'competitive'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setTaskMode(m)}
                    className={cn(
                      'h-8 text-xs font-medium rounded transition capitalize',
                      taskMode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </FilterBlock>
          </aside>

          {/* Results */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> agents
                {query && <> for "<span className="text-foreground">{query}</span>"</>}
              </p>
              <div className="flex items-center gap-1 p-0.5 bg-surface-2 border border-border rounded-md">
                <button
                  onClick={() => setView('grid')}
                  className={cn('h-8 w-8 grid place-items-center rounded transition', view === 'grid' ? 'bg-surface text-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={cn('h-8 w-8 grid place-items-center rounded transition', view === 'list' ? 'bg-surface text-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
                  aria-label="List view"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className={view === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-3'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className={view === 'grid' ? 'h-72 rounded-lg' : 'h-20 rounded-lg'} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl bg-surface/40">
                <p className="text-muted-foreground">No agents match your filters.</p>
                <Button variant="link" onClick={reset}>Reset filters</Button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {pageItems.map(a => <AgentCard key={a.id} agent={a} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {pageItems.map(a => <AgentListRow key={a.id} agent={a} />)}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="h-9 px-3 rounded-md font-mono text-sm bg-surface-2 hover:bg-surface-3 text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={cn(
                      'h-9 w-9 rounded-md font-mono text-sm transition',
                      p === page ? 'bg-primary text-primary-foreground' : 'bg-surface-2 hover:bg-surface-3 text-muted-foreground',
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="h-9 px-3 rounded-md font-mono text-sm bg-surface-2 hover:bg-surface-3 text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ›
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 pb-5 border-b border-border last:border-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

export default Browse;
