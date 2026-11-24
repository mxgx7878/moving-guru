import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchAdminPlans } from "../../store/actions/subscriptionAction";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Check, User, Building2 } from "lucide-react";

import { Modal, Button, RHFInput, SelectField } from "../../components/ui";
import { showFormValidationErrors } from "../../utils/formValidation";

const ROLE_OPTIONS = [
  { id: "instructor", label: "Instructor", icon: User, color: "#4E7A1B" },
  { id: "studio", label: "Studio", icon: Building2, color: "#4E7A1B" },
];

const STATUS_OPTIONS = [
  { id: "active", label: "Active" },
  { id: "pending_payment", label: "Pending payment" },
  { id: "pending", label: "Pending approval" },
  { id: "suspended", label: "Suspended" },
];

const billingInterval = (plan) => {
  const count = Number(plan.intervalCount) || 1;
  const interval = plan.interval || "month";
  return count === 1 ? `per ${interval}` : `every ${count} ${interval}s`;
};

const planPrice = (plan) =>
  `${String(plan.currency || "").toUpperCase()} ${Number(plan.price).toFixed(2)} ${billingInterval(plan)}`;

const buildSchema = (isEdit) =>
  yup.object({
    role: yup.string().required().oneOf(["instructor", "studio", "admin"]),
    name: yup.string().when("role", {
      is: (r) => r !== "studio",
      then: (s) => s.trim().required("Name is required").max(120),
      otherwise: (s) => s.nullable(),
    }),
    studio_name: yup.string().when("role", {
      is: "studio",
      then: (s) => s.trim().required("Studio name is required").max(120),
      otherwise: (s) => s.nullable(),
    }),
    email: yup
      .string()
      .trim()
      .required("Email is required")
      .email("Invalid email address"),
    password: isEdit
      ? yup
          .string()
          .nullable()
          .test(
            "optional-min",
            "Password must be at least 12 characters",
            (v) => !v || v.length >= 12,
          )
      : yup
          .string()
          .required("Password is required")
          .min(12, "Password must be at least 12 characters"),
    phone: yup.string().nullable(),
    location: yup.string().nullable(),
    bio: yup
      .string()
      .max(1000, "Keep the bio under 1000 characters")
      .nullable(),
    status: yup.string().required(),
    is_verified: yup.boolean(),
  });

const EMPTY_FORM = {
  role: "instructor",
  name: "",
  studio_name: "",
  email: "",
  password: "",
  phone: "",
  location: "",
  bio: "",
  status: "pending_payment",
  is_verified: false,
};

const userToForm = (u) => ({
  role: u.role || "instructor",
  name: u.name || "",
  studio_name: u.studio_name || "",
  email: u.email || "",
  password: "",
  phone: u.phone || "",
  location: u.location || "",
  bio: u.bio || u.description || "",
  status: u.status || (u.is_active === false ? "suspended" : "active"),
  is_verified: Boolean(u.is_verified),
});

export default function UserForm({ user, saving = false, onCancel, onSubmit, onUpdateSubscription }) {
  const isEditing = Boolean(user);
  const dispatch = useDispatch();
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState(false);
  const [plansRequest, setPlansRequest] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const currentPlanId = user?.plan_id || "";

  useEffect(() => { setSelectedPlanId(""); }, [user?.id, currentPlanId]);

  useEffect(() => {
    if (!isEditing || !currentPlanId || user?.subscription_status !== "active") return;
    let active = true;
    setPlansError(false);
    dispatch(fetchAdminPlans()).unwrap()
      .then((catalog) => { if (active) setPlans(catalog); })
      .catch(() => { if (active) setPlansError(true); });
    return () => { active = false; };
  }, [dispatch, isEditing, currentPlanId, user?.subscription_status, plansRequest]);

  const currentPlan = useMemo(() => plans.find((p) => p.id === currentPlanId), [plans, currentPlanId]);
  const selectablePlans = useMemo(() => {
    const current = plans.find((p) => p.id === currentPlanId);
    return plans
      .filter((p) => p.id !== currentPlanId && current && p.isActive
        && Number(p.price) > 0 && p.currency === current.currency)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [plans, currentPlanId]);

  const schema = useMemo(() => buildSchema(isEditing), [isEditing]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: user ? userToForm(user) : EMPTY_FORM,
  });

  const role = watch("role");
  const isStudio = role === "studio";
  const accent = useMemo(
    () => ROLE_OPTIONS.find((r) => r.id === role)?.color || "#4E7A1B",
    [role],
  );

  useEffect(() => {
    if (isStudio) setValue("name", "");
    else setValue("studio_name", "");
  }, [isStudio, setValue]);

  const submit = (values) => {
    const payload = {
      role: values.role,
      email: values.email.trim(),
      phone: (values.phone || "").trim() || null,
      location: (values.location || "").trim() || null,
      bio: (values.bio || "").trim() || null,
      status: values.status,
      is_verified: Boolean(values.is_verified),
    };
    if (values.role === "studio")
      payload.studio_name = values.studio_name.trim();
    else payload.name = values.name.trim();

    if (!isEditing && values.password) payload.password = values.password;
    onSubmit(payload);
  };

  const updateSubscription = () => {
    if (!selectedPlanId || selectedPlanId === currentPlanId || saving) return;
    onUpdateSubscription({
      planId: selectedPlanId,
      expectedPlanId: currentPlanId,
      expectedSubscriptionUpdatedAt: user.subscription_updated_at,
    });
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onCancel}
      title={isEditing ? "Edit User" : "Create User"}
      subtitle={
        isEditing
          ? "Update account details, role cannot be changed once set."
          : "Manually onboard an instructor, studio or admin."
      }
      bodyClassName="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Check}
            loading={saving}
            onClick={handleSubmit(submit, showFormValidationErrors)}
          >
            {isEditing ? "Save Changes" : "Create User"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit, showFormValidationErrors)} className="space-y-5">
        {!isEditing && (
          <div>
            <label className="block text-[10px] font-bold text-ink-soft tracking-widest uppercase mb-2">
              Account Type *
            </label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const Icon = r.icon;
                    const active = field.value === r.id;
                    return (
                      <Button
                        key={r.id}
                        type="button"
                        variant={active ? "primary" : "secondary"}
                        size="md"
                        fullWidth
                        icon={Icon}
                        onClick={() => field.onChange(r.id)}
                        style={
                          active
                            ? { backgroundColor: '#B4FF5A', borderColor: '#B4FF5A', color: '#000000' }
                            : undefined
                        }
                      >
                        {r.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        )}

        {isStudio ? (
          <RHFInput
            control={control}
            errors={errors}
            name="studio_name"
            label="Studio Name *"
            placeholder="e.g. Shakti Yoga Studio"
            accent={accent}
          />
        ) : (
          <RHFInput
            control={control}
            errors={errors}
            name="name"
            label="Full Name *"
            placeholder="e.g. Maya Patel"
            accent={accent}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RHFInput
            control={control}
            errors={errors}
            name="email"
            type="email"
            label="Email *"
            placeholder="user@example.com"
            accent={accent}
          />
          <RHFInput
            control={control}
            errors={errors}
            name="phone"
            label="Phone"
            placeholder="+1 555 123 4567"
            accent={accent}
          />
        </div>

        {!isEditing && (
          <RHFInput
            control={control}
            errors={errors}
            name="password"
            type="password"
            label="Password *"
            placeholder="At least 12 characters"
            hint="Use at least 12 characters. Share it with the user; they can change it after login."
            accent={accent}
          />
        )}

        <RHFInput
          control={control}
          errors={errors}
          name="location"
          label="Location"
          placeholder="e.g. Bali, Indonesia"
          accent={accent}
        />

        <RHFInput
          control={control}
          errors={errors}
          name="bio"
          textarea
          rows={4}
          maxLength={1000}
          label={isStudio ? "Studio description" : "Bio"}
          placeholder={
            isStudio
              ? "Short description shown on the studio profile..."
              : "Short bio shown on the instructor profile..."
          }
          accent={accent}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SelectField
                label="Account Status"
                value={field.value}
                onChange={field.onChange}
                options={STATUS_OPTIONS.map((s) => ({
                  value: s.id,
                  label: s.label,
                }))}
                placeholder="Select status"
              />
            )}
          />
          {!isEditing && <p className="text-xs text-ink-muted sm:col-span-2">New instructor and studio accounts need a subscription before platform access.</p>}

          {isStudio && (
            <Controller
              control={control}
              name="is_verified"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer self-end pb-3">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-4 h-4 accent-sky-mg"
                  />
                  Mark studio as verified
                </label>
              )}
            />
          )}
        </div>

        {isEditing && (
          <section className="rounded-2xl border border-[#E5E0D8] bg-[#FAFEE0]/40 p-4 space-y-4" aria-labelledby="subscription-heading">
            <div>
              <h3 id="subscription-heading" className="text-sm font-bold text-ink">Subscription</h3>
              <p className="text-xs text-ink-soft">Manage this user’s plan separately from profile changes.</p>
            </div>

            <div className="rounded-xl border border-[#B4FF5A] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Current plan</p>
              <p className="mt-1 text-base font-bold text-ink">{user.plan_name || currentPlan?.name || "No active subscription"}</p>
              {currentPlan && <p className="mt-1 text-xs text-ink-soft">{planPrice(currentPlan)}</p>}
              {user.subscription_status && <p className="mt-1 text-xs text-ink-soft">Status: {user.subscription_status}</p>}
            </div>

            {currentPlanId && user.subscription_status === "active" && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Change to</p>
                {plansError ? (
                  <button type="button" onClick={() => setPlansRequest((n) => n + 1)} className="text-xs underline">Retry loading plans</button>
                ) : plans.length === 0 ? (
                  <p className="text-xs text-ink-soft">Loading plans…</p>
                ) : selectablePlans.length === 0 ? (
                  <p className="text-xs text-ink-soft">No other compatible paid plans are available.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectablePlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        disabled={saving}
                        aria-pressed={selectedPlanId === plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`rounded-xl border p-3 text-left transition-colors disabled:opacity-60 ${
                          selectedPlanId === plan.id
                            ? "border-[#4E7A1B] bg-[#B4FF5A]/30"
                            : "border-[#E5E0D8] bg-white hover:border-[#4E7A1B]"
                        }`}
                      >
                        <span className="block text-sm font-bold text-ink">{plan.name || plan.id}</span>
                        <span className="block mt-1 text-xs text-ink-soft">{planPrice(plan)}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-ink-soft">New plan access starts now. Its price applies on the existing next billing date, and the user receives an email.</p>
                <Button
                  type="button"
                  variant="primary"
                  loading={saving}
                  disabled={!selectedPlanId}
                  onClick={updateSubscription}
                >
                  Update Subscription
                </Button>
              </div>
            )}
          </section>
        )}
      </form>
    </Modal>
  );
}
