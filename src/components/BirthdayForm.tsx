import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { EXAMPLE_BIRTHDAY, parseBirthday } from '../lib/stats';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function BirthdayForm({ onBirthday }: { onBirthday: (date: string, example?: boolean) => void }) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = parseBirthday(day, month, year);
    setError(result.error);
    if (result.date) onBirthday(result.date);
    else dayRef.current?.focus();
  }

  function example() {
    setDay('29'); setMonth('11'); setYear('1999'); setError(null);
    onBirthday(EXAMPLE_BIRTHDAY, true);
  }

  return <div className="birthday-block" id="your-story">
    <p className="eyebrow form-eyebrow">When did your story begin?</p>
    <form className="birthday-form" onSubmit={submit} noValidate>
      <div className="date-fields">
        <label className="date-field day-field"><span>Day</span>
          <input ref={dayRef} name="day" aria-label="Day of birth" aria-invalid={!!error} aria-describedby={error ? 'birthday-error' : undefined} autoComplete="off" inputMode="numeric" placeholder="DD" maxLength={2} value={day} onChange={(event) => setDay(event.target.value)} />
        </label>
        <label className="date-field month-field"><span>Month</span>
          <select name="month" aria-label="Month of birth" aria-invalid={!!error} value={month} onChange={(event) => setMonth(event.target.value)}>
            <option value="" disabled>Month</option>
            {months.map((name, index) => <option value={index + 1} key={name}>{name}</option>)}
          </select>
        </label>
        <label className="date-field year-field"><span>Year</span>
          <input name="year" aria-label="Year of birth" aria-invalid={!!error} autoComplete="off" inputMode="numeric" placeholder="YYYY" maxLength={4} value={year} onChange={(event) => setYear(event.target.value)} />
        </label>
      </div>
      <button className="button button-primary" type="submit">Find my Barça <ArrowUpRight size={19} /></button>
    </form>
    {error && <p className="form-error" id="birthday-error" role="alert">{error}</p>}
  </div>;
}
