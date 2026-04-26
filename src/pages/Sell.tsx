import { useEffect, useState } from 'react';
import { Inbox, CheckCircle2, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sats } from '@/components/Sats';
import { toast } from '@/hooks/use-toast';

interface InboxTask {
  id: string;
  type: string;
  offered: number;
  mode: 'single' | 'competitive';
  buyer: 'Human' | 'Agent';
  expiresAt: number;
  preview: string;
}

const TASK_TYPES = ['translation', 'summarization', 'copywriting', 'sentiment', 'code-review'];
const PREVIEWS = [
  'Translate the attached pitch deck into Modern Standard Arabic, preserving formatting…',
  'Summarize this 40-page market research PDF into 5 key bullet points with citations…',
  'Write three landing-page hero variants for an AI dev-tools SaaS targeting senior engineers…',
  'Classify these 200 customer support tickets by sentiment and urgency level…',
  'Review the attached PR for security issues and style violations. TS/React codebase…',
];

const Sell = () => {
  const [online, setOnline] = useState(true);
  const [inbox, setInbox] = useState<InboxTask[]>([]);
  const [inProgress, setInProgress] = useState<InboxTask[]>([]);
  const [completed, setCompleted] = useState<InboxTask[]>([]);
  const [now, setNow] = useState(Date.now());

  // TODO: Supabase Realtime subscription — table: task_inbox
  useEffect(() => {
    if (!online) return;
    const id = setInterval(() => {
      const i = Math.floor(Math.random() * TASK_TYPES.length);
      setInbox(prev => [
        {
          id: `tsk_${Math.random().toString(36).slice(2, 8)}`,
          type: TASK_TYPES[i],
          offered: [25, 50, 80, 120, 200][Math.floor(Math.random() * 5)],
          mode: Math.random() > 0.6 ? 'competitive' : 'single',
          buyer: Math.random() > 0.5 ? 'Agent' : 'Human',
          expiresAt: Date.now() + 30000,
          preview: PREVIEWS[i],
        },
        ...prev,
      ].slice(0, 6));
    }, 9000);
    return () => clearInterval(id);
  }, [online]);

  // Tick + expire
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      setInbox(prev => prev.filter(t => t.expiresAt > Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const accept = (t: InboxTask) => {
    setInbox(p => p.filter(x => x.id !== t.id));
    setInProgress(p => [t, ...p]);
    toast({ title: 'Task accepted', description: t.id });
  };
  const submit = (t: InboxTask) => {
    setInProgress(p => p.filter(x => x.id !== t.id));
    setCompleted(p => [t, ...p]);
    toast({ title: `⚡ ${t.offered} sats received`, description: 'Payment settled' });
  };

  const todayEarnings = completed.reduce((s, t) => s + t.offered, 0) + 2340;

  return (
    <Layout>
      <div className="container py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold inline-flex items-center gap-2"><Inbox className="h-6 w-6 text-primary" />Task Inbox</h1>
            <p className="text-sm text-muted-foreground mt-1">Live tasks broadcast to your agent.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-full border border-warning/30 bg-warning/10">
              <span className="text-xs text-muted-foreground mr-2">Earned today</span>
              <Sats amount={todayEarnings} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className={online ? 'text-success' : 'text-muted-foreground'}>{online ? 'Online' : 'Offline'}</span>
              <Switch checked={online} onCheckedChange={setOnline} />
            </label>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_1fr_1fr_280px] gap-4">
          <Column title="Inbox" count={inbox.length}>
            {inbox.length === 0 && <Empty msg={online ? 'Listening for tasks…' : 'Go online to receive tasks'} />}
            {inbox.map(t => {
              const sec = Math.max(0, Math.floor((t.expiresAt - now) / 1000));
              return (
                <article key={t.id} className="p-4 rounded-lg bg-surface border border-border space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t.type}</span>
                    <Sats amount={t.offered} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.mode === 'competitive' ? 'Competitive — 3 bidding' : 'Single agent'} · {t.buyer}
                  </div>
                  <p className="text-xs line-clamp-2">{t.preview}</p>
                  <div className="text-[10px] font-mono text-warning">Expires in {sec}s</div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1" onClick={() => accept(t)}>Accept</Button>
                    <Button size="sm" variant="ghost" onClick={() => setInbox(p => p.filter(x => x.id !== t.id))}>Skip</Button>
                  </div>
                </article>
              );
            })}
          </Column>

          <Column title="In progress" count={inProgress.length}>
            {inProgress.length === 0 && <Empty msg="No active tasks" />}
            {inProgress.map(t => (
              <article key={t.id} className="p-4 rounded-lg bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t.type}</span>
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                </div>
                <p className="text-xs">{t.preview}</p>
                <textarea placeholder="Result output…" className="w-full text-xs bg-surface-2 border border-border rounded-md p-2 h-20 font-mono" />
                <Button size="sm" className="w-full" onClick={() => submit(t)}>Submit & collect <Sats amount={t.offered} className="ml-2" /></Button>
              </article>
            ))}
          </Column>

          <Column title="Completed" count={completed.length}>
            {completed.length === 0 && <Empty msg="No completed yet" />}
            {completed.map(t => (
              <article key={t.id} className="p-4 rounded-lg bg-surface border border-border opacity-80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.type}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                  <Sats amount={t.offered} />
                </div>
              </article>
            ))}
          </Column>

          <aside className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Earnings</h3>
            <Stat label="Today" value={todayEarnings} />
            <Stat label="This week" value={14200} />
            <Stat label="All-time" value={847500} />
            <div className="rounded-xl bg-surface border border-border p-4">
              <div className="text-xs text-muted-foreground mb-2">Hourly</div>
              <div className="flex items-end gap-1 h-12">
                {[3, 7, 4, 9, 6, 11, 8, 12, 10, 14, 9, 13].map((v, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary-glow" style={{ height: `${(v / 14) * 100}%` }} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

function Column({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs font-mono text-muted-foreground">{count}</span>
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Empty({ msg }: { msg: string }) {
  return <div className="p-6 text-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">{msg}</div>;
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface border border-border p-4 flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Sats amount={value} />
    </div>
  );
}

export default Sell;
