import { BuildSession } from '@/components/BuildSession'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function BuildSessionPage({ params }: Props) {
  const { sessionId } = await params
  return <BuildSession sessionId={sessionId} />
}
