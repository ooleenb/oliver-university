import { useRef } from 'react'
import Icon from '../Icon.jsx'

// 文档要求清单：按类别展示要求（含说明与 Required/Optional 标签），
// 每类可上传、可查看已上传文件。哪些必需取决于 program 等级。

export const DOC_CATALOG = [
  { type: 'passport', label: 'Passport / Photo ID', hint: 'Bio-data page of your passport or a government-issued photo ID.' },
  { type: 'transcript', label: 'Academic transcript', hint: 'Official transcript listing subjects and results from your most recent studies.' },
  { type: 'certificate', label: 'Degree / completion certificate', hint: 'Certificate confirming completion of a prior qualification.' },
  { type: 'english_test', label: 'English proficiency test', hint: 'IELTS, TOEFL, PTE Academic or equivalent — taken within the last 2 years.' },
  { type: 'cv', label: 'CV / Résumé', hint: 'A current curriculum vitae outlining education and experience.' },
  { type: 'other', label: 'Other supporting document', hint: 'Anything else that supports your application (portfolio, references, etc.).' },
]

// 判断是否研究生/研究型课程
function isPostgrad(program) {
  const s = `${program?.level || ''}`.toLowerCase()
  return /master|phd|doctor|postgrad|research/.test(s)
}

// 返回该 program 下每类文档是否 required
export function docRequirements(program) {
  const pg = isPostgrad(program)
  return {
    passport: true,
    transcript: true,
    certificate: pg,
    english_test: true,
    cv: pg,
    other: false,
  }
}

export default function DocumentsChecklist({ program, documents = [], editable, onUpload, onDownload, busy }) {
  const req = docRequirements(program)
  const fileRefs = useRef({})

  const docsByType = (t) => documents.filter((d) => d.type === t)

  return (
    <div className="space-y-3">
      {DOC_CATALOG.map((cat) => {
        const required = req[cat.type]
        const files = docsByType(cat.type)
        const satisfied = files.length > 0
        return (
          <div key={cat.type} className="rounded-xl border border-grey-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    satisfied ? 'bg-emerald-100 text-emerald-700' : required ? 'bg-primary/10 text-primary' : 'bg-grey-100 text-grey-400'
                  }`}
                >
                  <Icon name={satisfied ? 'check' : 'file'} size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{cat.label}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        required ? 'bg-primary/10 text-primary' : 'bg-grey-100 text-grey-500'
                      }`}
                    >
                      {required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-grey-500">{cat.hint}</p>
                </div>
              </div>

              {editable && (
                <>
                  <input
                    ref={(el) => (fileRefs.current[cat.type] = el)}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) onUpload(cat.type, f)
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRefs.current[cat.type]?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-grey-300 px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-grey-50 disabled:opacity-60"
                  >
                    <Icon name="upload" size={16} /> Upload
                  </button>
                </>
              )}
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5 border-t border-grey-100 pt-3">
                {files.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-sm">
                    <Icon name="file" size={16} className="text-grey-400" />
                    <span className="min-w-0 flex-1 truncate text-grey-700">{d.original_name}</span>
                    <button
                      type="button"
                      onClick={() => onDownload(d)}
                      className="shrink-0 text-sm font-semibold text-primary hover:underline"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
