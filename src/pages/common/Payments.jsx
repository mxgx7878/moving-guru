import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  Download,
  CreditCard,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { ROLE_THEME } from "../../config/portalConfig";
import { fetchPayments } from "../../store/actions/paymentAction";
import { STATUS } from "../../constants/apiConstants";
import { TableSkeleton, CardSkeleton } from "../../components/feedback";
import { Button, IconButton } from "../../components/ui";

// Status config — pill colour + icon per payment status
const STATUS_CONFIG = {
  paid:    { label: "Paid",    cls: "text-emerald-600 bg-emerald-50", Icon: CheckCircle },
  failed:  { label: "Failed",  cls: "text-rose-600 bg-rose-50",       Icon: XCircle    },
  pending: { label: "Pending", cls: "text-amber-600 bg-amber-50",     Icon: CreditCard },
  refunded:{ label: "Refunded",cls: "text-[#9A9A94] bg-[#F5F2EC]",   Icon: CreditCard },
};

export default function Payments() {
  const dispatch = useDispatch();
  const { user }            = useSelector((s) => s.auth);
  const { payments, status } = useSelector((s) => s.payment);

  const role  = user?.role || "instructor";
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const total = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.amount || 0), 0);

  // Use the Stripe-hosted PDF URL returned directly in the API response.
  // No auth header needed — Stripe URLs are time-limited signed URLs.
  const handleDownload = (p) => {
    const url = p.invoicePdfUrl || p.hostedInvoiceUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Invoice not available yet — check back shortly.");
    }
  };

  if (status === STATUS.LOADING && payments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">
            Payment History
          </h1>
          <p className="text-[#9A9A94] text-sm mt-1">
            Your billing history and invoices
          </p>
        </div>
        <CardSkeleton count={3} />
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">
          Payment History
        </h1>
        <p className="text-[#9A9A94] text-sm mt-1">
          Your billing history and invoices
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <DollarSign
            size={16}
            style={{ color: theme.accent }}
            className="mx-auto mb-2"
          />
          <p className="font-unbounded text-xl font-black text-[#3E3D38]">
            ${parseFloat(total).toFixed(2)}
          </p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">
            Total Paid
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <CreditCard size={16} className="text-[#E89560] mx-auto mb-2" />
          <p className="font-unbounded text-xl font-black text-[#3E3D38]">
            {payments.length}
          </p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">
            Payments
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <Calendar size={16} className="text-[#2DA4D6] mx-auto mb-2" />
          <p className="font-unbounded text-sm font-black text-[#3E3D38]">
            {user?.subscriptionRenews || user?.subscription_renews || "—"}
          </p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">
            Next Renewal
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8]">
          <h3 className="font-unbounded text-xs font-bold text-[#3E3D38] tracking-wider uppercase">
            Transactions
          </h3>
        </div>

        <div className="divide-y divide-[#E5E0D8]/50">
          {payments.map((p) => {
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
            const { Icon } = cfg;
            return (
              <div
                key={p.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#FDFCF8] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      p.status === "paid" ? "bg-emerald-50" : "bg-rose-50"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        p.status === "paid"
                          ? "text-emerald-500"
                          : "text-rose-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3E3D38]">
                      {p.plan} Subscription
                    </p>
                    <p className="text-xs text-[#9A9A94]">
                      {p.date} · {p.invoice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-unbounded text-sm font-bold text-[#3E3D38]">
                      ${parseFloat(p.amount).toFixed(2)}{" "}
                      <span className="text-[10px] font-normal text-[#9A9A94]">
                        {p.currency}
                      </span>
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <IconButton
                    variant="plain"
                    aria-label="Download invoice"
                    title={
                      p.invoicePdfUrl || p.hostedInvoiceUrl
                        ? "Download invoice"
                        : "Invoice not yet available"
                    }
                    onClick={() => handleDownload(p)}
                    disabled={!p.invoicePdfUrl && !p.hostedInvoiceUrl}
                  >
                    <Download size={14} />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>

        {payments.length === 0 && (
          <div className="px-6 py-12 text-center">
            <CreditCard size={32} className="text-[#E5E0D8] mx-auto mb-3" />
            <p className="text-[#9A9A94] text-sm">No payments yet</p>
          </div>
        )}
      </div>

      <p className="text-center text-[#9A9A94] text-xs">
        Need a receipt or have billing questions? Contact{" "}
        <a
          href="mailto:admin@movingguru.co"
          className="hover:underline"
          style={{ color: theme.accent }}
        >
          admin@movingguru.co
        </a>
      </p>
    </div>
  );
}