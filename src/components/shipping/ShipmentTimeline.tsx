import { Fragment } from 'react'
import { AlertTriangle, Calendar, CheckCircle2, MapPin, Navigation, Package, PackageCheck, Truck } from 'lucide-react'
import type { ShipmentTracking } from '@/lib/ithink'

const STAGES = [
  { label: 'Booked', icon: Package },
  { label: 'Picked up', icon: PackageCheck },
  { label: 'In transit', icon: Truck },
  { label: 'Out for delivery', icon: Navigation },
  { label: 'Delivered', icon: CheckCircle2 },
] as const

// iThink gives free-text courier statuses, so the stage is inferred from keywords.
function stageOf(status: string): { stage: number; exception: boolean } {
  const s = status.toLowerCase()
  // Exceptions stop the progress bar where the problem happened
  if (/cancel/.test(s)) return { stage: 0, exception: true }
  if (/undeliver|not delivered|delivery failed|attempt/.test(s)) return { stage: 3, exception: true }
  if (/rto|return|lost|damag|failed/.test(s)) return { stage: 2, exception: true }
  if (/out for delivery|ofd/.test(s)) return { stage: 3, exception: false }
  if (/deliver/.test(s)) return { stage: 4, exception: false }
  if (/transit|reached|arrived|hub|dispatch|shipped|forward|depart|bagged|connected/.test(s)) return { stage: 2, exception: false }
  if (/pending|scheduled|awaiting|not picked|manifest|created|booked/.test(s)) return { stage: 0, exception: false }
  if (/pick/.test(s)) return { stage: 1, exception: false }
  return { stage: 0, exception: false }
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date
}

const dayLabel = (date: Date) =>
  date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const timeLabel = (date: Date) =>
  date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

function relativeTime(date: Date): string {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

type Scan = { status: string; location: string; dateTime: string; remark?: string }

export default function ShipmentTimeline({ tracking }: { tracking: ShipmentTracking }) {
  const { stage, exception } = stageOf(tracking.currentStatus)
  const delivered = stage === 4 && !exception

  // Before pickup iThink returns no scan list, only the current status; show that as the first entry.
  const history: Scan[] =
    tracking.history.length > 0
      ? tracking.history
      : tracking.currentStatus && tracking.currentStatus !== 'Unknown'
        ? [{ status: tracking.currentStatus, location: tracking.lastLocation ?? '', dateTime: tracking.lastUpdate ?? '' }]
        : []

  // Newest first when every date is readable, otherwise keep iThink's order
  const dated = history.map((scan) => ({ scan, date: parseDate(scan.dateTime) }))
  const sortable = dated.length > 1 && dated.every((d) => d.date)
  const ordered = sortable ? [...dated].sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime()) : dated

  // Group by calendar day so the journey reads like a diary
  const groups: { day: string; items: typeof ordered }[] = []
  for (const entry of ordered) {
    const day = entry.date ? dayLabel(entry.date) : 'Update'
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.items.push(entry)
    else groups.push({ day, items: [entry] })
  }

  const lastUpdate = parseDate(tracking.lastUpdate)
  const tone = exception
    ? { badge: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500', fill: 'bg-amber-500', ring: 'ring-amber-500/25' }
    : delivered
      ? { badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500', fill: 'bg-emerald-600', ring: 'ring-emerald-500/25' }
      : { badge: 'bg-orange-50 text-[#B8610A] ring-orange-200', dot: 'bg-[#E07B0C]', fill: 'bg-[#E07B0C]', ring: 'ring-[#E07B0C]/25' }

  let globalIndex = -1

  return (
    <div className="space-y-6">
      {/* Current status */}
      <section className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Current status</p>
            <span className={`mt-1.5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ring-1 ${tone.badge}`}>
              {exception ? <AlertTriangle className="h-4 w-4" /> : <span className={`h-2 w-2 rounded-full ${tone.dot} ${delivered ? '' : 'animate-pulse'}`} />}
              {tracking.currentStatus}
            </span>
            {lastUpdate && <p className="mt-1.5 text-xs text-stone-400">Updated {relativeTime(lastUpdate)}</p>}
          </div>
          {tracking.courier && (
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Courier</p>
              <p className="mt-1.5 text-sm font-bold text-stone-900">{tracking.courier}</p>
            </div>
          )}
        </div>

        {/* Key facts */}
        {((tracking.expectedDeliveryDate && !delivered) || tracking.lastLocation) && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {tracking.expectedDeliveryDate && !delivered && (
              <div className="flex items-center gap-3 rounded-xl bg-orange-50/70 px-3.5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#E07B0C] shadow-xs">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-stone-500">Expected delivery</p>
                  <p className="text-sm font-bold text-stone-900">
                    {parseDate(tracking.expectedDeliveryDate)
                      ? dayLabel(parseDate(tracking.expectedDeliveryDate) as Date)
                      : tracking.expectedDeliveryDate}
                  </p>
                </div>
              </div>
            )}
            {tracking.lastLocation && (
              <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-3.5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-stone-500 shadow-xs">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-stone-500">Last location</p>
                  <p className="truncate text-sm font-bold text-stone-900">{tracking.lastLocation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress: five equal columns, the connector runs behind the circles */}
        <div className="mt-6 grid grid-cols-5">
          {STAGES.map((step, i) => {
            const Icon = step.icon
            const done = i < stage || delivered
            const current = i === stage && !delivered
            const reached = i <= stage || delivered
            return (
              <Fragment key={step.label}>
                <div className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <span className={`absolute left-0 top-4 h-0.5 w-1/2 -translate-y-1/2 ${reached ? tone.fill : 'bg-stone-200'}`} />
                  )}
                  {i < STAGES.length - 1 && (
                    <span className={`absolute right-0 top-4 h-0.5 w-1/2 -translate-y-1/2 ${i < stage || delivered ? tone.fill : 'bg-stone-200'}`} />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition ${
                      done
                        ? `${tone.fill} text-white`
                        : current
                          ? `${tone.fill} text-white ring-4 ${tone.ring}`
                          : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`mt-2 px-0.5 text-[10px] sm:text-[11px] font-semibold leading-tight ${
                      done || current ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </Fragment>
            )
          })}
        </div>
      </section>

      {/* Scan history */}
      <section>
        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">Shipment journey</h4>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-center">
            <Package className="mx-auto h-6 w-6 text-stone-300" />
            <p className="mt-2 text-sm font-semibold text-stone-700">Waiting for the first scan</p>
            <p className="mx-auto mt-0.5 max-w-xs text-xs text-stone-500">
              The shipment is booked. Scans appear here as soon as the courier picks up the parcel.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.day}>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-700">{group.day}</span>
                  <span className="h-px flex-1 bg-stone-200" />
                </div>
                <ol className="space-y-0.5">
                  {group.items.map(({ scan, date }, idx) => {
                    globalIndex += 1
                    const latest = globalIndex === 0
                    const lastInGroup = idx === group.items.length - 1
                    const info = stageOf(scan.status)
                    const Icon = info.exception ? AlertTriangle : STAGES[info.stage].icon
                    return (
                      <li key={`${scan.status}-${scan.dateTime}-${idx}`} className="relative flex gap-3">
                        {!lastInGroup && <span className="absolute bottom-0 left-[15px] top-9 w-0.5 rounded-full bg-stone-200" />}
                        <span
                          className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            latest
                              ? `${info.exception ? 'bg-amber-500' : tone.fill} text-white ring-4 ${info.exception ? 'ring-amber-500/20' : tone.ring}`
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className={`min-w-0 flex-1 rounded-xl px-3 py-2 ${latest ? 'bg-orange-50/60' : ''}`}>
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-sm first-letter:uppercase ${latest ? 'font-bold text-stone-900' : 'font-semibold text-stone-700'}`}>
                              {scan.status}
                            </p>
                            {date && <p className="shrink-0 pt-0.5 text-[11px] font-medium text-stone-400">{timeLabel(date)}</p>}
                          </div>
                          {scan.location && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                              <MapPin className="h-3 w-3 shrink-0 text-stone-400" />
                              <span className="truncate">{scan.location}</span>
                            </p>
                          )}
                          {scan.remark && <p className="mt-0.5 text-xs text-stone-400">{scan.remark}</p>}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
