import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Search } from 'lucide-react';

const EXAMPLES = ['104-B Chandigarh', 'Survey 341/1', 'Khesra 512', 'Meera Joshi'];

export function SearchBox({ initial = '', size = 'lg', showExamples = true }: { initial?: string; size?: 'lg' | 'md'; showExamples?: boolean }) {
  const [q, setQ] = useState(initial);
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const big = size === 'lg';

  return (
    <div>
      <form
        onSubmit={submit}
        className={`flex items-center rounded-full border border-line bg-white shadow-[0_18px_40px_-20px_rgb(27_26_22/0.28)] transition focus-within:border-forest/50 focus-within:ring-4 focus-within:ring-forest/10 ${big ? 'p-2 pl-6' : 'p-1.5 pl-5'}`}
      >
        <Search className={`${big ? 'size-5' : 'size-[18px]'} shrink-0 text-mute`} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Plot number, survey number, owner or locality"
          className={`min-w-0 flex-1 bg-transparent px-3 text-ink placeholder:text-faint focus:outline-none ${big ? 'h-12 text-[17px]' : 'h-10 text-[15px]'}`}
          aria-label="Search property"
        />
        <button className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-forest font-medium text-white transition hover:bg-forest-2 ${big ? 'h-12 px-6' : 'h-10 px-5 text-sm'}`}>
          <span className="hidden sm:inline">Search</span>
          <ArrowRight className="size-4" />
        </button>
      </form>
      {showExamples && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-mute">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => navigate(`/search?q=${encodeURIComponent(ex)}`)}
              className="cursor-pointer rounded-full border border-line bg-white/70 px-3 py-1 text-ink-2 transition hover:border-ink/25 hover:bg-white"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
