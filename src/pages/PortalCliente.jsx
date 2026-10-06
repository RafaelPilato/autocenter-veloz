import { useState } from 'react'
import { useOrdens } from '../hooks'
import Timeline from '../components/Timeline'
import StatusBadge from '../components/StatusBadge'
import Mensagens from '../components/Mensagens'
import { responderOrcamento, brl, total, dataHora, statusLabel, URGENCIA } from '../data/store'

const TEL_OFICINA = '554130000000' // telefone fictício da oficina

export default function PortalCliente({ token }) {
  const ordem = useOrdens().find((o) => o.token === token)
  const [decisoes, setDecisoes] = useState({})
  const [foto, setFoto] = useState(null)

  if (!ordem) {
    return (
      <div className="portal"><div className="portal-card">
        <h2>Link inválido ou expirado</h2>
        <p>Entre em contato com a Auto Center Veloz.</p>
        <a className="btn" href="#/">Voltar</a>
      </div></div>
    )
  }

  const aguardando = ordem.status === 'aguardando'
  const decisao = (i) => (aguardando ? decisoes[i.id] ?? 'aprovado' : i.aprovacao)
  const marcar = (id, v) => setDecisoes({ ...decisoes, [id]: v })
  const aprovadoTotal = total(ordem.itens, (i) => decisao(i) === 'aprovado')
  const ultima = ordem.historico[ordem.historico.length - 1]

  const confirmar = () => {
    const final = Object.fromEntries(ordem.itens.map((i) => [i.id, decisao(i)]))
    responderOrcamento(ordem.id, final)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="portal">
      <header className="portal-topo">
        <span>Auto Center <b>Veloz</b></span>
      </header>

      <div className="portal-card">
        <p className="muted">Olá, {ordem.cliente.split(' ')[0]} 👋</p>
        <h2>{ordem.veiculo}</h2>
        <p className="muted">{ordem.placa} · {ordem.codigo}</p>
        <div className="status-grande">
          <StatusBadge status={ordem.status} />
          <small>Atualizado em {dataHora(ultima.data)}</small>
        </div>
        {ultima.nota && <p className="nota">💬 {ultima.nota}</p>}
        {ordem.status === 'pronto' && <p className="pronto">✅ Seu carro está pronto! Pode vir buscar.</p>}
      </div>

      {aguardando && (
        <div className="portal-card aviso">
          <b>Seu orçamento está pronto.</b> Veja as fotos, escolha o que deseja fazer e confirme abaixo.
          Itens de urgência <b>alta</b> envolvem segurança.
        </div>
      )}

      {ordem.itens.length > 0 && (
        <div className="portal-card">
          <h3>Orçamento</h3>
          {ordem.itens.map((i) => (
            <div key={i.id} className={`orc-item ${decisao(i) === 'recusado' ? 'riscado' : ''}`}>
              {i.foto && <img src={i.foto} alt={i.descricao} onClick={() => setFoto(i.foto)} />}
              <div className="grow">
                <div className="orc-linha"><b>{i.descricao}</b><b>{brl(i.valor)}</b></div>
                <span className={`urg urg-${i.urgencia}`}>urgência {URGENCIA[i.urgencia]}</span>
                {i.justificativa && <p className="muted">{i.justificativa}</p>}
                {aguardando ? (
                  <div className="toggle">
                    <button className={decisao(i) === 'aprovado' ? 'on ok' : ''} onClick={() => marcar(i.id, 'aprovado')}>✓ Aprovar</button>
                    <button className={decisao(i) === 'recusado' ? 'on no' : ''} onClick={() => marcar(i.id, 'recusado')}>✕ Agora não</button>
                  </div>
                ) : (
                  <span className={`aprov ap-${i.aprovacao}`}>{i.aprovacao}</span>
                )}
              </div>
            </div>
          ))}
          <div className="orc-total">
            <span>{aguardando ? 'Total selecionado' : 'Total aprovado'}</span>
            <b>{brl(aprovadoTotal)}</b>
          </div>
          {aguardando && <button className="btn grande" onClick={confirmar}>Confirmar e liberar serviço</button>}
        </div>
      )}

      <div className="portal-card">
        <h3>Andamento</h3>
        <Timeline ordem={ordem} />
      </div>

      <div className="portal-card">
        <h3>Fale com a oficina</h3>
        <Mensagens ordem={ordem} autor="Cliente" />
        <a className="btn ghost full" href={`https://wa.me/${TEL_OFICINA}`} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
      </div>

      <p className="rodape">Status atual: {statusLabel(ordem.status)} · <a href="#/">sobre o protótipo</a></p>

      {foto && <div className="modal-fundo" onClick={() => setFoto(null)}><img className="foto-zoom" src={foto} alt="" /></div>}
    </div>
  )
}
