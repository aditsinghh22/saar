import { useRef, useState, type DragEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check, CloudUpload, FileText, X } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { applications, content, properties } from '../api/client';
import type { ApplicationType } from '../api/types';
import { Button } from '../components/ui/Button';
import { Card, Field, Skeleton, inputClass } from '../components/ui/misc';
import { formatMoney } from '../lib/format';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

const STEPS = ['Service', 'Property', 'Documents', 'Review'];

const REQUIRED_DOCS: Record<ApplicationType, string[]> = {
  'Name transfer after sale': ['Registered sale deed', 'ID proof of buyer'],
  'Certified copy of land record': [],
  'Building permission': ['Architect’s drawing', 'Structural safety certificate'],
  'Correct an error in records': ['Any proof of the correct detail'],
  'Split a plot': ['Consent letter signed by all owners', 'Proposed split sketch'],
  'No-dues certificate': [],
};

export default function NewApplicationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const notify = useToast();
  const { data: services } = useAsync(() => content.services(), []);
  const { data: allProps } = useAsync(() => properties.search('', {}), []);

  const [step, setStep] = useState(params.get('type') ? 1 : 0);
  const [serviceId, setServiceId] = useState(params.get('type') ?? '');
  const [propertyId, setPropertyId] = useState(params.get('property') ?? '');
  const [applicant, setApplicant] = useState(user?.name ?? '');
  const [note, setNote] = useState('');
  const [docs, setDocs] = useState<{ name: string; size: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applicable = services?.filter((s) => s.applicationType) ?? [];
  const service = applicable.find((s) => s.id === serviceId);
  const type = service?.applicationType;
  const property = allProps?.find((p) => p.id === propertyId);
  const required = type ? REQUIRED_DOCS[type] : [];

  const canNext = [!!service, !!property && applicant.trim().length > 2, docs.length >= required.length, true][step];

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setDocs((d) => [...d, ...Array.from(files).map((f) => ({ name: f.name, size: f.size > 1e6 ? `${(f.size / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB` }))]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const submit = async () => {
    if (!type || !property) return;
    setSubmitting(true);
    try {
      const app = await applications.create({ type, propertyId: property.id, applicant, note: note || undefined, documents: docs });
      notify('Application submitted', { body: `Reference ${app.id}. We’ll keep you updated by SMS.` });
      navigate(`/applications/${app.id}`);
    } catch (e) {
      notify('Could not submit', { body: (e as Error).message, tone: 'error' });
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <p className="eyebrow">New application</p>
      <h1 className="mt-4 text-5xl font-semibold leading-[1] sm:text-6xl">
        {service ? service.title : <>What do you need <span className="serif-accent">help with?</span></>}
      </h1>

      <ol className="mt-10 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              disabled={i > step}
              onClick={() => setStep(i)}
              className={`flex h-10 items-center gap-2 rounded-full pl-1.5 pr-4 text-sm transition enabled:cursor-pointer ${i === step ? 'bg-ink text-white' : i < step ? 'bg-mint text-forest' : 'bg-sand text-faint'}`}
            >
              <span className={`grid size-7 place-items-center rounded-full text-xs ${i === step ? 'bg-lime text-ink' : i < step ? 'bg-forest text-white' : 'bg-white'}`}>
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6 sm:p-9">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {!services
                ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)
                : applicable.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setServiceId(s.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 text-left transition ${serviceId === s.id ? 'border-forest bg-mint/60' : 'border-line hover:border-stone'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium leading-snug">{s.title}</p>
                        <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${serviceId === s.id ? 'border-forest bg-forest' : 'border-stone'}`}>
                          {serviceId === s.id && <Check className="size-3 text-white" />}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-mute">{s.fee} · {s.time}</p>
                    </button>
                  ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Field label="Which property is this for?" hint="Start typing a plot number or locality">
                <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputClass}>
                  <option value="">Choose a property</option>
                  {allProps?.map((p) => <option key={p.id} value={p.id}>{p.plotNo} — {p.locality}, {p.city}</option>)}
                </select>
              </Field>
              <Field label="Applicant’s full name" hint="As written on your ID proof">
                <input value={applicant} onChange={(e) => setApplicant(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Anything the office should know? (optional)">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className={`${inputClass} h-auto py-3`} placeholder="E.g. the seller has passed away; the legal heir certificate is attached." />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              {required.length > 0 ? (
                <div className="mb-6 rounded-2xl bg-paper p-5">
                  <p className="text-sm font-medium">You’ll need</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
                    {required.map((r, i) => (
                      <li key={r} className="flex items-center gap-2">
                        <span className={`grid size-4 place-items-center rounded-full ${docs.length > i ? 'bg-ok text-white' : 'border border-stone'}`}>{docs.length > i && <Check className="size-2.5" />}</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mb-6 rounded-2xl bg-ok-soft p-5 text-sm text-ok">No documents needed for this service. You can skip this step.</p>
              )}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${dragging ? 'border-forest bg-mint/50' : 'border-stone hover:border-ink/30 hover:bg-paper'}`}
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-sand"><CloudUpload className="size-6" /></span>
                <p className="mt-4 font-medium">Drop files here or click to choose</p>
                <p className="mt-1 text-sm text-mute">PDF, JPG or PNG · up to 10 MB each</p>
                <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </div>
              {docs.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {docs.map((d, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3">
                      <FileText className="size-4 text-mute" />
                      <span className="flex-1 truncate text-sm">{d.name}</span>
                      <span className="text-xs text-faint">{d.size}</span>
                      <button onClick={() => setDocs(docs.filter((_, j) => j !== i))} className="cursor-pointer text-mute hover:text-bad" aria-label="Remove"><X className="size-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 3 && service && property && (
            <dl className="divide-y divide-line">
              {[
                ['Service', service.title],
                ['Property', `${property.plotNo}, ${property.locality}`],
                ['Applicant', applicant],
                ['Documents', docs.length ? `${docs.length} attached` : 'None'],
                ['Usually takes', service.time],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-4 first:pt-0">
                  <dt className="text-mute">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button variant="ghost" onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))} icon={<ArrowLeft className="size-4" />}>
              Back
            </Button>
            {step < 3 ? (
              <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button loading={submitting} onClick={submit}>
                {type && applications.fees[type] ? `Pay ${formatMoney(applications.fees[type])} & submit` : 'Submit application'}
              </Button>
            )}
          </div>
        </Card>

        <aside className="space-y-5">
          {property ? (
            <div className="overflow-hidden rounded-[2rem] border border-line bg-white">
              <img src={property.image.replace('w=1200', 'w=700')} alt="" className="aspect-[16/9] w-full object-cover" />
              <div className="p-6">
                <p className="font-display text-xl font-semibold">{property.plotNo}</p>
                <p className="text-sm text-mute">{property.locality}, {property.city}</p>
                <p className="mt-3 text-sm text-ink-2">Owner: {property.owners.map((o) => o.name).join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] bg-sand/70 p-7">
              <p className="font-display text-xl font-semibold">Takes about 5 minutes</p>
              <p className="mt-2 text-mute">Keep your documents handy as photos or PDFs. You can save and come back later.</p>
            </div>
          )}
          {service && (
            <div className="rounded-[2rem] bg-lime p-7">
              <p className="eyebrow !text-ink-2">Fee</p>
              <p className="mt-2 font-display text-4xl font-semibold">{service.fee}</p>
              <p className="mt-2 text-sm text-ink-2">Usually done in {service.time.toLowerCase()}. You’ll get SMS updates at every step.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
