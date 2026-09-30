// Camada de dados do protótipo.
// Usa localStorage para simular a API: os dados são sincronizados entre abas
// (abra a Recepção numa aba e o Portal do Cliente em outra para ver ao vivo).
// Em produção, estas funções seriam trocadas por chamadas HTTP à API REST.

const KEY = 'acv:ordens:v1'
const EVENT = 'acv:change'

export const STATUS = [
  { id: 'recebido', label: 'Recebido', desc: 'Veículo deu entrada na oficina' },
  { id: 'diagnostico', label: 'Em diagnóstico', desc: 'Mecânico avaliando o veículo' },
  { id: 'aguardando', label: 'Aguardando aprovação', desc: 'Orçamento enviado ao cliente' },
  { id: 'execucao', label: 'Em execução', desc: 'Serviço aprovado e em andamento' },
  { id: 'pronto', label: 'Pronto para retirada', desc: 'Veículo liberado' },
  { id: 'entregue', label: 'Entregue', desc: 'Veículo retirado pelo cliente' },
]

export const MECANICOS = ['Carlos', 'Diego', 'Fábio', 'João', 'Marcos', 'Rogério']
export const ELEVADORES = [1, 2, 3, 4, 5]

export const statusLabel = (id) => STATUS.find((s) => s.id === id)?.label ?? id
export const statusIndex = (id) => STATUS.findIndex((s) => s.id === id)

const uid = () => Math.random().toString(36).slice(2, 10)
const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString()

// Ilustração SVG usada nas fotos de exemplo (sem depender de imagens externas)
function fotoDemo(titulo, cor = '#b45309') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
  <rect width="400" height="260" fill="#1f2937"/>
  <circle cx="200" cy="115" r="70" fill="none" stroke="#9ca3af" stroke-width="14"/>
  <circle cx="200" cy="115" r="30" fill="#4b5563"/>
  <path d="M150 70 q20 20 10 40 q-10 25 15 35" stroke="${cor}" stroke-width="6" fill="none"/>
  <rect x="0" y="210" width="400" height="50" fill="rgba(0,0,0,.55)"/>
  <text x="20" y="242" font-family="Arial" font-size="20" fill="#fff">${titulo}</text>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function seed() {
  const ordens = [
    {
      codigo: 'OS-1041', cliente: 'Mariana Souza', telefone: '41999990001',
      veiculo: 'Honda Civic 2019', placa: 'BEE-4F21', km: 68400, elevador: 1, mecanico: 'Carlos',
      queixa: 'Barulho ao frear e volante trepidando.', status: 'aguardando', entradaH: 5,
      historico: [['recebido', 5, 'Veículo recebido na recepção.'], ['diagnostico', 4.5, 'Iniciado diagnóstico no elevador 1.'], ['aguardando', 3, 'Orçamento enviado ao cliente.']],
      itens: [
        { descricao: 'Pastilhas de freio dianteiras', tipo: 'peca', valor: 289.9, urgencia: 'alta', justificativa: 'Pastilhas com menos de 2 mm — risco de dano ao disco.', foto: fotoDemo('Pastilha dianteira desgastada', '#dc2626') },
        { descricao: 'Retífica dos discos dianteiros', tipo: 'servico', valor: 180, urgencia: 'media', justificativa: 'Disco empenado causa a trepidação no volante.', foto: fotoDemo('Disco com marcas de desgaste') },
        { descricao: 'Troca do fluido de freio (DOT 4)', tipo: 'servico', valor: 120, urgencia: 'baixa', justificativa: 'Fluido com umidade acima do recomendado.' },
      ],
    },
    {
      codigo: 'OS-1042', cliente: 'Paulo Henrique Lima', telefone: '41999990002',
      veiculo: 'VW Gol 1.6 2016', placa: 'AYK-2B09', km: 121000, elevador: 2, mecanico: 'Diego',
      queixa: 'Revisão dos 120 mil km.', status: 'execucao', entradaH: 26,
      historico: [['recebido', 26, 'Veículo recebido.'], ['diagnostico', 25, ''], ['aguardando', 23, 'Orçamento enviado.'], ['execucao', 22.5, 'Cliente aprovou pelo portal em 30 min.']],
      itens: [
        { descricao: 'Kit correia dentada + tensor', tipo: 'peca', valor: 420, urgencia: 'alta', justificativa: 'Troca obrigatória aos 120 mil km.', aprovacao: 'aprovado', foto: fotoDemo('Correia dentada ressecada') },
        { descricao: 'Troca de óleo e filtros', tipo: 'servico', valor: 260, urgencia: 'media', justificativa: 'Revisão periódica.', aprovacao: 'aprovado' },
        { descricao: 'Palhetas do limpador', tipo: 'peca', valor: 75, urgencia: 'baixa', justificativa: 'Borracha ressecada.', aprovacao: 'recusado' },
      ],
    },
    {
      codigo: 'OS-1043', cliente: 'Juliana Martins', telefone: '41999990003',
      veiculo: 'Toyota Corolla 2021', placa: 'RHT-7C33', km: 40250, elevador: 3, mecanico: 'Fábio',
      queixa: 'Luz da injeção acesa no painel.', status: 'diagnostico', entradaH: 1.5,
      historico: [['recebido', 1.5, 'Veículo recebido.'], ['diagnostico', 1, 'Scanner conectado.']],
      itens: [],
    },
    {
      codigo: 'OS-1044', cliente: 'Roberto Almeida', telefone: '41999990004',
      veiculo: 'Fiat Argo 2022', placa: 'SDF-1A87', km: 22300, elevador: null, mecanico: '',
      queixa: 'Ar-condicionado não gela.', status: 'recebido', entradaH: 0.3,
      historico: [['recebido', 0.3, 'Veículo recebido.']],
      itens: [],
    },
    {
      codigo: 'OS-1040', cliente: 'Camila Rocha', telefone: '41999990005',
      veiculo: 'Hyundai HB20 2018', placa: 'QWE-9D12', km: 75800, elevador: 4, mecanico: 'João',
      queixa: 'Amortecedor traseiro fazendo barulho.', status: 'pronto', entradaH: 30,
      historico: [['recebido', 30, ''], ['diagnostico', 29, ''], ['aguardando', 28, 'Orçamento enviado.'], ['execucao', 27, 'Aprovado pelo portal.'], ['pronto', 2, 'Teste de rodagem OK.']],
      itens: [
        { descricao: 'Par de amortecedores traseiros', tipo: 'peca', valor: 690, urgencia: 'alta', justificativa: 'Amortecedor com vazamento de óleo.', aprovacao: 'aprovado', foto: fotoDemo('Amortecedor com vazamento') },
        { descricao: 'Mão de obra suspensão', tipo: 'servico', valor: 220, urgencia: 'alta', justificativa: '', aprovacao: 'aprovado' },
      ],
    },
  ]

  return ordens.map((o) => ({
    id: uid(),
    token: uid() + uid(),
    codigo: o.codigo, cliente: o.cliente, telefone: o.telefone, veiculo: o.veiculo,
    placa: o.placa, km: o.km, elevador: o.elevador, mecanico: o.mecanico, queixa: o.queixa,
    status: o.status,
    entrada: hoursAgo(o.entradaH),
    historico: o.historico.map(([status, h, nota]) => ({ status, data: hoursAgo(h), nota })),
    itens: o.itens.map((i) => ({ id: uid(), aprovacao: 'pendente', foto: null, ...i })),
    mensagens: [],
  }))
}

export function getOrdens() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage indisponível: cai no seed */ }
  const inicial = seed()
  saveOrdens(inicial, false)
  return inicial
}

function saveOrdens(ordens, notify = true) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ordens))
  } catch (e) {
    alert('Não foi possível salvar (armazenamento cheio?). Tente uma foto menor.')
  }
  if (notify) window.dispatchEvent(new Event(EVENT))
}

export function subscribe(fn) {
  const onStorage = (e) => e.key === KEY && fn()
  window.addEventListener(EVENT, fn)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, fn)
    window.removeEventListener('storage', onStorage)
  }
}

export function resetDemo() {
  saveOrdens(seed())
}

export function updateOrdem(id, fn) {
  const ordens = getOrdens().map((o) => (o.id === id ? fn(structuredClone(o)) : o))
  saveOrdens(ordens)
}

export function criarOrdem(dados) {
  const ordens = getOrdens()
  const maior = Math.max(1000, ...ordens.map((o) => Number(o.codigo.split('-')[1])))
  const agora = new Date().toISOString()
  const nova = {
    id: uid(), token: uid() + uid(), codigo: `OS-${maior + 1}`,
    elevador: null, mecanico: '', ...dados,
    status: 'recebido', entrada: agora,
    historico: [{ status: 'recebido', data: agora, nota: 'Veículo recebido na recepção.' }],
    itens: [], mensagens: [],
  }
  saveOrdens([nova, ...ordens])
  return nova
}

export function mudarStatus(id, status, nota = '') {
  updateOrdem(id, (o) => {
    o.status = status
    o.historico.push({ status, data: new Date().toISOString(), nota })
    return o
  })
}

export function adicionarItem(id, item) {
  updateOrdem(id, (o) => {
    o.itens.push({ id: uid(), aprovacao: 'pendente', ...item })
    return o
  })
}

export function removerItem(id, itemId) {
  updateOrdem(id, (o) => {
    o.itens = o.itens.filter((i) => i.id !== itemId)
    return o
  })
}

// Cliente responde o orçamento pelo portal
export function responderOrcamento(id, decisoes) {
  updateOrdem(id, (o) => {
    o.itens = o.itens.map((i) => (decisoes[i.id] ? { ...i, aprovacao: decisoes[i.id] } : i))
    const aprovados = o.itens.filter((i) => i.aprovacao === 'aprovado').length
    o.status = 'execucao'
    o.historico.push({
      status: 'execucao',
      data: new Date().toISOString(),
      nota: `Cliente respondeu pelo portal: ${aprovados} de ${o.itens.length} itens aprovados.`,
    })
    return o
  })
}

export function enviarMensagem(id, autor, texto) {
  updateOrdem(id, (o) => {
    o.mensagens = [...(o.mensagens || []), { autor, texto, data: new Date().toISOString() }]
    return o
  })
}

// ---------- utilidades ----------
export const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const dataHora = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export function duracao(ms) {
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return h < 24 ? `${h}h ${String(min % 60).padStart(2, '0')}min` : `${Math.floor(h / 24)}d ${h % 24}h`
}

export const total = (itens, filtro = () => true) => itens.filter(filtro).reduce((s, i) => s + Number(i.valor), 0)

export function linkCliente(ordem) {
  const base = window.location.href.split('#')[0]
  return `${base}#/os/${ordem.token}`
}

export function linkWhatsApp(ordem, texto) {
  const tel = '55' + String(ordem.telefone).replace(/\D/g, '')
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`
}

// Tempo médio entre "orçamento enviado" e a resposta do cliente
export function tempoMedioAprovacao(ordens) {
  const tempos = []
  ordens.forEach((o) => {
    const h = o.historico
    const i = h.findIndex((e) => e.status === 'aguardando')
    if (i >= 0 && h[i + 1]) tempos.push(new Date(h[i + 1].data) - new Date(h[i].data))
  })
  return tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : null
}

// Redimensiona a foto tirada no celular antes de salvar (economiza espaço)
export function comprimirImagem(file, max = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = img.width * escala
        c.height = img.height * escala
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.7))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export const URGENCIA = { alta: 'alta', media: 'média', baixa: 'baixa' }
