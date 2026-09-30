import { ArrowRight, Compass } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';

export default function NotFoundPage({
  title = 'This page has moved plots',
  body = 'We couldn’t find what you were looking for. It may have been renamed or removed.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-lime"><Compass className="size-7" /></span>
      <p className="mt-8 font-display text-8xl font-semibold tracking-[-0.06em] text-stone">404</p>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-lg text-mute">{body}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/" variant="outline">Go home</ButtonLink>
        <ButtonLink to="/search" iconRight={<ArrowRight className="size-4" />}>Search a property</ButtonLink>
      </div>
    </div>
  );
}
