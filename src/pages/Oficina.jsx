import { useState } from 'react'
import { useOrdens } from '../hooks'
import StatusBadge from '../components/StatusBadge'
import Mensagens from '../components/Mensagens'
import {
  STATUS, MECANICOS, ELEVADORES, updateOrdem, mudarStatus, adicionarItem, removerItem,
  comprimirImagem, brl, total, dataHora, URGENCIA,
} from '../data/store'

function FormItem({ ordem }) {
  const vazio = { descricao: '', tipo: 'peca', valor: '', urgencia: 'media', justificativa: '', foto: null }
  const [f, setF] = useState(vazio)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const foto = async (e) => {
    const file = e.target.files?.[0]
    if (file) setF({ ...f, foto: await comprimirImagem(file) })
  }
  const salvar = (e) => {
    e.preventDefault()
    adicionarItem(ordem.id, { ...f, valor: Number(f.valor) })
    setF(vazio)
    e.target.reset()
  }
  return (
    <form className="form-item" onSubmit={salvar}>
      <h4>Adicionar item ao orçamento</h4>
      <div className="grid2">
        <label>Descrição<input required value={f.descricao} onChange={set('descricao')} placeholder="Ex.: Pastilha de freio" /></label>
        <label>Valor (R$)<input required type="number" min="0" step="0.01" value={f.valor} onChange={set('valor')} /></label>
        <label>Tipo
          <select value={f.tipo} onChange={set('tipo')}><option value="peca">Peça</option><option value="servico">Serviço</option></select>
        </label>
        <label>Urgência
          <select value={f.urgencia} onChange={set('urgencia')}>
            <option value="alta">Alta — segurança</option><option value="media">Média</option><option value="baixa">Baixa — pode aguardar</option>
          </select>
        </label>
      </div>
      <label>Explicação para o cliente<textarea rows="2" value={f.justificativa} onChange={set('justificativa')} placeholder="Por que a troca é necessária?" /></label>
      <label className="foto-input">📷 Foto da peça (abre a câmera no celular/tablet)
        <input type="file" accept="image/*" capture="environment" onChange={foto} />
      </label>
      {f.foto && <img src={f.foto} alt="prévia" className="previa" />}
      <button className="btn">Adicionar item</button>
    </form>
  )
}

function Detalhe({ ordem }) {
  const [nota, setNota] = useState('')
  const campo = (k) => (e) => updateOrdem(ordem.id, (o) => ({ ...o, [k]: k === 'elevador' ? Number(e.target.value) || null : e.target.value }))
  const podeEnviar = ordem.itens.length > 0 && ['recebido', 'diagnostico'].includes(ordem.status)

  return (
    <div className="detalhe">
      <div className="titulo-linha">
        <div>
          <h2>{ordem.veiculo} · {ordem.placa}</h2>
          <p className="muted">{ordem.codigo} · {ordem.cliente} · {Number(ordem.km).toLocaleString('pt-BR')} km</p>
        </div>
        <StatusBadge status={ordem.status} />
      </div>
      {ordem.queixa && <p className="queixa">“{ordem.queixa}”</p>}

      <div className="grid2">
        <label>Mecânico responsável
          <select value={ordem.mecanico} onChange={campo('mecanico')}>
            <option value="">—</option>{MECANICOS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label>Elevador
          <select value={ordem.elevador ?? ''} onChange={campo('elevador')}>
            <option value="">—</option>{ELEVADORES.map((n) => <option key={n} value={n}>Elevador {n}</option>)}
          </select>
        </label>
      </div>

      <h4>Atualizar status (o cliente vê na hora)</h4>
      <div className="status-botoes">
        {STATUS.filter((s) => s.id !== 'aguardando').map((s) => (
          <button key={s.id} className={`btn mini ${ordem.status === s.id ? '' : 'ghost'}`}
            onClick={() => mudarStatus(ordem.id, s.id, nota)}>{s.label}</button>
        ))}
      </div>
      <input className="busca" placeholder="Observação opcional para o cliente (enviada junto com o status)" value={nota} onChange={(e) => setNota(e.target.value)} />

      <h4>Orçamento</h4>
      {ordem.itens.length === 0 && <p className="vazio">Nenhum item ainda.</p>}
      <ul className="itens">
        {ordem.itens.map((i) => (
          <li key={i.id}>
            {i.foto && <img src={i.foto} alt="" />}
            <div className="grow">
              <b>{i.descricao}</b> <span className={`urg urg-${i.urgencia}`}>{URGENCIA[i.urgencia]}</span>
              <div className="muted">{i.justificativa}</div>
            </div>
            <div className="dir">
              <b>{brl(i.valor)}</b>
              <span className={`aprov ap-${i.aprovacao}`}>{i.aprovacao}</span>
              {i.aprovacao === 'pendente' && <button className="link" onClick={() => removerItem(ordem.id, i.id)}>remover</button>}
            </div>
          </li>
        ))}
      </ul>
      {ordem.itens.length > 0 && <p className="total">Total: <b>{brl(total(ordem.itens))}</b></p>}

      {podeEnviar && (
        <button className="btn grande" onClick={() => mudarStatus(ordem.id, 'aguardando', 'Orçamento enviado. Aprove pelo link.')}>
          📤 Enviar orçamento para aprovação do cliente
        </button>
      )}

      {['recebido', 'diagnostico'].includes(ordem.status) && <FormItem ordem={ordem} />}

      <h4>Mensagens com o cliente</h4>
      <Mensagens ordem={ordem} autor="Oficina" />

      <h4>Histórico</h4>
      <ul className="historico">
        {[...ordem.historico].reverse().map((h, k) => (
          <li key={k}><span className="muted">{dataHora(h.data)}</span> <StatusBadge status={h.status} /> {h.nota}</li>
        ))}
      </ul>
    </div>
  )
}

export default function Oficina() {
  const ordens = useOrdens().filter((o) => o.status !== 'entregue')
  const [selId, setSelId] = useState(null)
  const sel = ordens.find((o) => o.id === selId) ?? ordens[0]

  return (
    <section>
      <h1>Oficina</h1>
      <p className="muted">Atualize o status e envie o orçamento direto do elevador — sem parar o serviço para atender a recepção.</p>
      <div className="oficina">
        <aside className="lista-os">
          {ordens.map((o) => (
            <button key={o.id} className={`os-item ${sel?.id === o.id ? 'sel' : ''}`} onClick={() => setSelId(o.id)}>
              <b>{o.placa}</b> <span className="muted">{o.elevador ? `Elev. ${o.elevador}` : 'sem elevador'}</span>
              <div>{o.veiculo}</div>
              <StatusBadge status={o.status} />
            </button>
          ))}
        </aside>
        {sel ? <Detalhe ordem={sel} /> : <p className="vazio">Nenhuma OS aberta.</p>}
      </div>
    </section>
  )
}
