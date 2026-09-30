import { STATUS, statusIndex, dataHora } from '../data/store'

// Linha do tempo do conserto (usada no portal do cliente)
export default function Timeline({ ordem }) {
  const atual = statusIndex(ordem.status)
  const quando = (id) => [...ordem.historico].reverse().find((h) => h.status === id)?.data
  return (
    <ol className="timeline">
      {STATUS.map((s, i) => {
        const estado = i < atual ? 'feito' : i === atual ? 'atual' : 'futuro'
        const d = quando(s.id)
        return (
          <li key={s.id} className={estado}>
            <span className="ponto">{i < atual ? '✓' : i + 1}</span>
            <div>
              <strong>{s.label}</strong>
              <small>{estado === 'futuro' ? s.desc : d ? dataHora(d) : ''}</small>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
