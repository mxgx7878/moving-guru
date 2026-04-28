import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import {
  Mail, Send, Eye, AlertCircle, Users, Building2,
  CheckCircle2, Sparkles,
} from 'lucide-react';

import { fetchAudienceCounts, sendBroadcast } from '../../store/actions/emailAction';
import {
  PageHeader, RHFInput, Button, SelectField, Modal,
} from '../../components/ui';

const broadcastSchema = yup.object({
  subject: yup.string().trim().required('Subject is required').max(200, 'Keep subject under 200 characters'),
  body:    yup.string().trim().required('Body is required').max(10000, 'Body too long'),
});

const AUDIENCE_OPTIONS = [
  { value: 'all',         label: 'Everyone (instructors + studios)' },
  { value: 'instructors', label: 'Instructors only' },
  { value: 'studios',     label: 'Studios only' },
  { value: 'active',      label: 'Active users only' },
  { value: 'inactive',    label: 'Inactive users (re-engagement)' },
];

export default function AdminCommunications() {
  const dispatch = useDispatch();

  const [audience,        setAudience]        = useState('all');
  const [counts,          setCounts]          = useState(null);
  const [confirming,      setConfirming]      = useState(false);
  const [sending,         setSending]         = useState(false);
  const [testing,         setTesting]         = useState(false);
  const [pendingPayload,  setPendingPayload]  = useState(null);

  const {
    control, handleSubmit, watch, formState: { errors },
  } = useForm({
    resolver: yupResolver(broadcastSchema),
    defaultValues: { subject: '', body: '' },
  });

  const subject = watch('subject');
  const body    = watch('body');

  useEffect(() => {
    dispatch(fetchAudienceCounts()).then((res) => {
      if (fetchAudienceCounts.fulfilled.match(res)) {
        setCounts(res.payload?.data || null);
      }
    });
  }, [dispatch]);

  const targetCount = counts?.[audience] ?? 0;

  const onSendTest = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Add a subject and body before sending a test.');
      return;
    }
    setTesting(true);
    const result = await dispatch(sendBroadcast({
      subject, body, audience, send_test: true,
    }));
    setTesting(false);

    if (sendBroadcast.fulfilled.match(result)) {
      toast.success('Test email sent to your inbox');
    } else {
      toast.error(result.payload || 'Could not send test email');
    }
  };

  // First step — form submit just opens the confirm modal
  const onPrepareBroadcast = (values) => {
    setPendingPayload({ ...values, audience });
    setConfirming(true);
  };

  const onConfirmBroadcast = async () => {
    if (!pendingPayload) return;
    setSending(true);
    const result = await dispatch(sendBroadcast({
      ...pendingPayload, send_test: false,
    }));
    setSending(false);
    setConfirming(false);

    if (sendBroadcast.fulfilled.match(result)) {
      const queued = result.payload?.data?.queued_count ?? 0;
      toast.success(`Broadcast queued for ${queued} recipient${queued === 1 ? '' : 's'}`);
      setPendingPayload(null);
    } else {
      toast.error(result.payload || 'Broadcast failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        icon={Mail}
        iconBg="#7F77DD1A"
        iconColor="#7F77DD"
        eyebrow="Admin / Communications"
        eyebrowColor="#7F77DD"
        title="Email Broadcast"
        description="Send announcements, updates, or re-engagement emails to platform users. Send a test to yourself first to preview."
      />

      <form onSubmit={handleSubmit(onPrepareBroadcast)} className="space-y-5">

        {/* Audience picker */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#3E3D38] tracking-widest uppercase mb-2">
              Audience
            </label>
            <SelectField
              value={audience}
              onChange={setAudience}
              options={AUDIENCE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              placeholder="Pick audience"
              accent="#7F77DD"
            />
          </div>

          {counts && (
            <div className="flex items-center gap-2 text-xs text-[#6B6B66] bg-[#7F77DD]/5 rounded-xl p-3 border border-[#7F77DD]/20">
              <Users size={14} className="text-[#7F77DD] flex-shrink-0" />
              <span>
                This will send to <strong className="text-[#3E3D38]">{targetCount.toLocaleString()}</strong> recipient{targetCount === 1 ? '' : 's'}.
              </span>
            </div>
          )}
        </div>

        {/* Compose */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 space-y-4">
          <RHFInput
            control={control}
            errors={errors}
            name="subject"
            label="Subject Line"
            placeholder="e.g. Big news — new categories on Moving Guru"
            accent="#7F77DD"
          />

          <RHFInput
            control={control}
            errors={errors}
            name="body"
            label="Body"
            textarea
            rows={10}
            placeholder="Hi {first name interpolated automatically},&#10;&#10;Write your message here. New paragraphs are preserved.&#10;&#10;— The team"
            accent="#7F77DD"
          />

          <p className="text-[10px] text-[#9A9A94] leading-relaxed flex items-start gap-1.5">
            <Sparkles size={11} className="text-[#7F77DD] mt-0.5 flex-shrink-0" />
            Each recipient's email opens with "Hi [their name]," automatically — your body content goes below that greeting.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={Eye}
            loading={testing}
            disabled={!subject || !body}
            onClick={onSendTest}
            className="hover:border-[#7F77DD] hover:text-[#7F77DD]"
          >
            Send test to me first
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Send}
            disabled={!subject || !body || targetCount === 0}
            style={{ backgroundColor: '#7F77DD' }}
          >
            Send to {targetCount.toLocaleString()} {targetCount === 1 ? 'user' : 'users'}
          </Button>
        </div>
      </form>

      {/* Confirm modal — final guard before broadcasting */}
      {confirming && (
        <Modal
          open
          size="md"
          onClose={() => setConfirming(false)}
          title="Confirm broadcast"
          subtitle="This will dispatch emails to every user in the selected audience. There's no undo."
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirming(false)} disabled={sending}>
                Cancel
              </Button>
              <Button variant="primary" loading={sending} onClick={onConfirmBroadcast}
                style={{ backgroundColor: '#7F77DD' }}>
                Yes — send it
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div className="bg-[#FDFCF8] rounded-xl border border-[#E5E0D8] p-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-[#9A9A94] uppercase tracking-wider font-semibold">
                <Mail size={11} /> Subject
              </div>
              <p className="text-sm font-semibold text-[#3E3D38]">{pendingPayload?.subject}</p>

              <div className="flex items-center gap-2 text-[10px] text-[#9A9A94] uppercase tracking-wider font-semibold pt-2">
                <Users size={11} /> Audience
              </div>
              <p className="text-sm text-[#3E3D38]">
                {AUDIENCE_OPTIONS.find((o) => o.value === pendingPayload?.audience)?.label}
                {' '}— <strong>{targetCount.toLocaleString()}</strong> recipient{targetCount === 1 ? '' : 's'}
              </p>
            </div>

            <div className="flex items-start gap-2 text-xs text-[#6B6B66] bg-[#F59E0B]/5 rounded-xl p-3 border border-[#F59E0B]/20">
              <AlertCircle size={14} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <span>
                Each recipient gets a personalised copy. Sends are queued and process in the background — expect delivery within a few minutes depending on queue throughput.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}