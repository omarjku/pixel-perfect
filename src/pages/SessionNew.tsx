import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, Copy, Zap, QrCode } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sats } from '@/components/Sats';
import { CertificationBadge } from '@/components/CertificationBadge';
import { AgentAvatar } from '@/components/AgentAvatar';
import { MOCK_AGENTS, createSession } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { useMode } from '@/lib/mode';
import { cn } from '@/lib/utils';

const SessionNew = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { requireMock, isLive } = useMode();
  const agent = isLive
    ? null
    : MOCK_AGENTS.find(a => a.id === params.get('agent')) ?? MOCK_AGENTS[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [sessionType, setType] = useState<'pay-per-call' | 'verified' | 'daily-pass'>('verified');
  const [callLimit, setCallLimit] = useState(100);
  const [spendCap, setSpendCap] = useState(5000);
  const [autoRenew, setAutoRenew] = useState(false);
  const [limitScope, setLimitScope] = useState<'session' | 'bot' | 'call' | 'day'>('session');
  const [policyTarget, setPolicyTarget] = useState<'user' | 'agent'>('user');
  const [paid, setPaid] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const totalCost = !agent
    ? 0
    : sessionType === 'pay-per-call'
    ? agent.pricePerTask
    : sessionType === 'verified'
    ? Math.min(spendCap, callLimit * agent.pricePerTask)
    : 8000;

  const goPay = () => {
    if (!agent) return;
    if (!requireMock('Lightning payment')) return;
    setStep(3);
    setTimeout(async () => {
      const s = await createSession(agent.id, { type: sessionType, callLimit, spendCap });
      setSessionId(s.id);
      setPaid(true);
      toast({ title: '⚡ Payment detected', description: `Session ${s.id} is now active.` });
      setStep(4);
    }, 3000);
  };

  if (!agent) {
    return (
      <Layout>
        <div className="container py-20 max-w-xl text-center">
          <h1 className="text-2xl font-bold">No agent selected</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLive
              ? 'Backend not connected. Switch to Mock mode in the navbar to start a session against sample agents.'
              : 'Pick an agent from the marketplace first.'}
          </p>
          <Button asChild className="mt-6"><Link to="/browse">Browse agents</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={cn('h-8 w-8 rounded-full grid place-items-center text-sm font-bold font-mono',
                step >= n ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground border border-border')}>
                {step > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {n < 3 && <div className={cn('h-px w-12', step > n ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
          <span className="ml-4 text-sm text-muted-foreground">
            {step === 1 ? 'Choose session type' : step === 2 ? 'Configure limits' : step === 3 ? 'Review & pay' : 'Confirmation'}
          </span>
        </div>

        <div className="rounded-xl bg-surface border border-border p-6 shadow-card">
          {/* Agent header */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border">
            <AgentAvatar name={agent.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{agent.name}</h2>
                <CertificationBadge tier={agent.certTier} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground">{agent.tagline}</p>
            </div>
            <Sats amount={agent.pricePerTask} suffix="/task" />
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="font-semibold mb-2">How do you want to pay?</h3>
              {([
                ['pay-per-call', 'Pay-Per-Call', 'No upfront commitment. Pay per task. Higher per-unit cost.'],
                ['verified', 'Verified Session', 'Pre-authorize a credit amount. Call freely within limits. Best for automation.'],
                ['daily-pass', 'Daily Pass', 'Flat rate for 24 hours of unlimited calls.'],
              ] as const).map(([v, t, d]) => (
                <label key={v} className={cn('flex gap-3 p-4 rounded-lg border cursor-pointer transition',
                  sessionType === v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                  <input type="radio" checked={sessionType === v} onChange={() => setType(v)} className="mt-1 accent-primary" />
                  <div>
                    <div className="font-semibold text-sm">{t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{d}</div>
                  </div>
                </label>
              ))}
              <Button className="w-full mt-4" onClick={() => setStep(2)}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-semibold">Configure limits</h3>
              {sessionType === 'verified' && (
                <>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-surface-2 p-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Limit scope</Label>
                      <RadioGroup value={limitScope} onValueChange={(v) => setLimitScope(v as typeof limitScope)} className="mt-3 space-y-2">
                        {([
                          ['session', 'Per session'],
                          ['bot', 'Per bot'],
                          ['call', 'Per call'],
                          ['day', 'Per day'],
                        ] as const).map(([v, l]) => (
                          <label key={v} className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value={v} id={`scope-${v}`} />
                            <span className="text-sm">{l}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="rounded-lg border border-border bg-surface-2 p-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Policy target</Label>
                      <RadioGroup value={policyTarget} onValueChange={(v) => setPolicyTarget(v as typeof policyTarget)} className="mt-3 space-y-2">
                        {([
                          ['user', 'User-specific'],
                          ['agent', 'Agent-specific'],
                        ] as const).map(([v, l]) => (
                          <label key={v} className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value={v} id={`target-${v}`} />
                            <span className="text-sm">{l}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Call limit</Label>
                    <input type="number" value={callLimit} onChange={e => setCallLimit(+e.target.value)}
                      className="w-full mt-2 h-10 px-3 bg-surface-2 border border-border rounded-md font-mono" />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Spend cap (sats)</Label>
                    <input type="number" value={spendCap} onChange={e => setSpendCap(+e.target.value)}
                      className="w-full mt-2 h-10 px-3 bg-surface-2 border border-border rounded-md font-mono" />
                  </div>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                    <div>
                      <div className="text-sm font-medium">Auto-renew</div>
                      <div className="text-xs text-muted-foreground">Extend automatically when limit is hit</div>
                    </div>
                    <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                  </label>

                  <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Policy preview</div>
                    <p className="mt-1 text-sm">
                      This verified session enforces a <span className="font-semibold">{limitScope}</span>-scoped cap and applies limits at the <span className="font-semibold">{policyTarget}</span> level.
                    </p>
                  </div>
                </>
              )}
              {sessionType !== 'verified' && (
                <p className="text-sm text-muted-foreground">No additional configuration needed for this session type.</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={goPay}>Continue to payment</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center">
              <h3 className="font-semibold">Pay with Lightning</h3>
              <div className="mx-auto h-48 w-48 rounded-lg bg-surface-2 border border-border grid place-items-center">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="font-mono text-xs text-muted-foreground break-all px-4">
                lnbc{Math.random().toString(36).slice(2)}{Math.random().toString(36).slice(2)}
              </div>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('mock-invoice'); toast({ title: 'Invoice copied' }); }}>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy invoice
              </Button>
              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-warning pulse-dot text-warning" />
                  Waiting for payment… <Sats amount={totalCost} />
                </span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-success/15 grid place-items-center">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold">Session Active</h3>
              <div className="font-mono text-sm">{sessionId}</div>
              <p className="text-sm text-muted-foreground">Your session is live and ready to receive calls.</p>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1"><Link to="/browse">Browse more</Link></Button>
                <Button asChild className="flex-1 bg-primary hover:bg-primary/90"><Link to="/dashboard">Go to dashboard</Link></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SessionNew;
