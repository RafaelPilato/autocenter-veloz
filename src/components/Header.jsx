const links = [
  { href: '#/recepcao', label: 'Recepção', rota: '/recepcao' },
  { href: '#/oficina', label: 'Oficina', rota: '/oficina' },
]

export default function Header({ rota }) {
  return (
    <header className="topo">
      <div className="container topo-inner">
        <a href="#/" className="marca"> <span>Veloz <b>Acompanha</b></span></a>
        <nav>
          {links.map((l) => (
            <a key={l.href} href={l.href} className={rota.startsWith(l.rota) ? 'ativo' : ''}>{l.label}</a>
          ))}
        </nav>
      </div>
    </header>
  )
}
