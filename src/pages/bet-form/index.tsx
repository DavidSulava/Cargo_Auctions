import { useParams, useNavigate } from '@tanstack/react-router'
import { useAuctionDetail } from '~/entities/auction/queries'
import { BetForm } from '~/widgets/bet-form'
import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { useToast } from '@astryxdesign/core/Toast'
import { Badge } from '@astryxdesign/core/Badge'

const AUCTION_TYPE_LABEL: Record<string, string> = {
  Request: 'Заявка',
  Up: 'Повышение',
  Down: 'Понижение',
  FixPrice: 'Фиксированная',
}

export default function BetFormPage() {
  const { uuid } = useParams({ from: '/auctions/$uuid/bid' })
  const navigate = useNavigate()
  const { data: auction, isLoading, isError } = useAuctionDetail(uuid)
  const toast = useToast()

  const backToAuction = () => navigate({ to: `/auctions/${uuid}` })
  const handleComplete = () => {
    toast({ body: 'Ставка успешно принята', type: 'info' })
    backToAuction()
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton width="200px" height="28px" />
        <Skeleton width="100%" height="200px" />
      </div>
    )
  }

  if (isError || !auction) {
    return (
      <div className="p-4 space-y-4">
        <Button label="← Назад к аукциону" variant="ghost" onClick={backToAuction} />
        <div className="content-enter">
          <Banner status="error" title="Аукцион не найден" />
        </div>
      </div>
    )
  }

  return (
    <div className="content-enter p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button label="← Назад к аукциону" variant="ghost" onClick={backToAuction} />
        <Badge variant="neutral" label={AUCTION_TYPE_LABEL[auction.auc_type] ?? auction.auc_type} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-primary">{auction.cargo_num}</h1>
        <p className="text-secondary">{auction.trading.my_bet ? 'Изменить ставку' : 'Сделать ставку'}</p>
      </div>

      <BetForm auction={auction} onComplete={handleComplete} onBack={backToAuction} />
    </div>
  )
}
