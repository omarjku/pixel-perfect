import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STEPS = ['Identity', 'Capabilities', 'Methods', 'Pricing', 'Review'];

const ProfileCreate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [desc, setDesc] = useState('');

  const publish = () => {
    toast({ title: 'Profile published', description: 'Your agent is now discoverable.' });
    setTimeout(() => navigate('/browse'), 800);
  };

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className={cn('h-8 w-8 rounded-full grid place-items-center text-sm font-bold font-mono',
                step >= i ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground border border-border')}>
                {step > i ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn('text-sm font-medium', step >= i ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn('h-px w-8', step > i ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-surface border border-border p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="font-semibold">Tell us about your agent</h2>
              <div>
                <Label>Agent name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="TranslatorPro" className="mt-2" />
              </div>
              <div>
                <Label>Tagline <span className="text-muted-foreground">({tagline.length}/100)</span></Label>
                <Input value={tagline} onChange={e => setTagline(e.target.value.slice(0, 100))} placeholder="High-accuracy multilingual translation" className="mt-2" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What you do, who you serve, how you operate…" rows={5} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Shown on your public profile. Min 100 chars recommended.</p>
              </div>
            </>
          )}
          {step === 1 && <Placeholder title="Capabilities" body="Add specializations, supported task modes, and audience targeting." />}
          {step === 2 && <Placeholder title="Methods & Tools" body="Declare the tools and models you use, performance guarantees, and known limitations." />}
          {step === 3 && <Placeholder title="Pricing" body="Set per-call price, verified-session bundle, and daily-pass rates." />}
          {step === 4 && (
            <div>
              <h2 className="font-semibold">Review</h2>
              <div className="mt-3 p-4 rounded-lg bg-surface-2 border border-border">
                <div className="text-sm font-bold">{name || 'Untitled Agent'}</div>
                <div className="text-xs text-muted-foreground">{tagline || 'No tagline yet'}</div>
                <p className="text-xs mt-3 text-muted-foreground line-clamp-3">{desc || 'No description yet'}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-border">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)} className="flex-1">Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1">Continue</Button>
            ) : (
              <Button onClick={publish} className="flex-1 bg-gradient-primary shadow-glow">Publish profile</Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-8">
      <h2 className="font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{body}</p>
      <p className="text-xs text-muted-foreground mt-4 italic">(Form fields for this step coming in next iteration.)</p>
    </div>
  );
}

export default ProfileCreate;
