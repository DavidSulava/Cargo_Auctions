import { useParams, useNavigate } from '@tanstack/react-router'
import { useAuctionDetail } from '~/entities/auction/queries'
import { usePlaceBet } from '~/entities/bet/queries'
import { BetFormModal } from '~/widgets/bet-form-modal'
import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { useToast } from '@astryxdesign/core/Toast'

export default function BetFormPage() {
  const { uuid } = useParams({ from: '/auctions/$uuid/bid' })
  const navigate = useNavigate()
  const { data: auction, isLoading, isError } = useAuctionDetail(uuid)
  const { mutateAsync: placeBet, isPending } = usePlaceBet(uuid)
  const toast = useToast()

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton width="60%" height="32px" />
        <Skeleton width="100%" height="200px" />
      </div>
    )
  }

  if (isError || !auction) {
    return (
      <div className="p-4">
        <Banner status="error" title="Аукцион не найден" />
        <Button label="Назад" variant="secondary" className="mt-4" onClick={() => navigate({ to: `/auctions/${uuid}` })} />
      </div>
    )
  }

  if (!auction.trading.can_set_bet) {
    return (
      <div className="p-4">
        <Banner status="warning" title="Ставки закрыты">
          На этот аукцион нельзя сделать ставку.
        </Banner>
        <Button label="Назад к аукциону" variant="secondary" className="mt-4" onClick={() => navigate({ to: `/auctions/${uuid}` })} />
      </div>
    )
  }

  return (
    <BetFormModal
      auction={auction}
      isPending={isPending}
      onClose={() => navigate({ to: `/auctions/${uuid}` })}
      onSubmit={async (data) => {
        try {
          await placeBet(data)
          toast({ body: 'Ставка успешно принята', type: 'info' })
          navigate({ to: `/auctions/${uuid}` })
        } catch (err: any) {
          if (err?.status === 422) {
            toast({ body: err?.message ?? 'Ошибка валидации', type: 'error' })
          } else {
            toast({ body: 'Не удалось разместить ставку', type: 'error' })
          }
          throw err
        }
      }}
    />
  )
}
