import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Check, Download, FileText, Landmark, Upload } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { applications, properties } from '../api/client';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, Skeleton } from '../components/ui/misc';
import { PropertyRow } from '../components/property/PropertyCard';
import { formatDate, formatMoney } from '../lib/format';
import { useToast } from '../lib/toast';
import NotFoundPage from './NotFoundPage';

export default function ApplicationDetailPage() {
  const { id = '' } = useParams();
  const { data: a, loading, error, setData } = useAsync(() => applications.get(id), [id]);
  const { data: property } = useAsync(() => (a ? properties.get(a.propertyId) : Promise.resolve(undefined)), [a?.propertyId]);
  const notify = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  if (error) return <NotFoundPage title="Application not found" body={`We couldn’t find an application with reference ${id}.`} />;
  if (loading || !a) {
    return (
      <div className="container-x pb-24 pt-10">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-14 w-2/3" />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-[480px] !rounded-[2rem]" />
          <Skeleton className="h-[480px] !rounded-[2rem]" />
        </div>
      </div>
    );
  }

  const onUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const f = files[0];
    setData((prev) => ({
      ...prev!,
      status: 'In review',
      documents: [...prev!.documents, { name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` }],
      steps: prev!.steps.map((s) => (s.state === 'current' ? { ...s, note: `Revised document “${f.name}” uploaded. Waiting for the office to review.` } : s)),
    }));
    notify('Document uploaded', { body: 'The office has been notified.' });
  };

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-mute hover:text-ink">
        <ArrowLeft className="size-4" /> All applications
      </Link>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-mute">{a.id}</span>
            <StatusBadge status={a.status} />
          </div>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.02] sm:text-6xl">{a.type}</h1>
        </div>
        <Button variant="outline" icon={<Download className="size-4" />} onClick={() => notify('Receipt downloading', { body: `${a.id}-receipt.pdf` })}>
          Download receipt
        </Button>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-7 sm:p-9">
          <h2 className="text-2xl font-semibold">Progress</h2>
          <ol className="mt-8">
            {a.steps.map((s, i) => {
              const last = i === a.steps.length - 1;
              const rejected = a.status === 'Rejected' && last;
              return (
                <li key={i} className="relative flex gap-5 pb-10 last:pb-0">
                  {!last && <span className={`absolute left-[17px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${s.state === 'done' ? 'bg-forest' : 'bg-line'}`} />}
                  <span
                    className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 ${
                      rejected ? 'border-bad bg-bad text-white' : s.state === 'done' ? 'border-forest bg-forest text-lime' : s.state === 'current' ? (a.status === 'Needs info' ? 'border-warn bg-warn-soft' : 'border-forest bg-white') : 'border-line bg-white'
                    }`}
                  >
                    {s.state === 'done' && !rejected ? <Check className="size-4" /> : s.state === 'current' ? <span className={`size-2.5 animate-pulse rounded-full ${a.status === 'Needs info' ? 'bg-warn' : 'bg-forest'}`} /> : <span className="font-mono text-xs text-faint">{i + 1}</span>}
                  </span>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className={`font-medium ${s.state === 'upcoming' ? 'text-faint' : ''}`}>{s.label}</p>
                      {s.date && <p className="font-mono text-xs text-faint">{formatDate(s.date)}</p>}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-mute"><Landmark className="size-3.5" />{s.office}</p>
                    {s.note && (
                      <p className={`mt-3 rounded-2xl px-4 py-3 text-sm ${s.state === 'current' && a.status === 'Needs info' ? 'bg-warn-soft text-ink' : rejected ? 'bg-bad-soft text-ink' : 'bg-paper text-ink-2'}`}>{s.note}</p>
                    )}
                    {s.state === 'current' && a.status === 'Needs info' && (
                      <>
                        <input ref={fileRef} type="file" className="hidden" onChange={(e) => onUpload(e.target.files)} />
                        <Button size="sm" className="mt-4" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()}>
                          Upload revised document
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-5">
          <Card className="p-7">
            <dl className="divide-y divide-line">
              {[
                ['Applicant', a.applicant],
                ['Submitted', formatDate(a.submitted)],
                ['Expected by', formatDate(a.expectedBy)],
                ['Fee paid', a.fee ? formatMoney(a.fee) : 'Free'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <dt className="text-mute">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          {property && (
            <div>
              <p className="mb-3 px-1 text-sm text-mute">Property</p>
              <PropertyRow p={property} />
            </div>
          )}
          <Card className="p-7">
            <p className="font-medium">Documents</p>
            <ul className="mt-4 space-y-2">
              {a.documents.map((d) => (
                <li key={d.name} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
                  <FileText className="size-4 shrink-0 text-mute" />
                  <span className="flex-1 truncate text-sm">{d.name}</span>
                  <span className="shrink-0 text-xs text-faint">{d.size}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
