import { Link } from 'react-router-dom';
import { Activity, Zap, ArrowUpRight, Pause, X } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sats } from '@/components/Sats';
import { AgentAvatar } from '@/components/AgentAvatar';
import { CertificationBadge } from '@/components/CertificationBadge';
import { MOCK_USER, MOCK_SESSIONS, MOCK_TASKS } from '@/lib/mockData';
import { truncateAddr } from '@/lib/format';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const statusStyle = {
    completed: 'bg-success/15 text-success border-success/30',
    processing: 'bg-primary/15 text-primary border-primary/30',
    failed: 'bg-destructive/15 text-destructive border-destructive/30',
    pending: 'bg-muted text-muted-foreground border-border',
  } as const;

  return (
    <Layout>
      <div className="container py-8 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4 self-start lg:sticky lg:top-20">
          <div className="rounded-xl bg-surface border border-border p-5">
            <div className="flex items-center gap-3">
              <AgentAvatar name="Buyer One" size="md" />
              <div className="min-w-0">
                <div className="font-semibold text-sm">Buyer One</div>
                <div className="text-[11px] font-mono text-muted-foreground truncate">{truncateAddr(MOCK_USER.pubkey)}</div>
              </div>
            </div>
            <div className="mt-5 p-4 rounded-lg bg-warning/10 border border-warning/30 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Lightning balance</div>
              <Sats amount={MOCK_USER.walletBalance} size="xl" />
              <Button variant="outline" size="sm" className="mt-3 w-full">Top Up</Button>
            </div>
          </div>
          <nav className="rounded-xl bg-surface border border-border p-2 text-sm">
            {['Overview', 'Active Sessions', 'Task History', 'Favorite Agents', 'Settings'].map((l, i) => (
              <button key={l} className={cn('w-full text-left px-3 py-2 rounded-md transition',
                i === 0 ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-surface-2')}>
                {l}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-8">
          <h1 className="text-2xl font-bold">Overview</h1>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden bg-border">
            {[
              ['Active Sessions', MOCK_SESSIONS.length.toString()],
              ['Tasks This Month', MOCK_USER.tasksThisMonth.toString()],
              ['Total Spent', `${MOCK_USER.totalSpent} sats`],
              ['Avg / Task', '108 sats'],
            ].map(([l, v]) => (
              <div key={l} className="bg-surface px-5 py-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                <div className="text-xl font-bold tabular-nums mt-1">{v}</div>
              </div>
            ))}
          </div>

          {/* Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold inline-flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Active Sessions</h2>
              <Button asChild size="sm" variant="outline"><Link to="/browse">+ New session</Link></Button>
            </div>
            <div className="space-y-3">
              {MOCK_SESSIONS.map(s => (
                <div key={s.id} className="p-4 rounded-xl bg-surface border border-border">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <AgentAvatar name={s.agentName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{s.agentName}</span>
                        <CertificationBadge tier={s.certTier} size="sm" />
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">{s.id}</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot text-success" /> Active
                    </span>
                    <Button size="sm" variant="ghost"><Pause className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive"><X className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Calls</span><span className="font-mono">{s.callsUsed}/{s.callLimit}</span></div>
                      <Progress value={(s.callsUsed / s.callLimit) * 100} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Spend</span><Sats amount={s.spendUsed} suffix={`/${s.spendCap}`} size="sm" /></div>
                      <Progress value={(s.spendUsed / s.spendCap) * 100} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent tasks */}
          <div>
            <h2 className="font-semibold mb-3">Recent Tasks</h2>
            <div className="rounded-xl bg-surface border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {['Task ID', 'Agent', 'Type', 'Status', 'Cost', 'Time'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_TASKS.map(t => (
                    <tr key={t.id} className="hover:bg-surface-2/50 transition">
                      <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                      <td className="px-4 py-3">{t.agentName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.taskType}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border', statusStyle[t.status])}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3"><Sats amount={t.cost} size="sm" /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Spend chart (CSS bars) */}
          <div className="rounded-xl bg-surface border border-border p-5">
            <h2 className="font-semibold mb-4">Spend (last 7 days)</h2>
            <div className="flex items-end gap-3 h-32">
              {[120, 280, 90, 410, 180, 340, 220].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-t bg-gradient-to-t from-primary to-primary-glow shadow-glow" style={{ height: `${(v / 410) * 100}%` }} />
                  <span className="text-[10px] font-mono text-muted-foreground">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
