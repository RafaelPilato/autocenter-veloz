import { useState } from 'react'
import { useOrdens } from '../hooks'
import {
  STATUS, criarOrdem, mudarStatus, resetDemo, duracao, brl, total,
  linkCliente, linkWhatsApp, tempoMedioAprovacao,
} from '../data/store'

function NovaOS({ onClose }) {
  const [f, setF] = useState({ cliente: '', telefone: '', veiculo: '', placa: '', km: '', queixa: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const salvar = (e) => {
    e.preventDefault()
    const nova = criarOrdem({ ...f, placa: f.placa.toUpperCase(), km: Number(f.km) || 0 })
    onClose(nova)
  }
  return (
    <div className="modal-fundo" onClick={() => onClose()}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={salvar}>
        <h2>Nova ordem de serviço</h2>
        <div className="grid2">
          <label>Cliente<input required value={f.cliente} onChange={set('cliente')} /></label>
          <label>WhatsApp<input required placeholder="41999998888" value={f.telefone} onChange={set('telefone')} /></label>
          <label>Veículo<input required placeholder="Modelo e ano" value={f.veiculo} onChange={set('veiculo')} /></label>
          <label>Placa<input required value={f.placa} onChange={set('placa')} /></label>
          <label>KM<input type="number" value={f.km} onChange={set('km')} /></label>
        </div>
        <label>Relato do cliente<textarea rows="3" value={f.queixa} onChange={set('queixa')} /></label>
        <div className="acoes">
          <button type="button" className="btn ghost" onClick={() => onClose()}>Cancelar</button>
          <button className="btn">Registrar entrada</button>
        </div>
      </form>
    </div>
  )
}

function Card({ o }) {
  const [copiado, setCopiado] = useState(false)
  const idx = STATUS.findIndex((s) => s.id === o.status)
  const proximo = STATUS[idx + 1]
  const link = linkCliente(o)
  const msg = `Olá, ${o.cliente.split(' ')[0]}! Aqui é da Auto Center Veloz. Acompanhe o conserto do seu ${o.veiculo} (${o.placa}) e aprove o orçamento por este link: ${link}`
  const copiar = async () => {
    try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 1500) } catch { prompt('Copie o link:', link) }
  }
  const noPatio = Date.now() - new Date(o.entrada)
  const alerta = o.status === 'aguardando'
  return (
    <article className={`card ${alerta ? 'alerta' : ''}`}>
      <div className="card-top">
        <b>{o.placa}</b>
        <span className="muted">{o.codigo}</span>
      </div>
      <div>{o.veiculo}</div>
      <div className="muted">{o.cliente}</div>
      <div className="card-meta">
        <span>⏱ {duracao(noPatio)} no pátio</span>
        {o.elevador && <span>Elev. {o.elevador}</span>}
        {o.mecanico && <span>🔧 {o.mecanico}</span>}
      </div>
      {o.itens.length > 0 && <div className="card-meta"><span>Orçamento: {brl(total(o.itens))}</span></div>}
      <div className="card-acoes">
        <a className="btn mini wpp" href={linkWhatsApp(o, msg)} target="_blank" rel="noreferrer">WhatsApp</a>
        <button className="btn mini ghost" onClick={copiar}>{copiado ? 'Copiado!' : 'Copiar link'}</button>
        {proximo && o.status !== 'aguardando' && (
          <button className="btn mini ghost" onClick={() => mudarStatus(o.id, proximo.id)} title={`Mover para ${proximo.label}`}>→</button>
        )}
      </div>
    </article>
  )
}

export default function Recepcao() {
  const ordens = useOrdens()
  const [modal, setModal] = useState(false)
  const [busca, setBusca] = useState('')

  const filtradas = ordens.filter((o) =>
    `${o.placa} ${o.cliente} ${o.codigo} ${o.veiculo}`.toLowerCase().includes(busca.toLowerCase()))
  const noPatio = ordens.filter((o) => o.status !== 'entregue')
  const aguardando = ordens.filter((o) => o.status === 'aguardando')
  const media = tempoMedioAprovacao(ordens)

  return (
    <section>
      <div className="titulo-linha">
        <h1>Painel da Recepção</h1>
        <div className="acoes">
          <button className="btn ghost" onClick={() => confirm('Restaurar os dados de demonstração?') && resetDemo()}>Restaurar demo</button>
          <button className="btn" onClick={() => setModal(true)}>+ Nova OS</button>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Veículos no pátio</span><b>{noPatio.length}</b></div>
        <div className="kpi"><span>Elevadores ocupados</span><b>{new Set(noPatio.map((o) => o.elevador).filter(Boolean)).size}/5</b></div>
        <div className={`kpi ${aguardando.length ? 'kpi-alerta' : ''}`}><span>Aguardando cliente</span><b>{aguardando.length}</b></div>
        <div className="kpi"><span>Tempo médio de aprovação</span><b>{media ? duracao(media) : '—'}</b></div>
      </div>

      <input className="busca" placeholder="Buscar por placa, cliente ou OS…" value={busca} onChange={(e) => setBusca(e.target.value)} />

      <div className="kanban">
        {STATUS.map((s) => {
          const lista = filtradas.filter((o) => o.status === s.id)
          return (
            <div key={s.id} className="coluna">
              <h3 className={`st-${s.id}`}>{s.label} <span>{lista.length}</span></h3>
              {lista.map((o) => <Card key={o.id} o={o} />)}
              {!lista.length && <p className="vazio">Nenhum veículo</p>}
            </div>
          )
        })}
      </div>

      {modal && <NovaOS onClose={() => setModal(false)} />}
    </section>
  )
}
