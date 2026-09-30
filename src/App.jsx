import { useHashRoute } from './hooks'
import Header from './components/Header'
import Home from './pages/Home'
import Recepcao from './pages/Recepcao'
import Oficina from './pages/Oficina'
import PortalCliente from './pages/PortalCliente'

export default function App() {
  const rota = useHashRoute()

  if (rota.startsWith('/os/')) {
    return <PortalCliente token={rota.slice(4)} />
  }

  let pagina = <Home />
  if (rota.startsWith('/recepcao')) pagina = <Recepcao />
  if (rota.startsWith('/oficina')) pagina = <Oficina />

  return (
    <>
      <Header rota={rota} />
      <main className="container">{pagina}</main>
      <footer className="rodape">
        Auto Center Veloz · Protótipo acadêmico — dados de demonstração salvos apenas neste navegador.
      </footer>
    </>
  )
}
