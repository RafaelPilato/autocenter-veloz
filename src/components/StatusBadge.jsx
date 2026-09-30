import { statusLabel } from '../data/store'

export default function StatusBadge({ status }) {
  return <span className={`badge st-${status}`}>{statusLabel(status)}</span>
}
