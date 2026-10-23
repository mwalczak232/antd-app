import { useEffect, useMemo, useRef, useState } from 'react'
import type { InputRef } from 'antd'
import {
  Alert,
  AutoComplete,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  ConfigProvider,
  Empty,
  Flex,
  FloatButton,
  Grid,
  Input,
  Layout,
  Modal,
  Row,
  Segmented,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd'
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  DislikeOutlined,
  EnterOutlined,
  HistoryOutlined,
  LikeOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  MoonOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  ShoppingOutlined,
  SunOutlined,
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text, Link } = Typography

type Category = 'plan' | 'cancel' | 'payments' | 'shop'
type Team = 'plan' | 'shop'

interface Faq {
  key: string
  category: Category
  question: string
  answer: string
}

interface Contact {
  title: string
  description: string
  phone: string
  email: string
  hours?: string
}

const BRAND = '#0d7a6b'
const FONT = "'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif"

const CONTACTS: Record<Team, Contact> = {
  plan: {
    title: 'Pet care plan support',
    description: 'Your plan, membership, payments or cancelling.',
    phone: '01225 489821',
    email: 'info@pethealthclub.com',
  },
  shop: {
    title: 'Shop support',
    description: 'Pet supply orders and the Repeat & Save programme.',
    phone: '01761 250 848',
    email: 'shop@thepethealthclub.co.uk',
    hours: 'Mon – Fri, 9:00am – 5:00pm',
  },
}

const CATEGORIES: { value: Category; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'plan', label: 'Using my plan', description: 'Where you can use your plan', icon: <MedicineBoxOutlined /> },
  { value: 'cancel', label: 'Cancelling', description: 'End your subscription the right way', icon: <CloseCircleOutlined /> },
  { value: 'payments', label: 'Payments', description: 'Direct Debits and payment dates', icon: <CreditCardOutlined /> },
  { value: 'shop', label: 'Shop orders', description: 'Supplies and Repeat & Save', icon: <ShoppingOutlined /> },
]

const FAQS: Faq[] = [
  {
    key: 'which-vet',
    category: 'plan',
    question: 'Can I use my plan at any vet practice?',
    answer:
      'Your plan is designed to be used only at the vet practice where you signed up. If you need to change practice, contact our Customer Support Team to talk through your options.',
  },
  {
    key: 'how-cancel',
    category: 'cancel',
    question: 'How do I cancel my subscription?',
    answer:
      'Tell us you want to end your subscription by calling the Customer Support Team, giving them written notice, or emailing your registered practice.',
  },
  {
    key: 'cancel-dd',
    category: 'cancel',
    question: 'Can I cancel by stopping my Direct Debit at the bank?',
    answer:
      'Please don’t. Cancelling the Direct Debit with your bank may be treated as a request to cancel, and a £60 cancellation fee will then be due immediately. Contact us instead so we can cancel your plan properly.',
  },
  {
    key: 'payment-date',
    category: 'payments',
    question: 'I’m cancelling close to my payment date. Will the payment still be taken?',
    answer:
      'If you cancel close to a payment date, we may not be able to stop that payment in time. Get in touch as early as you can.',
  },
  {
    key: 'shop-contact',
    category: 'shop',
    question: 'Who do I contact about a shop order or Repeat & Save?',
    answer: `Shop orders and Repeat & Save are handled by the Pet Health Club Shop team. Call ${CONTACTS.shop.phone} or email ${CONTACTS.shop.email}, ${CONTACTS.shop.hours}.`,
  },
]

const POPULAR = ['Cancel', 'Direct Debit', 'Repeat & Save']

const TEAM_PICKER: { value: string; label: string; team: Team }[] = [
  { value: 'membership', label: 'My plan or membership', team: 'plan' },
  { value: 'payments', label: 'Payments or cancelling', team: 'plan' },
  { value: 'order', label: 'A shop order', team: 'shop' },
  { value: 'repeat', label: 'Repeat & Save', team: 'shop' },
]

function matches(faq: Faq, q: string) {
  return `${faq.question} ${faq.answer}`.toLowerCase().includes(q)
}

function Highlight({ text, query }: { text: string; query: string }) {
  const { token } = theme.useToken()
  const q = query.trim()
  if (!q) return <>{text}</>
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    <>
      {text.split(new RegExp(`(${escaped})`, 'gi')).map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} style={{ background: token.colorWarningBg, color: 'inherit', padding: 0, borderRadius: 2 }}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

type SearchItem =
  | { kind: 'faq'; id: string; faq: Faq }
  | { kind: 'topic'; id: string; category: (typeof CATEGORIES)[number] }
  | { kind: 'contact'; id: string; team: Team }

const RECENT_KEY = 'help-recent-searches'
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent)

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecent(recent: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
  } catch {
    // Storage can be unavailable (private mode); recent searches are a nicety.
  }
}

function contactText(team: Team) {
  const c = CONTACTS[team]
  return `${c.title} ${c.description} ${c.phone} ${c.email} contact call phone email speak talk number`.toLowerCase()
}

function snippet(text: string, q: string) {
  const i = q ? text.toLowerCase().indexOf(q) : -1
  if (i < 0) return text.length > 90 ? `${text.slice(0, 90)}…` : text
  const start = Math.max(0, i - 30)
  return `${start > 0 ? '…' : ''}${text.slice(start, start + 100)}${start + 100 < text.length ? '…' : ''}`
}

const faqItem = (faq: Faq): SearchItem => ({ kind: 'faq', id: `faq:${faq.key}`, faq })
const topicItem = (category: (typeof CATEGORIES)[number]): SearchItem => ({ kind: 'topic', id: `topic:${category.value}`, category })
const contactItem = (team: Team): SearchItem => ({ kind: 'contact', id: `contact:${team}`, team })

function SearchPalette({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (item: SearchItem) => void
}) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [recent, setRecent] = useState<string[]>(loadRecent)
  const inputRef = useRef<InputRef>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const groups = useMemo(() => {
    if (!q)
      return [
        { title: 'Popular questions', items: FAQS.slice(0, 3).map(faqItem) },
        { title: 'Browse topics', items: CATEGORIES.map(topicItem) },
      ]
    return [
      { title: 'Questions', items: FAQS.filter((f) => matches(f, q)).map(faqItem) },
      {
        title: 'Topics',
        items: CATEGORIES.filter((c) => `${c.label} ${c.description}`.toLowerCase().includes(q)).map(topicItem),
      },
      { title: 'Contact', items: (['plan', 'shop'] as const).filter((t) => contactText(t).includes(q)).map(contactItem) },
    ].filter((g) => g.items.length > 0)
  }, [q])
  const flat = groups.flatMap((g) => g.items)

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const updateQuery = (value: string) => {
    setQuery(value)
    setActive(0)
  }

  const close = () => {
    onClose()
    updateQuery('')
  }

  const choose = (item: SearchItem) => {
    if (q) {
      const next = [query.trim(), ...recent.filter((r) => r.toLowerCase() !== q)].slice(0, 5)
      setRecent(next)
      saveRecent(next)
    }
    onSelect(item)
    close()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!flat.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % flat.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + flat.length) % flat.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(flat[active])
    }
  }

  const iconBox = (icon: React.ReactNode) => (
    <Flex
      align="center"
      justify="center"
      style={{
        flex: 'none',
        width: 36,
        height: 36,
        borderRadius: 10,
        background: token.colorPrimaryBg,
        color: token.colorPrimary,
        fontSize: 16,
      }}
    >
      {icon}
    </Flex>
  )

  const renderItem = (item: SearchItem) => {
    if (item.kind === 'faq')
      return {
        icon: <QuestionCircleOutlined />,
        title: item.faq.question,
        detail: `${CATEGORIES.find((c) => c.value === item.faq.category)!.label} · ${snippet(item.faq.answer, q)}`,
      }
    if (item.kind === 'topic')
      return {
        icon: item.category.icon,
        title: item.category.label,
        detail: `${item.category.description} · ${FAQS.filter((f) => f.category === item.category.value).length} questions`,
      }
    const c = CONTACTS[item.team]
    return { icon: <PhoneOutlined />, title: c.title, detail: `${c.phone} · ${c.email}` }
  }

  let index = -1

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      closable={false}
      width={640}
      style={{ top: 72, maxWidth: 'calc(100vw - 32px)' }}
      styles={{ body: { padding: 0 } }}
      afterOpenChange={(isOpen) => isOpen && inputRef.current?.focus()}
      destroyOnHidden
      aria-label="Search help"
    >
      <Input
        ref={inputRef}
        id="help-palette-search"
        size="large"
        variant="borderless"
        allowClear
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        onKeyDown={onKeyDown}
        prefix={<SearchOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />}
        placeholder="Search questions, topics or contacts"
        aria-label="Search help"
        aria-controls="help-palette-results"
        style={{ fontSize: 17, paddingBlock: 14 }}
      />
      <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }} />

      <div
        ref={listRef}
        id="help-palette-results"
        role="listbox"
        style={{ maxHeight: 'min(420px, 60vh)', overflowY: 'auto', padding: 8 }}
      >
        {!q && recent.length > 0 && (
          <Flex vertical gap={8} style={{ padding: '8px 8px 12px' }}>
            <Flex justify="space-between" align="center">
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Recent searches
              </Text>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setRecent([])
                  saveRecent([])
                }}
              >
                Clear
              </Button>
            </Flex>
            <Flex gap={8} wrap>
              {recent.map((r) => (
                <Button key={r} size="small" shape="round" icon={<HistoryOutlined />} onClick={() => updateQuery(r)}>
                  {r}
                </Button>
              ))}
            </Flex>
          </Flex>
        )}

        {groups.map((group) => (
          <div key={group.title} role="group" aria-label={group.title}>
            <Text
              type="secondary"
              style={{ display: 'block', padding: '8px 8px 4px', fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}
            >
              {group.title}
            </Text>
            {group.items.map((item) => {
              index += 1
              const i = index
              const isActive = i === active
              const { icon, title, detail } = renderItem(item)
              return (
                <Flex
                  key={item.id}
                  data-index={i}
                  role="option"
                  aria-selected={isActive}
                  align="center"
                  gap={12}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(item)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: token.borderRadius,
                    cursor: 'pointer',
                    background: isActive ? token.colorPrimaryBg : 'transparent',
                  }}
                >
                  {iconBox(icon)}
                  <Flex vertical style={{ minWidth: 0, flex: 1 }}>
                    <Text strong ellipsis>
                      <Highlight text={title} query={query} />
                    </Text>
                    <Text type="secondary" ellipsis style={{ fontSize: 13 }}>
                      <Highlight text={detail} query={query} />
                    </Text>
                  </Flex>
                  {isActive && <EnterOutlined style={{ color: token.colorPrimary }} />}
                </Flex>
              )
            })}
          </div>
        ))}

        {q && flat.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`No results for “${query.trim()}”`}
            style={{ paddingBlock: 24 }}
          >
            <Button type="primary" shape="round" icon={<PhoneOutlined />} onClick={() => choose(contactItem('plan'))}>
              Ask our team instead
            </Button>
          </Empty>
        )}
      </div>

      {screens.sm && (
        <Flex
          gap={16}
          style={{ padding: '10px 16px', borderTop: `1px solid ${token.colorBorderSecondary}`, color: token.colorTextTertiary, fontSize: 12 }}
        >
          <span>
            <Text keyboard>↑</Text>
            <Text keyboard>↓</Text> to move
          </span>
          <span>
            <Text keyboard>Enter</Text> to open
          </span>
          <span>
            <Text keyboard>Esc</Text> to close
          </span>
        </Flex>
      )}
    </Modal>
  )
}

function FaqFeedback() {
  const { token } = theme.useToken()
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  if (vote === 'yes')
    return (
      <Text style={{ color: token.colorSuccess }}>
        <CheckCircleFilled /> Thanks for letting us know.
      </Text>
    )
  if (vote === 'no')
    return (
      <Text type="secondary">
        Sorry this didn’t help. <Link href="#contact">Talk to our team</Link> and we’ll answer it directly.
      </Text>
    )
  return (
    <Space size="small" wrap>
      <Text type="secondary">Was this helpful?</Text>
      <Button size="small" shape="round" icon={<LikeOutlined />} onClick={() => setVote('yes')}>
        Yes
      </Button>
      <Button size="small" shape="round" icon={<DislikeOutlined />} onClick={() => setVote('no')}>
        No
      </Button>
    </Space>
  )
}

function ContactCard({ contact, recommended }: { contact: Contact; recommended: boolean }) {
  const { token } = theme.useToken()
  return (
    <Card
      style={{
        height: '100%',
        borderColor: recommended ? token.colorPrimary : undefined,
        boxShadow: recommended ? `0 0 0 3px ${token.colorPrimaryBg}` : undefined,
        opacity: recommended ? 1 : 0.6,
        transition: `all ${token.motionDurationMid}`,
      }}
    >
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="start" gap={8}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {contact.title}
            </Title>
            <Text type="secondary">{contact.description}</Text>
          </div>
          {recommended && (
            <Tag color="success" style={{ marginInlineEnd: 0 }}>
              Best match
            </Tag>
          )}
        </Flex>
        <Flex gap={8} wrap>
          <Button type={recommended ? 'primary' : 'default'} shape="round" icon={<PhoneOutlined />} href={`tel:${contact.phone.replace(/\s/g, '')}`}>
            {contact.phone}
          </Button>
          <Button shape="round" icon={<MailOutlined />} href={`mailto:${contact.email}`}>
            Email us
          </Button>
        </Flex>
        <Flex vertical gap={4}>
          <Text type="secondary" copyable={{ text: contact.email }}>
            {contact.email}
          </Text>
          {contact.hours && (
            <Text type="secondary">
              <ClockCircleOutlined /> {contact.hours}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}

function HelpContent({ dark, onToggleDark }: { dark: boolean; onToggleDark: (dark: boolean) => void }) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [topic, setTopic] = useState(TEAM_PICKER[0].value)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const faqRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const q = query.trim().toLowerCase()
  const results = useMemo(
    () => FAQS.filter((faq) => (category === 'all' || faq.category === category) && (!q || matches(faq, q))),
    [q, category],
  )
  const counts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.value, FAQS.filter((f) => f.category === c.value).length])),
    [],
  )
  const suggestions = q
    ? [
        {
          label: 'Questions',
          options: FAQS.filter((faq) => matches(faq, q)).map((faq) => ({
            value: `faq:${faq.key}`,
            label: <Highlight text={faq.question} query={query} />,
          })),
        },
        {
          label: 'Topics',
          options: CATEGORIES.filter((c) => `${c.label} ${c.description}`.toLowerCase().includes(q)).map((c) => ({
            value: `topic:${c.value}`,
            label: (
              <Space>
                {c.icon}
                <Highlight text={c.label} query={query} />
              </Space>
            ),
          })),
        },
      ].filter((group) => group.options.length > 0)
    : []
  const recommendedTeam = TEAM_PICKER.find((t) => t.value === topic)!.team

  const scrollToFaqs = () => faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const openFaq = (key: string) => {
    setQuery('')
    setCategory('all')
    setOpenKeys([key])
    scrollToFaqs()
  }

  const pickCategory = (value: Category) => {
    setCategory(value)
    setQuery('')
    setOpenKeys([])
    scrollToFaqs()
  }

  const showTeam = (team: Team) => {
    setTopic(TEAM_PICKER.find((t) => t.team === team)!.value)
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onPaletteSelect = (item: SearchItem) => {
    if (item.kind === 'faq') openFaq(item.faq.key)
    else if (item.kind === 'topic') pickCategory(item.category.value)
    else showTeam(item.team)
  }

  const onHeroSelect = (value: string) => {
    const [kind, key] = value.split(':')
    if (kind === 'faq') openFaq(key)
    else pickCategory(key as Category)
  }

  const section: React.CSSProperties = { maxWidth: 1040, margin: '0 auto', paddingInline: 16 }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingInline: 16,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex align="center" gap={10}>
          <Flex
            align="center"
            justify="center"
            style={{ width: 32, height: 32, borderRadius: 10, background: token.colorPrimary, color: '#fff' }}
          >
            <MedicineBoxOutlined />
          </Flex>
          <Text strong style={{ fontSize: 18, whiteSpace: 'nowrap' }}>
            Pet Health Club
          </Text>
        </Flex>
        {screens.sm ? (
          <Button
            shape="round"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search help"
            style={{ flex: 1, maxWidth: 420, justifyContent: 'space-between', color: token.colorTextTertiary, background: token.colorFillTertiary, borderColor: 'transparent' }}
          >
            <Space>
              <SearchOutlined />
              Search help
            </Space>
            <Text keyboard type="secondary">
              {IS_MAC ? '⌘ K' : 'Ctrl K'}
            </Text>
          </Button>
        ) : null}
        <Flex align="center" gap={12}>
          {!screens.sm && <Button shape="circle" icon={<SearchOutlined />} onClick={() => setPaletteOpen(true)} aria-label="Search help" />}
          <Switch
            checked={dark}
            onChange={onToggleDark}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            aria-label="Dark mode"
          />
          <Button type="primary" shape="round" icon={<PhoneOutlined />} href="#contact" aria-label="Contact us">
            {screens.sm && 'Contact us'}
          </Button>
        </Flex>
      </Header>

      <Content>
        <div
          style={{
            background: `radial-gradient(circle at 15% 0%, ${token.colorPrimaryBg}, transparent 60%), radial-gradient(circle at 90% 100%, ${token.colorPrimaryBg}, transparent 50%), ${token.colorBgContainer}`,
            padding: '64px 16px 72px',
          }}
        >
          <Flex vertical align="center" gap={20} style={{ maxWidth: 640, margin: '0 auto' }}>
            <Tag
              bordered={false}
              style={{ marginInlineEnd: 0, borderRadius: 999, paddingInline: 12, background: token.colorPrimaryBg, color: token.colorPrimary, fontWeight: 600 }}
            >
              Help & Support
            </Tag>
            <Title level={1} style={{ margin: 0, textAlign: 'center', fontSize: 'clamp(32px, 6vw, 48px)', letterSpacing: -1 }}>
              How can we help?
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, textAlign: 'center', fontSize: 16 }}>
              Find answers about your pet care plan, or get in touch with the right team.
            </Paragraph>
            <AutoComplete
              style={{ width: '100%' }}
              options={suggestions}
              value={query}
              onChange={(value) => {
                setQuery(value)
                setCategory('all')
              }}
              onSelect={onHeroSelect}
            >
              <Input
                id="help-search"
                size="large"
                allowClear
                prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                placeholder="Search, e.g. “cancel” or “Direct Debit”"
                aria-label="Search help articles"
                onPressEnter={scrollToFaqs}
                style={{ borderRadius: 999, paddingBlock: 12, paddingInline: 20, boxShadow: token.boxShadowSecondary }}
              />
            </AutoComplete>
            <Flex gap={8} wrap justify="center" align="center">
              <Text type="secondary">Popular:</Text>
              {POPULAR.map((term) => (
                <Button
                  key={term}
                  size="small"
                  shape="round"
                  onClick={() => {
                    setQuery(term)
                    setCategory('all')
                    scrollToFaqs()
                  }}
                >
                  {term}
                </Button>
              ))}
            </Flex>
          </Flex>
        </div>

        <div style={{ ...section, marginTop: -36 }}>
          <Row gutter={[16, 16]}>
            {CATEGORIES.map((c) => {
              const active = category === c.value
              return (
                <Col key={c.value} xs={12} lg={6}>
                  <Card
                    hoverable
                    className="topic-card"
                    onClick={() => pickCategory(c.value)}
                    style={{
                      height: '100%',
                      borderColor: active ? token.colorPrimary : undefined,
                      boxShadow: token.boxShadowTertiary,
                    }}
                  >
                    <Flex vertical gap={10}>
                      <Flex justify="space-between" align="center">
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            fontSize: 20,
                            background: token.colorPrimaryBg,
                            color: token.colorPrimary,
                          }}
                        >
                          {c.icon}
                        </Flex>
                        <Badge count={counts[c.value]} color={token.colorPrimary} />
                      </Flex>
                      <Text strong style={{ fontSize: 16 }}>
                        {c.label}
                      </Text>
                      <Text type="secondary">{c.description}</Text>
                    </Flex>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </div>

        <div ref={faqRef} style={{ ...section, scrollMarginTop: 80, marginTop: 56 }}>
          <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Frequently asked questions
              </Title>
              <Text type="secondary">
                {q ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query.trim()}”` : 'Tap a question to see the answer'}
              </Text>
            </div>
            <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Segmented
                shape="round"
                value={category}
                onChange={(v) => setCategory(v as Category | 'all')}
                options={[{ value: 'all', label: 'All' }, ...CATEGORIES.map(({ value, label }) => ({ value, label }))]}
              />
            </div>
          </Flex>

          {results.length > 0 ? (
            <Collapse
              size="large"
              expandIconPlacement="end"
              activeKey={openKeys}
              onChange={(keys) => setOpenKeys(keys as string[])}
              style={{ background: token.colorBgContainer }}
              items={results.map((faq) => ({
                key: faq.key,
                label: (
                  <Text strong>
                    <Highlight text={faq.question} query={query} />
                  </Text>
                ),
                children: (
                  <Flex vertical gap={16}>
                    <Paragraph style={{ margin: 0, fontSize: 15, lineHeight: 1.7, maxWidth: '65ch' }}>
                      <Highlight text={faq.answer} query={query} />
                    </Paragraph>
                    <FaqFeedback key={faq.key} />
                  </Flex>
                ),
              }))}
            />
          ) : (
            <Card>
              <Empty description={q ? `No answers match “${query.trim()}”` : 'No questions in this topic yet'}>
                <Flex gap={8} justify="center" wrap>
                  <Button
                    shape="round"
                    onClick={() => {
                      setQuery('')
                      setCategory('all')
                    }}
                  >
                    Show all questions
                  </Button>
                  <Button type="primary" shape="round" href="#contact">
                    Ask our team
                  </Button>
                </Flex>
              </Empty>
            </Card>
          )}
        </div>

        <div id="contact" style={{ ...section, scrollMarginTop: 80, marginTop: 64, marginBottom: 64 }}>
          <Card style={{ background: token.colorFillQuaternary, borderColor: 'transparent' }} styles={{ body: { padding: 'clamp(20px, 4vw, 40px)' } }}>
            <Flex vertical gap={24}>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Still need help?
                </Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  Tell us what your question is about and we’ll show you the right team.
                </Paragraph>
              </div>
              <Flex gap={8} wrap role="radiogroup" aria-label="What is your question about?">
                {TEAM_PICKER.map(({ value, label }) => (
                  <Button
                    key={value}
                    shape="round"
                    size="large"
                    role="radio"
                    aria-checked={topic === value}
                    type={topic === value ? 'primary' : 'default'}
                    onClick={() => setTopic(value)}
                  >
                    {label}
                  </Button>
                ))}
              </Flex>
              <Row gutter={[16, 16]}>
                {(['plan', 'shop'] as const).map((team) => (
                  <Col key={team} xs={24} md={12}>
                    <ContactCard contact={CONTACTS[team]} recommended={team === recommendedTeam} />
                  </Col>
                ))}
              </Row>
              {recommendedTeam === 'plan' && (
                <Alert
                  type="warning"
                  showIcon
                  title="Want to cancel? Contact us rather than your bank"
                  description="Stopping your Direct Debit with your bank may be treated as a cancellation and a £60 fee will be due immediately."
                />
              )}
            </Flex>
          </Card>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        <Text type="secondary">Pet Health Club is operated by Inspiring Vet Care Limited.</Text>
      </Footer>

      <SearchPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onSelect={onPaletteSelect} />

      <FloatButton.Group shape="circle">
        <FloatButton icon={<CustomerServiceOutlined />} tooltip="Contact us" href="#contact" type="primary" />
        <FloatButton.BackTop visibilityHeight={400} />
      </FloatButton.Group>
    </Layout>
  )
}

function HelpPage() {
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: BRAND, fontFamily: FONT, borderRadius: 12, borderRadiusLG: 16 },
        components: { Collapse: { headerPadding: '18px 24px' } },
      }}
    >
      <style>{`
        .topic-card { transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .topic-card:hover { transform: translateY(-4px); }
        @media (prefers-reduced-motion: reduce) {
          .topic-card, .topic-card:hover { transition: none; transform: none; }
          html { scroll-behavior: auto; }
        }
        html { scroll-behavior: smooth; }
      `}</style>
      <HelpContent dark={dark} onToggleDark={setDark} />
    </ConfigProvider>
  )
}

export default HelpPage
