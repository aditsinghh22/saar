import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth } from '../api/client';
import type { User } from '../api/types';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Field, inputClass } from '../components/ui/misc';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';
import { photos } from '../lib/images';

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useSession();
  const notify = useToast();
  const [role, setRole] = useState<User['role']>(params.get('role') === 'officer' ? 'officer' : 'citizen');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const next = params.get('next') ?? (role === 'officer' ? '/office' : '/account');

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await auth.sendOtp(phone);
      setStage('otp');
      notify('Code sent', { body: `We sent a 6-digit code to +91 ${phone}.` });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await auth.verifyOtp(phone, otp, role);
      setUser(user);
      notify(`Welcome, ${user.name.split(' ')[0]}`);
      navigate(role === 'officer' && !params.get('next') ? '/office' : next, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-mute hover:text-ink"><ArrowLeft className="size-4" /> Back to site</Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
          <h1 className="text-5xl font-semibold leading-[1]">
            {stage === 'phone' ? <>Sign in to <span className="serif-accent">Saar</span></> : 'Enter the code'}
          </h1>
          <p className="mt-4 text-mute">
            {stage === 'phone' ? 'Use the mobile number linked to your Aadhaar. No password needed.' : `Sent to +91 ${phone}. It expires in 10 minutes.`}
          </p>

          {stage === 'phone' && (
            <div className="mt-10 grid grid-cols-2 gap-1 rounded-full bg-sand p-1">
              {(['citizen', 'officer'] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`h-10 cursor-pointer rounded-full text-sm font-medium transition ${role === r ? 'bg-white shadow-sm' : 'text-mute'}`}>
                  {r === 'citizen' ? 'Citizen' : 'Government officer'}
                </button>
              ))}
            </div>
          )}

          {stage === 'phone' ? (
            <form onSubmit={sendOtp} className="mt-6 space-y-5">
              <Field label="Mobile number" error={error}>
                <div className="flex">
                  <span className="grid h-12 place-items-center rounded-l-xl border border-r-0 border-stone bg-paper px-4 text-ink-2">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    autoFocus
                    placeholder="98765 43210"
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
              </Field>
              <Button type="submit" size="lg" className="w-full" loading={busy} disabled={phone.length < 10}>
                Send code <ArrowRight className="size-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={verify} className="mt-10 space-y-5">
              <Field label="6-digit code" error={error} hint="Demo: any 6 digits will work">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoFocus
                  placeholder="••••••"
                  className={`${inputClass} text-center font-mono text-2xl tracking-[0.6em]`}
                />
              </Field>
              <Button type="submit" size="lg" className="w-full" loading={busy} disabled={otp.length < 6}>
                Verify & continue
              </Button>
              <button type="button" onClick={() => { setStage('phone'); setOtp(''); }} className="w-full cursor-pointer text-sm text-mute hover:text-ink">
                Use a different number
              </button>
            </form>
          )}

          <p className="mt-10 flex items-start gap-2 text-sm text-mute">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest" />
            We never show your Aadhaar or phone number on any public report.
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img src={photos.siteTeam(1600)} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent" />
        <figure className="absolute inset-x-12 bottom-12 text-white">
          <blockquote className="max-w-lg font-display text-3xl font-medium leading-snug tracking-tight text-white">
            “I tracked my name transfer on my phone. No agent, no visits — done in 19 days.”
          </blockquote>
          <figcaption className="mt-5 text-white/70">S. Meenakshi · Alangudi, Tamil Nadu</figcaption>
        </figure>
      </div>
    </div>
  );
}
