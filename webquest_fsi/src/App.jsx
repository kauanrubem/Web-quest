import { useCallback, useEffect, useMemo, useState } from 'react'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')

const menuItems = [
  ['introducao', 'Introducao'],
  ['tarefa', 'Tarefa'],
  ['processo', 'Processo'],
  ['recursos', 'Recursos'],
  ['avaliacao', 'Avaliacao'],
  ['conclusao', 'Conclusao'],
  ['envio', 'Envio'],
  ['acervo', 'Trabalhos enviados'],
  ['monitor', 'Monitor'],
]

const introParagraphs = [
  'A preocupacao com o impacto ambiental das tecnologias esta crescendo cada vez mais. Conceitos como TI Verde (Green IT), Sistemas de Informacao Verde e Computacao Sustentavel sao essenciais para repensarmos a maneira como utilizamos e desenvolvemos tecnologia. A sustentabilidade tecnologica visa minimizar os danos ao meio ambiente e promover praticas mais eficientes no uso de recursos. Nesta WebQuest, voces irao explorar como a TI Verde pode ser aplicada em diferentes areas da tecnologia e como isso influencia diretamente o desenvolvimento sustentavel.',
  'No contexto atual, o crescimento exponencial do uso de Inteligencia Artificial (IA) traz novos desafios para a sustentabilidade tecnologica. O treinamento de grandes modelos de IA e a infraestrutura necessaria para mante-los em operacao demandam um consumo significativo de energia eletrica e recursos computacionais. Estudos recentes indicam que um unico treinamento de um modelo de IA de grande escala pode gerar uma quantidade consideravel de emissoes de carbono, equivalente a cinco vezes as emissoes de um carro durante toda sua vida util. Isso nos leva a questionar como podemos equilibrar o avanco tecnologico com a responsabilidade ambiental, buscando solucoes que otimizem o consumo energetico e priorizem fontes renovaveis de energia.',
  'Diante desse cenario, voces sao convidados a investigar e propor solucoes para os seguintes aspectos: como podemos implementar praticas de TI Verde em diferentes contextos tecnologicos? Quais sao as estrategias mais eficientes para reduzir o impacto ambiental dos data centers e sistemas de IA? Como as empresas podem adotar politicas sustentaveis sem comprometer sua eficiencia operacional? Ao longo desta pesquisa, voces terao a oportunidade de explorar casos reais, analisar dados e desenvolver propostas praticas para um futuro tecnologico mais sustentavel.',
]

const taskTopics = [
  'Definicao de TI Verde e sua importancia.',
  'Exemplos de praticas sustentaveis na area de tecnologia da informacao.',
  'Impacto dos sistemas de informacao verde nas organizacoes.',
  'Tendencias futuras e desafios da Computacao Sustentavel.',
]

const taskFormats = ['Podcast ou Videocast', 'Seminario', 'Documentario', 'Videoaula']

const processRoles = [
  'Pesquisador de conteudo: responsavel pela busca e selecao de materiais e dados relevantes.',
  'Escritor/Redator: organiza as informacoes coletadas de maneira clara e estruturada.',
  'Criador de multimidia: se o grupo optar por formatos como podcast, videocast ou video, essa pessoa sera responsavel pela gravacao e edicao.',
  'Apresentador/Orador: para seminarios ou video, quem ficara responsavel por apresentar o conteudo.',
  'Coordenador: supervisiona o progresso do trabalho, garantindo que o grupo siga o cronograma.',
]

const researchTopics = [
  'Definicao e principios da TI Verde.',
  'Exemplos de empresas e organizacoes que adotaram praticas sustentaveis de TI.',
  'Iniciativas governamentais e regulamentacoes sobre TI Verde.',
  'Como os Sistemas de Informacao Verde podem otimizar processos e reduzir o impacto ambiental.',
  'Desafios enfrentados na adocao da Computacao Sustentavel.',
]

const onlineResources = [
  'Artigos academicos sobre TI Verde e Sustentabilidade.',
  'Sites de organizacoes que promovem praticas de sustentabilidade na tecnologia.',
  'Videos explicativos e documentarios disponiveis em plataformas como YouTube.',
  'Relatorios de empresas de tecnologia que adotam praticas de TI Verde.',
]

const resourceLinks = [
  ['Green IT - Wikipedia', 'https://en.wikipedia.org/wiki/Green_computing'],
  ['Global e-Sustainability Initiative (GeSI)', 'http://gesi.org/'],
  ['Environmental Protection Agency - Green IT', 'https://www.epa.gov/green-it'],
]

const illustrationCards = [
  {
    title: 'Tecnologia e sustentabilidade',
    caption: 'A relacao entre natureza, energia e infraestrutura digital e central nesta discussao.',
    image:
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Infraestrutura e dados',
    caption: 'Sistemas, hardware e data centers exigem eficiencia e planejamento sustentavel.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Pesquisa e colaboracao',
    caption: 'A atividade depende de investigacao, curadoria de fontes e construcao coletiva.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Sustentabilidade em perspectiva',
    caption: 'O desafio e conectar tecnologia, meio ambiente e impacto social em propostas viaveis.',
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
  },
]

const productGuides = [
  'Podcast/Videocast: se optar por podcast ou videocast, crie um roteiro claro que aborde os principais pontos da pesquisa. A gravacao deve ter uma duracao entre 10 e 20 minutos.',
  'Seminario: estruture uma apresentacao dinamica com slides, se necessario. Todos os membros do grupo devem participar da apresentacao.',
  'Documentario: capture imagens, videos e entrevistas que complementem as informacoes da pesquisa. A edicao final deve ter entre 5 e 10 minutos.',
  'Videoaula: elabore uma videoaula didatica, com explicacoes detalhadas e exemplos. A duracao pode variar entre 10 e 15 minutos.',
]

const collaborationPoints = [
  'Use ferramentas de colaboracao online, como Google Docs, Trello, ou Slack para gerenciar o progresso e compartilhar informacoes. Se ja conhecer alguma outra interface de interacao colaborativa, fique a vontade para usar e compartilhar a informacao.',
  'Reuna-se regularmente para discutir o andamento da pesquisa e resolver duvidas ou problemas. Periodos regulares de encontros mantem o foco e a atencao no trabalho a ser feito.',
]

const evaluationCriteria = [
  [
    'Qualidade da Pesquisa',
    'O conteudo esta completo, bem pesquisado e inclui exemplos e dados atuais.',
    '0 a 3',
  ],
  [
    'Organizacao do Grupo',
    'O grupo demonstrou boa colaboracao e divisao de tarefas.',
    '0 a 2',
  ],
  [
    'Criatividade na Apresentacao',
    'A apresentacao ou produto final e criativo, envolvente e bem estruturado.',
    '0 a 2',
  ],
  [
    'Clareza e Objetividade',
    'O conteudo foi apresentado de maneira clara e facil de entender.',
    '0 a 2',
  ],
  [
    'Uso de Recursos Multimidia',
    'Uso eficiente de recursos como audio, video, imagens ou graficos.',
    '0 a 1',
  ],
]

const workTypeOptions = [
  { value: 'youtube', label: 'Video no YouTube' },
  { value: 'drive', label: 'Arquivo no Drive' },
  { value: 'link', label: 'Link externo' },
  { value: 'slides', label: 'Slides ou documento' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'outro', label: 'Outro formato' },
]

const initialSubmissionForm = {
  semesterId: '',
  groupName: '',
  workTitle: '',
  workType: 'youtube',
  url: '',
  members: '',
  submittedBy: '',
  description: '',
}

const initialSemesterForm = {
  code: '',
  title: '',
  theme: 'TI Verde e Computacao Sustentavel',
  description: '',
  isActive: false,
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function apiUrl(path) {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path
}

function TrashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 7l1 11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-11"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function MenuIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path strokeLinecap="round" d="M4 7h16" />
      <path strokeLinecap="round" d="M4 12h16" />
      <path strokeLinecap="round" d="M4 17h16" />
    </svg>
  )
}

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <path strokeLinecap="round" d="M6 6l12 12" />
      <path strokeLinecap="round" d="M18 6L6 18" />
    </svg>
  )
}

function FeedbackMessage({ feedback }) {
  if (!feedback?.message) {
    return null
  }

  return (
    <section
      className={classNames(
        'rounded-xl border px-4 py-3 text-sm shadow-sm',
        feedback.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-rose-200 bg-rose-50 text-rose-900',
      )}
    >
      {feedback.message}
    </section>
  )
}

function SectionTitle({ number, title }) {
  return (
    <h2 className="scroll-mt-36 text-2xl font-bold text-stone-900 sm:text-3xl">
      {number ? `${number}. ${title}` : title}
    </h2>
  )
}

function IllustrationFigure({ image, title, caption, alt, className = '', imageClassName = '' }) {
  return (
    <figure className={classNames('overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm', className)}>
      <img src={image} alt={alt || title} className={classNames('w-full object-cover', imageClassName)} loading="lazy" />
      <figcaption className="space-y-1 border-t border-stone-100 px-4 py-3 text-left">
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="text-xs leading-5 text-stone-600">{caption}</p>
      </figcaption>
    </figure>
  )
}

function App() {
  const [catalog, setCatalog] = useState({
    activeSemester: null,
    semesters: [],
    adminConfigured: true,
  })
  const [selectedSemesterId, setSelectedSemesterId] = useState('')
  const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm)
  const [semesterForm, setSemesterForm] = useState(initialSemesterForm)
  const [adminKey, setAdminKey] = useState('')
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savingSemester, setSavingSemester] = useState(false)
  const [deletingSubmissionId, setDeletingSubmissionId] = useState(null)
  const [deletingSemesterId, setDeletingSemesterId] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [feedbackByArea, setFeedbackByArea] = useState({
    envio: null,
    acervo: null,
    monitor: null,
  })

  function setAreaFeedback(area, type, message) {
    setFeedbackByArea((current) => ({
      ...current,
      [area]: message ? { type, message } : null,
    }))
  }

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true)

    try {
      const response = await fetch(apiUrl('/api/catalog'))
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nao foi possivel carregar o catalogo.')
      }

      setCatalog(data)
      setSelectedSemesterId((currentId) => {
        if (currentId && data.semesters.some((semester) => String(semester.id) === String(currentId))) {
          return currentId
        }

        return String(data.activeSemester?.id ?? data.semesters[0]?.id ?? '')
      })

      setSubmissionForm((currentForm) => {
        const validSemester = data.semesters.some(
          (semester) => String(semester.id) === String(currentForm.semesterId),
        )

        return {
          ...currentForm,
          semesterId:
            currentForm.semesterId && validSemester
              ? currentForm.semesterId
              : String(data.activeSemester?.id ?? data.semesters[0]?.id ?? ''),
        }
      })
    } catch (error) {
      setAreaFeedback('acervo', 'error', error.message || 'Erro ao carregar os dados do WebQuest.')
    } finally {
      setLoadingCatalog(false)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadCatalog()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [loadCatalog])

  const selectedSemester = useMemo(
    () =>
      catalog.semesters.find((semester) => String(semester.id) === String(selectedSemesterId)) ||
      catalog.activeSemester ||
      catalog.semesters[0] ||
      null,
    [catalog.activeSemester, catalog.semesters, selectedSemesterId],
  )

  const openSemesters = useMemo(
    () => catalog.semesters.filter((semester) => semester.status === 'open'),
    [catalog.semesters],
  )

  async function handleSubmission(event) {
    event.preventDefault()
    setSubmitting(true)
    setAreaFeedback('envio', '', '')

    try {
      const response = await fetch(apiUrl('/api/submissions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submissionForm,
          semesterId: submissionForm.semesterId ? Number(submissionForm.semesterId) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar o trabalho.')
      }

      setAreaFeedback(
        'envio',
        'success',
        'Trabalho enviado com sucesso e salvo na lista de trabalhos enviados.',
      )
      setSubmissionForm((currentForm) => ({
        ...initialSubmissionForm,
        semesterId: currentForm.semesterId,
      }))
      await loadCatalog()
    } catch (error) {
      setAreaFeedback('envio', 'error', error.message || 'Nao foi possivel concluir o envio.')
    } finally {
      setSubmitting(false)
    }
  }

  async function saveSemester(method, endpoint, payload) {
    setSavingSemester(true)
    setAreaFeedback('monitor', '', '')

    try {
      const response = await fetch(apiUrl(endpoint), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nao foi possivel salvar o semestre.')
      }

      setAreaFeedback('monitor', 'success', 'Configuracao de semestre atualizada com sucesso.')
      setSemesterForm(initialSemesterForm)
      await loadCatalog()
    } catch (error) {
      setAreaFeedback('monitor', 'error', error.message || 'Falha ao atualizar semestre.')
    } finally {
      setSavingSemester(false)
    }
  }

  async function deleteSubmission(submission) {
    if (!adminKey) {
      setAreaFeedback('acervo', 'error', 'Informe a chave administrativa para excluir um trabalho.')
      return
    }

    const confirmed = window.confirm(
      `Deseja excluir o trabalho "${submission.workTitle}" do grupo "${submission.groupName}"?`,
    )

    if (!confirmed) {
      return
    }

    const reason = window.prompt(
      'Motivo da exclusao do trabalho (opcional):',
      'Exclusao administrativa da lista de trabalhos enviados.',
    )

    setDeletingSubmissionId(submission.id)
    setAreaFeedback('acervo', '', '')

    try {
      const response = await fetch(apiUrl(`/api/admin/submissions/${submission.id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          deletedBy: 'Monitor FSI',
          reason: reason ?? '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nao foi possivel excluir o trabalho.')
      }

      setAreaFeedback('acervo', 'success', 'Trabalho excluido com sucesso da lista de trabalhos enviados.')
      await loadCatalog()
    } catch (error) {
      setAreaFeedback('acervo', 'error', error.message || 'Falha ao excluir o trabalho.')
    } finally {
      setDeletingSubmissionId(null)
    }
  }

  async function deleteSemester(semester) {
    if (!adminKey) {
      setAreaFeedback('monitor', 'error', 'Informe a chave administrativa para excluir um semestre.')
      return
    }

    const confirmed = window.confirm(
      `Deseja excluir o semestre "${semester.code}"? Todos os trabalhos vinculados a ele tambem serao removidos.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingSemesterId(semester.id)
    setAreaFeedback('monitor', '', '')

    try {
      const response = await fetch(apiUrl(`/api/admin/semesters/${semester.id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nao foi possivel excluir o semestre.')
      }

      setAreaFeedback('monitor', 'success', 'Semestre excluido com sucesso.')
      await loadCatalog()
    } catch (error) {
      setAreaFeedback('monitor', 'error', error.message || 'Falha ao excluir o semestre.')
    } finally {
      setDeletingSemesterId(null)
    }
  }

  const inputClass =
    'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200'
  const sectionClass = 'scroll-mt-36 space-y-4 border-t border-stone-300 pt-8'
  const totalWorks = catalog.semesters.reduce(
    (total, semester) => total + (semester.submissionCount || 0),
    0,
  )

  return (
    <main className="min-h-screen bg-[#e7efdf] text-stone-900">
      <nav className="sticky top-0 z-40 border-b border-[#cad8c0] bg-[#f7fbf3]/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="text-sm font-semibold text-slate-700 sm:hidden">Menu</div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#7d8f72] hover:bg-[#e8f3e3] hover:text-slate-900 sm:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu de navegacao"
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              {mobileMenuOpen ? 'Fechar' : 'Menu'}
            </button>

            <div className="hidden flex-wrap items-center gap-2 text-sm sm:flex">
              {menuItems.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#7d8f72] hover:bg-[#e8f3e3] hover:text-slate-900 hover:shadow-md"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="grid gap-2 border-t border-[#dbe6d1] pb-3 pt-3 sm:hidden">
              {menuItems.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#7d8f72] hover:bg-[#e8f3e3] hover:text-slate-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-3 pb-8 pt-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#7d8f72] bg-[#f8f5ea] shadow-lg">
          <header className="border-b border-stone-300 px-5 py-10 text-center sm:px-10">
            <p className="text-lg font-semibold">WebQuest – Fundamentos de Sistemas de Informacao – III Unidade</p>
            <h1 className="mt-6 text-2xl font-bold sm:text-4xl">
              Explorando a Tecnologia da Informacao Verde (TI Verde) e Computacao Sustentavel
            </h1>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-stone-700">
              <span className="rounded-full border border-stone-300 bg-white px-4 py-1.5">
                Semestre ativo: {catalog.activeSemester?.code || 'Nao definido'}
              </span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-1.5">
                Trabalhos enviados: {totalWorks}
              </span>
            </div>

          </header>

          <div className="space-y-10 px-5 py-8 sm:px-10 sm:py-10">
            <section id="introducao" className="scroll-mt-36 space-y-4">
              <SectionTitle number="1" title="Introducao" />
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div className="space-y-4">
                  {introParagraphs.map((paragraph) => (
                    <p key={paragraph} className="text-justify text-base leading-8 text-stone-800">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <IllustrationFigure
                  image={illustrationCards[0].image}
                  title={illustrationCards[0].title}
                  caption={illustrationCards[0].caption}
                  alt="Paisagem aerea com floresta e agua azul"
                  imageClassName="h-64"
                />
              </div>
            </section>

            <section id="tarefa" className={sectionClass}>
              <SectionTitle title="Tarefa" />
              <p className="text-justify text-base leading-8 text-stone-800">
                Seu grupo sera responsavel por realizar uma pesquisa aprofundada sobre TI Verde e
                Computacao Sustentavel, abordando temas como:
              </p>
              <ul className="space-y-2 pl-6 text-base leading-8 text-stone-800 marker:text-stone-700 list-disc">
                {taskTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <p className="text-justify text-base leading-8 text-stone-800">
                O produto dessa pesquisa pode ser apresentado de diferentes formas:
              </p>
              <ul className="space-y-2 pl-6 text-base leading-8 text-stone-800 marker:text-stone-700 list-disc">
                {taskFormats.map((format) => (
                  <li key={format}>{format}</li>
                ))}
              </ul>
              <p className="text-justify text-base leading-8 text-stone-800">
                Seja qual for o formato escolhido, o conteudo deve ser claro, conciso e abordar os
                pontos centrais da pesquisa realizada.
              </p>
              <IllustrationFigure
                image={illustrationCards[1].image}
                title={illustrationCards[1].title}
                caption={illustrationCards[1].caption}
                alt="Close de componentes eletronicos em uma placa"
                imageClassName="h-64"
              />
            </section>

            <section id="processo" className={sectionClass}>
              <SectionTitle title="Processo" />
              <div className="space-y-5 text-base leading-8 text-stone-800">
                <div>
                  <p>
                    <strong>1. Formacao de grupos:</strong> organize-se em grupos de ate 5
                    pessoas.
                  </p>
                </div>
                <div>
                  <p>
                    <strong>2. Divisao de papeis:</strong> cada membro do grupo deve ser
                    responsavel por uma parte da pesquisa. Sugerimos as seguintes funcoes:
                  </p>
                  <ul className="mt-2 space-y-2 pl-6 marker:text-stone-700 list-disc">
                    {processRoles.map((role) => (
                      <li key={role}>{role}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>4. Pesquisa de Conteudo:</strong>
                  </p>
                  <ul className="mt-2 space-y-2 pl-6 marker:text-stone-700 list-disc">
                    <li>
                      Pesquise materiais sobre TI Verde, Computacao Sustentavel e Sistemas de
                      Informacao Verde.
                    </li>
                    <li>Utilize os seguintes topicos como guia para a pesquisa:</li>
                  </ul>
                  <ul className="mt-2 space-y-2 pl-10 marker:text-stone-700 list-disc">
                    {researchTopics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
                <div id="recursos" className="scroll-mt-36">
                  <p className="font-semibold">5. Recursos Online:</p>
                  <p>
                    Aqui estao alguns recursos sugeridos para iniciar sua pesquisa:
                  </p>
                  <ul className="mt-2 space-y-2 pl-6 marker:text-stone-700 list-disc">
                    {onlineResources.map((resource) => (
                      <li key={resource}>{resource}</li>
                    ))}
                  </ul>
                  <p className="mt-4 font-semibold">Dicas de links:</p>
                  <ul className="mt-2 space-y-2 pl-6 marker:text-stone-700 list-disc">
                    {resourceLinks.map(([label, href]) => (
                      <li key={href}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-800 underline decoration-emerald-700 underline-offset-4"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <IllustrationFigure
                      image={illustrationCards[2].image}
                      title={illustrationCards[2].title}
                      caption={illustrationCards[2].caption}
                      alt="Visao do planeta e rede de luzes urbanas"
                      imageClassName="h-44"
                    />
                    <IllustrationFigure
                      image={illustrationCards[3].image}
                      title={illustrationCards[3].title}
                      caption={illustrationCards[3].caption}
                      alt="Paisagem com turbinas e vegetacao"
                      imageClassName="h-44"
                    />
                  </div>
                </div>
                <div>
                  <p>
                    <strong>6. Desenvolvimento do produto:</strong>
                  </p>
                  <ul className="mt-2 space-y-2 pl-6 marker:text-stone-700 list-disc">
                    {productGuides.map((guide) => (
                      <li key={guide}>{guide}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>7. Colaboracao e Comunicacao:</strong>
                  </p>
                  <ul className="mt-2 space-y-2 pl-6 marker:text-stone-700 list-disc">
                    {collaborationPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section id="avaliacao" className={sectionClass}>
              <SectionTitle number="8" title="Avaliacao" />
              <p className="text-base leading-8 text-stone-800">
                Seu trabalho sera avaliado com base nos seguintes criterios:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm text-stone-800">
                  <thead>
                    <tr className="bg-[#e8debf]">
                      <th className="border border-stone-500 px-3 py-2">Criterio</th>
                      <th className="border border-stone-500 px-3 py-2">Descricao</th>
                      <th className="border border-stone-500 px-3 py-2">Pontuacao (0-10)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationCriteria.map(([criterion, description, score]) => (
                      <tr key={criterion}>
                        <td className="border border-stone-500 px-3 py-2 align-top font-medium">
                          {criterion}
                        </td>
                        <td className="border border-stone-500 px-3 py-2 align-top">
                          {description}
                        </td>
                        <td className="border border-stone-500 px-3 py-2 align-top">{score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="conclusao" className={sectionClass}>
              <SectionTitle number="9" title="Conclusao" />
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div className="space-y-4">
                  <p className="text-justify text-base leading-8 text-stone-800">
                    Ao final desta WebQuest, voce e seu grupo terao adquirido um entendimento mais
                    profundado sobre TI Verde, Computacao Sustentavel e a relevancia dos Sistemas de
                    Informacao Verde para o futuro da tecnologia. A pesquisa realizada e a producao
                    colaborativa irao nao so aprofundar seus conhecimentos sobre o tema, como tambem
                    desenvolver habilidades em comunicacao e trabalho em equipe. Ao compartilhar suas
                    descobertas com a turma, voces contribuirao para a disseminacao de praticas
                    sustentaveis na area da tecnologia.
                  </p>
                  <p className="text-justify text-base leading-8 text-stone-800">
                    Para finalizacao do trabalho de investigacao, os resultados serao apresentados na
                    penultima semana do semestre.
                  </p>
                </div>
                <IllustrationFigure
                  image={illustrationCards[2].image}
                  title="Visao ampliada do impacto digital"
                  caption="A proposta final deve conectar pesquisa, consciencia ambiental e aplicacao pratica."
                  alt="Planeta visto do espaco com cidades iluminadas"
                  imageClassName="h-72"
                />
              </div>
            </section>

            <section id="envio" className={sectionClass}>
              <SectionTitle title="Envio dos Trabalhos" />
              <FeedbackMessage feedback={feedbackByArea.envio} />
              <p className="text-justify text-base leading-8 text-stone-800">
                Depois de concluir a atividade, o grupo deve registrar aqui o link do produto
                final. O sistema aceita YouTube, Google Drive e outros links publicos.
              </p>

              <form className="grid gap-4" onSubmit={handleSubmission}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Semestre do envio
                  </label>
                  <select
                    className={inputClass}
                    value={submissionForm.semesterId}
                    onChange={(event) =>
                      setSubmissionForm((current) => ({
                        ...current,
                        semesterId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Usar semestre ativo</option>
                    {openSemesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.code} - {semester.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">
                      Nome do grupo
                    </label>
                    <input
                      className={inputClass}
                      value={submissionForm.groupName}
                      onChange={(event) =>
                        setSubmissionForm((current) => ({
                          ...current,
                          groupName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">
                      Responsavel pelo envio
                    </label>
                    <input
                      className={inputClass}
                      value={submissionForm.submittedBy}
                      onChange={(event) =>
                        setSubmissionForm((current) => ({
                          ...current,
                          submittedBy: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Titulo do trabalho
                  </label>
                  <input
                    className={inputClass}
                    value={submissionForm.workTitle}
                    onChange={(event) =>
                      setSubmissionForm((current) => ({
                        ...current,
                        workTitle: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">
                      Formato
                    </label>
                    <select
                      className={inputClass}
                      value={submissionForm.workType}
                      onChange={(event) =>
                        setSubmissionForm((current) => ({
                          ...current,
                          workType: event.target.value,
                        }))
                      }
                    >
                      {workTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">
                      URL do trabalho
                    </label>
                    <input
                      className={inputClass}
                      type="url"
                      value={submissionForm.url}
                      onChange={(event) =>
                        setSubmissionForm((current) => ({
                          ...current,
                          url: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Integrantes
                  </label>
                  <textarea
                    className={classNames(inputClass, 'min-h-24 resize-y')}
                    value={submissionForm.members}
                    onChange={(event) =>
                      setSubmissionForm((current) => ({
                        ...current,
                        members: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Descricao breve
                  </label>
                  <textarea
                    className={classNames(inputClass, 'min-h-28 resize-y')}
                    value={submissionForm.description}
                    onChange={(event) =>
                      setSubmissionForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting || loadingCatalog}
                    className="rounded-md border border-emerald-900 bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {submitting ? 'Enviando...' : 'Salvar trabalho'}
                  </button>
                </div>
              </form>
            </section>

            <section id="acervo" className={sectionClass}>
              <SectionTitle title="Trabalhos Enviados" />
              <FeedbackMessage feedback={feedbackByArea.acervo} />
              <div className="grid gap-4 md:grid-cols-[260px_1fr] md:items-start">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Escolha o semestre
                  </label>
                  <select
                    className={inputClass}
                    value={selectedSemester?.id || ''}
                    onChange={(event) => setSelectedSemesterId(event.target.value)}
                  >
                    {catalog.semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.code} - {semester.status === 'open' ? 'Aberto' : 'Arquivado'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-md border border-stone-300 bg-[#fcfaf3] px-4 py-3 text-sm leading-7 text-stone-800">
                  <p>
                    <strong>Semestre:</strong> {selectedSemester?.code || 'Nao definido'}
                  </p>
                  <p>
                    <strong>Tema:</strong>{' '}
                    {selectedSemester?.theme || 'Sem informacoes cadastradas.'}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {selectedSemester?.status === 'open' ? 'Aberto' : 'Arquivado'}
                    {selectedSemester?.isActive ? ' · Ativo' : ''}
                  </p>
                  <p>
                    <strong>Total de links:</strong> {selectedSemester?.submissionCount || 0}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {loadingCatalog ? <p>Carregando trabalhos...</p> : null}

                {adminKey ? (
                  <p className="text-sm text-stone-600">
                    Chave administrativa ativa. Os botoes de exclusao ficam disponiveis na lista de trabalhos enviados.
                  </p>
                ) : null}

                {!loadingCatalog && selectedSemester?.submissions?.length === 0 ? (
                  <p>Nao existem trabalhos registrados para este semestre.</p>
                ) : null}

                {selectedSemester?.submissions?.map((submission) => (
                  <article key={submission.id} className="border-b border-stone-300 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-stone-900">{submission.workTitle}</h3>
                      <button
                        type="button"
                        disabled={!adminKey || deletingSubmissionId === submission.id}
                        title={adminKey ? 'Excluir trabalho' : 'Informe a chave do monitor para excluir'}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void deleteSubmission(submission)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <p className="text-sm leading-7 text-stone-800">
                      <strong>Grupo:</strong> {submission.groupName}
                    </p>
                    <p className="text-sm leading-7 text-stone-800">
                      <strong>Responsavel:</strong> {submission.submittedBy}
                    </p>
                    <p className="text-sm leading-7 text-stone-800">
                      <strong>Formato:</strong> {submission.workType}
                    </p>
                    <p className="text-sm leading-7 text-stone-800">
                      <strong>Integrantes:</strong> {submission.members}
                    </p>
                    {submission.description ? (
                      <p className="text-sm leading-7 text-stone-800">
                        <strong>Descricao:</strong> {submission.description}
                      </p>
                    ) : null}
                    <p className="text-sm leading-7 text-stone-800">
                      <strong>Registrado em:</strong>{' '}
                      {dateFormatter.format(new Date(submission.createdAt))}
                    </p>
                    <p className="pt-1 text-sm">
                      <a
                        href={submission.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-800 underline decoration-emerald-700 underline-offset-4"
                      >
                        Abrir link do trabalho
                      </a>
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section id="monitor" className={sectionClass}>
              <SectionTitle title="Painel do Monitor" />
              <FeedbackMessage feedback={feedbackByArea.monitor} />
              <p className="text-justify text-base leading-8 text-stone-800">
                Aqui voce pode criar um novo semestre, ativar o periodo atual e arquivar semestres
                anteriores para manter o historico do WebQuest.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">
                    Chave administrativa
                  </label>
                  <input
                    className={classNames(inputClass, 'max-w-md')}
                    type="password"
                    value={adminKey}
                    onChange={(event) => setAdminKey(event.target.value)}
                    placeholder="Informe a chave do monitor"
                  />
                </div>

                <form
                  className="grid gap-4 rounded-md border border-stone-300 bg-[#fcfaf3] p-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void saveSemester('POST', '/api/admin/semesters', {
                      ...semesterForm,
                      status: 'open',
                    })
                  }}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-stone-700">
                        Codigo
                      </label>
                      <input
                        className={inputClass}
                        value={semesterForm.code}
                        onChange={(event) =>
                          setSemesterForm((current) => ({ ...current, code: event.target.value }))
                        }
                        placeholder="2026.2"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-stone-700">
                        Titulo
                      </label>
                      <input
                        className={inputClass}
                        value={semesterForm.title}
                        onChange={(event) =>
                          setSemesterForm((current) => ({ ...current, title: event.target.value }))
                        }
                        placeholder="FSI 2026.2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">Tema</label>
                    <input
                      className={inputClass}
                      value={semesterForm.theme}
                      onChange={(event) =>
                        setSemesterForm((current) => ({ ...current, theme: event.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">
                      Descricao
                    </label>
                    <textarea
                      className={classNames(inputClass, 'min-h-24 resize-y')}
                      value={semesterForm.description}
                      onChange={(event) =>
                        setSemesterForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-stone-800">
                    <input
                      type="checkbox"
                      checked={semesterForm.isActive}
                      onChange={(event) =>
                        setSemesterForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                    Definir como semestre ativo imediatamente
                  </label>

                  <div>
                    <button
                      type="submit"
                      disabled={savingSemester}
                      className="rounded-md border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                    >
                      {savingSemester ? 'Salvando...' : 'Criar semestre'}
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {catalog.semesters.map((semester) => (
                    <article
                      key={semester.id}
                      className="rounded-md border border-stone-300 bg-[#fcfaf3] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-stone-900">{semester.title}</h3>
                        <button
                          type="button"
                          disabled={!adminKey || deletingSemesterId === semester.id}
                          title={adminKey ? 'Excluir semestre' : 'Informe a chave do monitor para excluir'}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => void deleteSemester(semester)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                      <p className="text-sm leading-7 text-stone-800">
                        <strong>Codigo:</strong> {semester.code}
                      </p>
                      <p className="text-sm leading-7 text-stone-800">
                        <strong>Tema:</strong> {semester.theme}
                      </p>
                      <p className="text-sm leading-7 text-stone-800">
                        <strong>Status:</strong>{' '}
                        {semester.status === 'open' ? 'Aberto' : 'Arquivado'}
                        {semester.isActive ? ' · Ativo' : ''}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingSemester}
                          className="rounded-md border border-emerald-800 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() =>
                            void saveSemester('PATCH', `/api/admin/semesters/${semester.id}`, {
                              isActive: true,
                              status: 'open',
                            })
                          }
                        >
                          Tornar ativo
                        </button>
                        <button
                          type="button"
                          disabled={savingSemester}
                          className="rounded-md border border-stone-500 bg-white px-3 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() =>
                            void saveSemester('PATCH', `/api/admin/semesters/${semester.id}`, {
                              status: semester.status === 'open' ? 'archived' : 'open',
                            })
                          }
                        >
                          {semester.status === 'open' ? 'Arquivar' : 'Reabrir'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
