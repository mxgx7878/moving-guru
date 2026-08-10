import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Clock, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Modal, Button } from '../../components/ui';
import CheckoutModal from '../billing/CheckoutModal';
import GrowPromoField from '../billing/GrowPromoField';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import axiosInstance from '../../config/axiosInstance';
import { loadStripeOnce } from '../../services/stripe';

const cardName = (card) => {
  const brand = card.brand
    ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
    : 'Card';
  return `${brand}${card.last4 ? ` •••• ${card.last4}` : ''}`;
};

export function GrowStripePaymentControls({
  purpose,
  amount,
  pricingTierId = null,
  postId = null,
  promoCode = null,
  ctaLabel,
  role,
  onSuccess,
  onBusyChange,
}) {
  const [cards, setCards] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [working, setWorking] = useState(false);
  const [setupSecret, setSetupSecret] = useState(null);
  const [addingCard, setAddingCard] = useState(false);

  const setPaymentBusy = (value) => {
    setWorking(value);
    onBusyChange?.(value);
  };

  const loadCards = useCallback(async (preferredId = null) => {
    setLoadingCards(true);
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ATTACH_PAYMENT_METHOD);
      const list = Array.isArray(data.data?.paymentMethods)
        ? data.data.paymentMethods
        : data.data?.paymentMethod ? [data.data.paymentMethod] : [];
      const nextId = preferredId
        || data.data?.defaultPaymentMethodId
        || list.find((card) => card.isDefault)?.id
        || list[0]?.id
        || null;
      setCards(list);
      setSelectedId(nextId);
    } catch {
      toast.error('Could not load your saved cards.');
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  const openCardForm = async () => {
    setPaymentBusy(true);
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.SETUP_INTENT);
      setSetupSecret(data.data?.clientSecret || null);
      setAddingCard(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open the secure card form.');
    } finally {
      setPaymentBusy(false);
    }
  };

  const pay = async () => {
    if (!selectedId || working) return;
    setPaymentBusy(true);
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.GROW_PAYMENT_INTENTS, {
        purpose,
        pricingTierId,
        postId,
        paymentMethodId: selectedId,
        ...(promoCode ? { promoCode } : {}),
      });
      const payment = data.data;
      const stripe = await loadStripeOnce();
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        payment.clientSecret,
        { payment_method: selectedId },
      );

      if (error) {
        toast.error(error.message || 'Stripe could not complete the payment.');
        return;
      }
      if (paymentIntent?.status !== payment.expectedStatus) {
        toast.error('Stripe has not completed this payment yet. Please retry.');
        return;
      }

      const completed = await axiosInstance.post(API_ENDPOINTS.GROW_PAYMENT_COMPLETE, {
        paymentIntentId: payment.paymentIntentId,
      });
      onSuccess?.(completed.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment could not be completed.');
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-[#E5E0D8]">
      <p className="text-xs font-bold">Payment method</p>
      {loadingCards ? (
        <div className="flex items-center justify-center gap-2 py-5 text-xs text-[#6B6B66]">
          <Loader2 size={16} className="animate-spin" /> Loading saved cards…
        </div>
      ) : cards.length > 0 ? (
        <div className="space-y-2 max-h-44 overflow-y-auto">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              disabled={working}
              onClick={() => setSelectedId(card.id)}
              className={`w-full rounded-xl border p-3 text-left flex items-center gap-3 ${selectedId === card.id ? 'border-coral bg-coral/5' : 'border-[#E5E0D8]'}`}
            >
              <CreditCard size={17} />
              <span className="flex-1 text-sm font-semibold">{cardName(card)}</span>
              {card.expMonth && <span className="text-[10px] text-[#6B6B66]">{card.expMonth}/{String(card.expYear).slice(-2)}</span>}
              {card.isDefault && <span className="text-[9px] font-bold text-blue-700">DEFAULT</span>}
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Add a card before continuing.</p>
      )}

      <button
        type="button"
        disabled={working}
        onClick={openCardForm}
        className="inline-flex items-center gap-1.5 text-xs font-bold underline disabled:opacity-50"
      >
        <Plus size={13} /> Add another card
      </button>

      <Button
        variant="primary"
        icon={CreditCard}
        loading={working}
        disabled={!selectedId || loadingCards}
        onClick={pay}
        className="w-full"
      >
        {ctaLabel || `Pay $${amount}`}
      </Button>

      <CheckoutModal
        open={addingCard}
        clientSecret={setupSecret}
        title="Add a payment card"
        ctaLabel="Save card"
        role={role}
        onClose={() => setAddingCard(false)}
        onSuccess={async (paymentMethodId) => {
          setAddingCard(false);
          setSetupSecret(null);
          await loadCards(paymentMethodId);
        }}
      />
    </div>
  );
}

export default function GrowPaymentModal({ open, onCancel, onPaid, role = 'instructor' }) {
  const [tiers, setTiers] = useState([]);
  const [tierId, setTierId] = useState(null);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [working, setWorking] = useState(false);
  const [promo, setPromo] = useState(null);
  const tier = tiers.find((item) => String(item.id) === String(tierId)) || tiers[0];

  const listPrice  = Number(tier?.price ?? 0);
  const payAmount  = promo ? Number(promo.finalAmount) : listPrice;
  const discount   = promo ? Number(promo.discountAmount) : 0;

  useEffect(() => {
    if (!open) return;
    setLoadingTiers(true);
    axiosInstance.get(API_ENDPOINTS.GROW_POST_TIERS)
      .then(({ data }) => {
        const list = Array.isArray(data.data) ? data.data : [];
        setTiers(list);
        setTierId(list[0]?.id ?? null);
      })
      .catch(() => toast.error('Could not load Grow pricing tiers.'))
      .finally(() => setLoadingTiers(false));
  }, [open]);

  if (!open) return null;

  return (
    <Modal
      open
      size="md"
      title="Choose your post duration"
      subtitle="Your card is charged now. The listing is published after admin approval."
      onClose={working ? undefined : onCancel}
      dismissOnBackdrop={!working}
      zIndex="z-[60]"
      footer={<Button variant="secondary" onClick={onCancel} disabled={working}>Cancel</Button>}
    >
      <div className="space-y-3">
        {loadingTiers && (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin" size={20} /></div>
        )}
        {!loadingTiers && tiers.map((item) => {
          const selected = item.id === tierId;
          return (
            <button
              key={item.id}
              type="button"
              disabled={working}
              onClick={() => setTierId(item.id)}
              className={`w-full flex items-center justify-between gap-4 rounded-xl border p-4 text-left ${selected ? 'border-coral bg-coral/5' : 'border-[#E5E0D8]'}`}
            >
              <div className="flex items-start gap-3">
                {selected ? <CheckCircle2 size={20} className="text-coral" /> : <Clock size={20} />}
                <div>
                  <p className="font-['Unbounded'] text-sm font-black">{item.name}</p>
                  <p className="text-xs text-[#6B6B66] mt-0.5">{item.description || `${item.duration_days} days live`}</p>
                </div>
              </div>
              <p className="font-['Unbounded'] text-lg font-black">${Number(item.price).toFixed(2)}</p>
            </button>
          );
        })}

        <p className="text-[11px] text-[#6B6B66] leading-relaxed">
          Payment is taken immediately. The purchased live period begins when an admin approves the post.
        </p>

        {tier && (
          <div className="pt-1">
            <GrowPromoField
              pricingTierId={tier.id}
              onApplied={setPromo}
            />
          </div>
        )}

        {tier && promo && (
          <div className="rounded-xl bg-[#F7F5F0] px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between text-[#6B6B66]">
              <span>Subtotal</span><span>${listPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({promo.code})</span><span>−${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#3E3D38] pt-1 border-t border-[#E5E0D8]">
              <span>Total due</span><span>${payAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {tier && <GrowStripePaymentControls
          purpose="listing"
          amount={payAmount}
          pricingTierId={tier.id}
          promoCode={promo?.code || null}
          role={role}
          onBusyChange={setWorking}
          ctaLabel={`Pay $${payAmount.toFixed(2)} & Submit`}
          onSuccess={({ paymentIntentId }) => {
            toast.success('Payment successful—submitting your post for approval.');
            onPaid?.({ tierId: tier.id, paymentIntentId });
          }}
        />}
      </div>
    </Modal>
  );
}
