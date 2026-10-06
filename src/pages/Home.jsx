import { useOrdens } from '../hooks'

export default function Home() {
  const ordens = useOrdens()
  const demo = ordens.find((o) => o.status === 'aguardando') ?? ordens[0]

  return (
    <section className="home">
      <div className="hero">
        <h1>Menos telefone, mais carro pronto.</h1>
        <p>
          O <b>Veloz Acompanha</b> conecta recepção, mecânicos e clientes da Auto Center Veloz:
          o cliente acompanha o conserto em tempo real, vê as fotos das peças com defeito e
          aprova o orçamento pelo celular — sem ligações.
        </p>
      </div>

      <div className="perfis">
        <a className="perfil" href="#/recepcao">
          <span className="ico"></span>
          <h3>Recepção</h3>
          <p>Painel do pátio: entrada de veículos, status de cada OS e envio do link ao cliente.</p>
        </a>
        <a className="perfil" href="#/oficina">
          <span className="ico"></span>
          <h3>Oficina (mecânico)</h3>
          <p>No tablet do elevador: atualizar status, montar orçamento e fotografar as peças.</p>
        </a>
        {demo && (
          <a className="perfil destaque" href={`#/os/${demo.token}`}>
            <span className="ico"></span>
            <h3>Portal do Cliente</h3>
            <p>Visão do cliente ({demo.cliente.split(' ')[0]}, {demo.veiculo}) aberta pelo link do WhatsApp.</p>
          </a>
        )}
      </div>
    </section>
  )
}
