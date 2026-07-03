import SearchSelect from './SearchSelect.jsx'
import SuburbAutocomplete from './SuburbAutocomplete.jsx'
import { COUNTRIES } from '../../data/countries.js'

// 地址填写：先选 Australia / Overseas。
// Australia：unit(optional) + street number + street + suburb 自动补全 → 回填 state/postcode（只读）。
// Overseas：address line 1/2 + city + state/region + postcode + country。
// value 形如 { mode, unit, streetNo, street, suburb, state, postcode, line1, line2, city, region, country }
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

const inputCls =
  'w-full rounded-lg border border-grey-200 px-4 py-2.5 outline-none transition-colors focus:border-ink disabled:bg-grey-50 disabled:text-grey-400'

export default function AddressFields({ value, onChange }) {
  const v = value || {}
  const mode = v.mode || 'AU'
  const set = (patch) => onChange({ ...v, ...patch })

  return (
    <div className="space-y-4">
      {/* 模式切换 */}
      <div className="inline-flex rounded-lg border border-grey-200 p-1">
        {[
          { key: 'AU', label: 'Australia' },
          { key: 'OS', label: 'Overseas' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => set({ mode: opt.key })}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === opt.key ? 'bg-ink text-white' : 'text-grey-600 hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {mode === 'AU' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Unit / Apartment" optional>
            <input value={v.unit || ''} onChange={(e) => set({ unit: e.target.value })} className={inputCls} placeholder="e.g. 12" />
          </Field>
          <Field label="Street number">
            <input value={v.streetNo || ''} onChange={(e) => set({ streetNo: e.target.value })} className={inputCls} placeholder="e.g. 145" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Street name">
              <input value={v.street || ''} onChange={(e) => set({ street: e.target.value })} className={inputCls} placeholder="e.g. Swanston Street" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Suburb">
              <SuburbAutocomplete
                value={v.suburb}
                onChange={(suburb) => set({ suburb, state: '', postcode: '' })}
                onSelect={(r) => set({ suburb: r.suburb, state: r.state, postcode: r.postcode })}
              />
              <p className="mt-1 text-xs text-grey-400">Select a suburb to fill in state and postcode automatically.</p>
            </Field>
          </div>
          <Field label="State">
            <input value={v.state || ''} disabled readOnly className={inputCls} placeholder="Auto-filled" />
          </Field>
          <Field label="Postcode">
            <input value={v.postcode || ''} disabled readOnly className={inputCls} placeholder="Auto-filled" />
          </Field>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Address line 1">
              <input value={v.line1 || ''} onChange={(e) => set({ line1: e.target.value })} className={inputCls} placeholder="Street address" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address line 2" optional>
              <input value={v.line2 || ''} onChange={(e) => set({ line2: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="City / Town">
            <input value={v.city || ''} onChange={(e) => set({ city: e.target.value })} className={inputCls} />
          </Field>
          <Field label="State / Province / Region" optional>
            <input value={v.region || ''} onChange={(e) => set({ region: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Postcode / ZIP" optional>
            <input value={v.postcode || ''} onChange={(e) => set({ postcode: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Country">
            <SearchSelect value={v.country} onChange={(country) => set({ country })} options={COUNTRIES} placeholder="Select country…" />
          </Field>
        </div>
      )}
    </div>
  )
}
