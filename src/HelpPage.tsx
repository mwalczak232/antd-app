import { useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  Flex,
  Input,
  Layout,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  CloseCircleOutlined,
  CreditCardOutlined,
  DislikeOutlined,
  LikeOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  SearchOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text, Link } = Typography

type Category = 'plan' | 'cancel' | 'payments' | 'shop'

interface Faq {
  key: string
  category: Category
  question: string
  answer: string
}

const PLAN_SUPPORT = { phone: '01225 489821', email: 'info@pethealthclub.com' }
const SHOP_SUPPORT = {
  phone: '01761 250 848',
  email: 'shop@thepethealthclub.co.uk',
  hours: 'Monday to Friday, 9:00am – 5:00pm',
}

const CATEGORIES: { value: Category; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'plan',
    label: 'Using my plan',
    description: 'Where you can use your plan and what it covers',
    icon: <MedicineBoxOutlined />,
  },
  {
    value: 'cancel',
    label: 'Cancelling',
    description: 'How to end your subscription the right way',
    icon: <CloseCircleOutlined />,
  },
  {
    value: 'payments',
    label: 'Payments',
    description: 'Direct Debits and payment dates',
    icon: <CreditCardOutlined />,
  },
  {
    value: 'shop',
    label: 'Shop orders',
    description: 'Pet supply orders and Repeat & Save',
    icon: <ShoppingOutlined />,
  },
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
    answer: `Shop orders and Repeat & Save are handled by the Pet Health Club Shop team. Call ${SHOP_SUPPORT.phone} or email ${SHOP_SUPPORT.email}, ${SHOP_SUPPORT.hours}.`,
  },
]

function FaqFeedback() {
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  if (vote === 'yes') return <Text type="secondary">Thanks for letting us know.</Text>
  if (vote === 'no')
    return (
      <Text type="secondary">
        Sorry this didn’t help. Our team can answer it directly. See <Link href="#contact">Contact us</Link>.
      </Text>
    )
  return (
    <Space size="small" wrap>
      <Text type="secondary">Was this helpful?</Text>
      <Button size="small" icon={<LikeOutlined />} onClick={() => setVote('yes')}>
        Yes
      </Button>
      <Button size="small" icon={<DislikeOutlined />} onClick={() => setVote('no')}>
        No
      </Button>
    </Space>
  )
}

function ContactCard({
  title,
  description,
  phone,
  email,
  hours,
}: {
  title: string
  description: string
  phone: string
  email: string
  hours?: string
}) {
  return (
    <Card title={title} style={{ height: '100%' }}>
      <Flex vertical gap={12}>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          {description}
        </Paragraph>
        <Space>
          <PhoneOutlined />
          <Text copyable={{ text: phone }}>
            <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
          </Text>
        </Space>
        <Space>
          <MailOutlined />
          <Text copyable={{ text: email }}>
            <a href={`mailto:${email}`}>{email}</a>
          </Text>
        </Space>
        {hours && <Tag style={{ alignSelf: 'flex-start' }}>{hours}</Tag>}
      </Flex>
    </Card>
  )
}

function HelpPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const faqRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FAQS.filter(
      (faq) =>
        (category === 'all' || faq.category === category) &&
        (!q || `${faq.question} ${faq.answer}`.toLowerCase().includes(q)),
    )
  }, [query, category])

  const pickCategory = (value: Category) => {
    setCategory(value)
    setQuery('')
    faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: 16 }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          Pet Health Club
        </Title>
        <Button ghost icon={<PhoneOutlined />} href="#contact">
          Contact us
        </Button>
      </Header>

      <Content>
        <div style={{ background: '#fff', padding: '48px 16px' }}>
          <Flex vertical align="center" gap={16} style={{ maxWidth: 640, margin: '0 auto' }}>
            <Title level={1} style={{ margin: 0, textAlign: 'center' }}>
              How can we help?
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, textAlign: 'center' }}>
              Find answers about your pet care plan, or get in touch with the right team.
            </Paragraph>
            <Input
              id="help-search"
              size="large"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search, e.g. “cancel” or “Direct Debit”"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setCategory('all')
              }}
              aria-label="Search help articles"
            />
          </Flex>
        </div>

        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 16px' }}>
          <Row gutter={[16, 16]}>
            {CATEGORIES.map((c) => (
              <Col key={c.value} xs={12} lg={6}>
                <Card hoverable onClick={() => pickCategory(c.value)} style={{ height: '100%' }}>
                  <Flex vertical gap={8}>
                    <Text style={{ fontSize: 24, color: '#1677ff' }}>{c.icon}</Text>
                    <Text strong>{c.label}</Text>
                    <Text type="secondary">{c.description}</Text>
                  </Flex>
                </Card>
              </Col>
            ))}
          </Row>

          <div ref={faqRef} style={{ scrollMarginTop: 16, marginTop: 48 }}>
            <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0 }}>
                Frequently asked questions
              </Title>
              <Segmented
                value={category}
                onChange={(v) => setCategory(v as Category | 'all')}
                options={[{ value: 'all', label: 'All' }, ...CATEGORIES.map(({ value, label }) => ({ value, label }))]}
                style={{ maxWidth: '100%', overflowX: 'auto' }}
              />
            </Flex>

            {results.length > 0 ? (
              <Collapse
                size="large"
                items={results.map((faq) => ({
                  key: faq.key,
                  label: faq.question,
                  children: (
                    <Flex vertical gap={12}>
                      <Paragraph style={{ margin: 0 }}>{faq.answer}</Paragraph>
                      <FaqFeedback />
                    </Flex>
                  ),
                }))}
              />
            ) : (
              <Card>
                <Empty description={query ? `No answers match “${query}”` : 'No questions in this topic yet'}>
                  <Button
                    onClick={() => {
                      setQuery('')
                      setCategory('all')
                    }}
                  >
                    Show all questions
                  </Button>
                </Empty>
              </Card>
            )}
          </div>

          <div id="contact" style={{ scrollMarginTop: 16, marginTop: 48 }}>
            <Title level={2}>Contact us</Title>
            <Paragraph type="secondary">Pick the team that matches your question so you reach the right people first time.</Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <ContactCard
                  title="Pet care plan support"
                  description="Questions about your plan, membership, payments or cancelling."
                  {...PLAN_SUPPORT}
                />
              </Col>
              <Col xs={24} md={12}>
                <ContactCard
                  title="Shop support"
                  description="Pet supply orders and the Repeat & Save programme."
                  {...SHOP_SUPPORT}
                />
              </Col>
            </Row>
            <Alert
              style={{ marginTop: 16 }}
              type="warning"
              showIcon
              message="Want to cancel? Contact us rather than your bank"
              description="Stopping your Direct Debit with your bank may be treated as a cancellation and a £60 fee will be due immediately."
            />
          </div>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        <Text type="secondary">Pet Health Club is operated by Inspiring Vet Care Limited.</Text>
      </Footer>
    </Layout>
  )
}

export default HelpPage
