import Icon from '../Icon.jsx'
import SearchSelect from './SearchSelect.jsx'
import { COUNTRIES } from '../../data/countries.js'
import { QUALIFICATION_LEVELS, YEARS } from '../../data/formOptions.js'

// 可重复添加的学术经历记录。value 为数组，每条：
// { institution, country, qualification, field, startYear, endYear, current, result }
const EMPTY = {
  institution: '',
  country: '',
  qualification: '',
  field: '',
  startYear: '',
  endYear: '',
  current: false,
  result: '',
}

const inputCls =
  'w-full rounded-lg border border-grey-200 bg-white px-4 py-2.5 outline-none focus:border-ink transition-colors disabled:bg-grey-50 disabled:text-grey-400'

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-grey-400">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

export default function AcademicHistory({ value, onChange, disabled = false }) {
  const records = Array.isArray(value) && value.length ? value : [{ ...EMPTY }]

  const update = (i, patch) => {
    const next = records.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    onChange(next)
  }
  const add = () => onChange([...records, { ...EMPTY }])
  const remove = (i) => onChange(records.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-5">
      {records.map((r, i) => (
        <div key={i} className="rounded-xl border border-grey-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-grey-500">
              Qualification {i + 1}
            </span>
            {!disabled && records.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-grey-500 hover:text-primary"
              >
                <Icon name="trash" size={16} /> Remove
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Institution name">
                <input
                  value={r.institution || ''}
                  onChange={(e) => update(i, { institution: e.target.value })}
                  disabled={disabled}
                  className={inputCls}
                  placeholder="e.g. University of Melbourne"
                />
              </Field>
            </div>
            <Field label="Country of study">
              <SearchSelect
                value={r.country}
                onChange={(country) => update(i, { country })}
                options={COUNTRIES}
                disabled={disabled}
                placeholder="Select country…"
              />
            </Field>
            <Field label="Qualification level">
              <SearchSelect
                value={r.qualification}
                onChange={(qualification) => update(i, { qualification })}
                options={QUALIFICATION_LEVELS}
                disabled={disabled}
                placeholder="Select level…"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Field of study" optional>
                <input
                  value={r.field || ''}
                  onChange={(e) => update(i, { field: e.target.value })}
                  disabled={disabled}
                  className={inputCls}
                  placeholder="e.g. Computer Science"
                />
              </Field>
            </div>
            <Field label="Start year">
              <SearchSelect
                value={r.startYear}
                onChange={(startYear) => update(i, { startYear })}
                options={YEARS}
                disabled={disabled}
                placeholder="Year…"
              />
            </Field>
            <Field label={r.current ? 'End year' : 'End year'} optional={r.current}>
              <SearchSelect
                value={r.current ? '' : r.endYear}
                onChange={(endYear) => update(i, { endYear })}
                options={YEARS}
                disabled={disabled || r.current}
                placeholder={r.current ? 'In progress' : 'Year…'}
              />
            </Field>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-grey-700">
                <input
                  type="checkbox"
                  checked={!!r.current}
                  disabled={disabled}
                  onChange={(e) => update(i, { current: e.target.checked, endYear: e.target.checked ? '' : r.endYear })}
                  className="h-4 w-4 rounded border-grey-300 text-primary focus:ring-primary"
                />
                I am currently studying here
              </label>
            </div>
            <div className="sm:col-span-2">
              <Field label="Result / GPA / grade average" optional>
                <input
                  value={r.result || ''}
                  onChange={(e) => update(i, { result: e.target.value })}
                  disabled={disabled}
                  className={inputCls}
                  placeholder="e.g. 3.8 / 4.0 or 85%"
                />
              </Field>
            </div>
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-full border border-grey-300 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-grey-50"
        >
          <Icon name="plus" size={18} /> Add another qualification
        </button>
      )}
    </div>
  )
}
