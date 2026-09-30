import { useState } from 'react'
import { enviarMensagem, dataHora } from '../data/store'

// Chat simples entre cliente e oficina (substitui as ligações para a recepção)
export default function Mensagens({ ordem, autor }) {
  const [txt, setTxt] = useState('')
  const enviar = (e) => {
    e.preventDefault()
    if (!txt.trim()) return
    enviarMensagem(ordem.id, autor, txt.trim())
    setTxt('')
  }
  return (
    <div className="chat">
      {(ordem.mensagens || []).map((m, k) => (
        <div key={k} className={`msg ${m.autor === autor ? 'minha' : ''}`}>
          <small>{m.autor} · {dataHora(m.data)}</small>{m.texto}
        </div>
      ))}
      {!(ordem.mensagens || []).length && <p className="vazio">Sem mensagens.</p>}
      <form onSubmit={enviar} className="chat-form">
        <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Escreva uma mensagem…" />
        <button className="btn mini">Enviar</button>
      </form>
    </div>
  )
}
