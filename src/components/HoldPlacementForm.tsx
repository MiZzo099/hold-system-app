import { useMemo, useState } from 'react';
import { HOLD_REASON_GROUPS, getReasonByLabel } from '../constants/ptoc';
import { DatabaseService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

interface HoldPlacementFormProps {
  onRefresh?: () => Promise<void> | void;
}

interface ParsedPatient {
  emrId: string;
  patientName: string;
  clinic: string;
  insurance: string;
}

const categories = Object.keys(HOLD_REASON_GROUPS);

function parsePatients(input: string): ParsedPatient[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(',').map((part) => part.trim());
      return {
        emrId: parts[0] || '',
        patientName: parts[1] || `Patient ${parts[0] || ''}`,
        clinic: parts[2] || 'Unknown Clinic',
        insurance: parts[3] || 'Unknown Insurance',
      };
    })
    .filter((item) => item.emrId);
}

export function HoldPlacementForm({ onRefresh }: HoldPlacementFormProps) {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [patientsInput, setPatientsInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = useMemo(
    () => HOLD_REASON_GROUPS[selectedCategory] ?? [],
    [selectedCategory],
  );

  const parsedPatients = useMemo(() => parsePatients(patientsInput), [patientsInput]);
  const selectedReasonDef = useMemo(() => getReasonByLabel(selectedReason), [selectedReason]);

  const handleSubmit = async () => {
    if (!user || !selectedReasonDef || parsedPatients.length === 0) {
      pushToast({ title: 'Missing data', description: 'Select a reason and add at least one patient row.', tone: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const results = await Promise.all(
        parsedPatients.map((patient) =>
          DatabaseService.placeHold({
            emrId: patient.emrId,
            patientName: patient.patientName,
            clinic: patient.clinic,
            category: selectedReasonDef.category,
            holdReason: selectedReasonDef.label,
            note: customNote.trim() || selectedReasonDef.note,
            insurance: patient.insurance,
            placedBy: user.email,
          }),
        ),
      );

      const failed = results.filter((result) => !result.success);
      if (failed.length > 0) {
        pushToast({
          title: 'Hold placement blocked',
          description: failed[0].error || 'Please configure the Apps Script URL in the Integration tab.',
          tone: 'error',
        });
        return;
      }

      pushToast({
        title: 'Hold placed successfully',
        description: `${parsedPatients.length} patient(s) were sent to the live PTOC workflow.`,
        tone: 'success',
      });

      setSelectedCategory('');
      setSelectedReason('');
      setPatientsInput('');
      setCustomNote('');
      setStep(1);
      await onRefresh?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Live Hold Placement</h2>
            <p className="mt-1 text-sm text-slate-400">
              This page can place real hold rows into your Google Sheet after you connect an Apps Script Web App.
            </p>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
            Patient format: <span className="font-semibold">EMR ID, Patient Name, Clinic, Insurance</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-1 items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${item <= step ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
              {item}
            </div>
            {item < 3 ? <div className={`h-1 flex-1 rounded ${item < step ? 'bg-blue-600' : 'bg-slate-800'}`} /> : null}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 shadow-xl">
        {step === 1 ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Step 1 — Choose category</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedReason('');
                    setStep(2);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-left transition hover:border-blue-500 hover:bg-slate-800"
                >
                  <div className="font-semibold text-white">{category}</div>
                  <div className="mt-1 text-sm text-slate-400">{HOLD_REASON_GROUPS[category].length} reason(s)</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Step 2 — {selectedCategory}</h3>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                ← Back
              </button>
            </div>
            <div className="space-y-3">
              {currentCategory.map((reason) => (
                <button
                  key={reason.label}
                  type="button"
                  onClick={() => {
                    setSelectedReason(reason.label);
                    setStep(3);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-left transition hover:border-blue-500 hover:bg-slate-800"
                >
                  <div className="font-semibold text-white">{reason.label}</div>
                  <div className="mt-1 text-sm text-slate-400">{reason.note}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Step 3 — Confirm and send</h3>
                <p className="mt-1 text-sm text-slate-400">Selected reason: {selectedReason}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                ← Back
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Patients</label>
                  <textarea
                    value={patientsInput}
                    onChange={(event) => setPatientsInput(event.target.value)}
                    rows={8}
                    placeholder={'12345, John Smith, Astoria, Aetna\n23456, Maria Garcia, Fordham, Medicare'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Custom Note (optional)</label>
                  <textarea
                    value={customNote}
                    onChange={(event) => setCustomNote(event.target.value)}
                    rows={4}
                    placeholder="Leave blank to use the default PTOC note for this hold reason."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Summary</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <div className="text-slate-500">Category</div>
                      <div className="font-semibold text-white">{selectedCategory}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Reason</div>
                      <div className="font-semibold text-white">{selectedReason}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Patients parsed</div>
                      <div className="font-semibold text-blue-300">{parsedPatients.length}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Current user</div>
                      <div className="font-semibold text-white">{user?.name}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
                  Real hold placement works only after adding your deployed Apps Script Web App URL in the Integration tab.
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={parsedPatients.length === 0 || isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Processing...' : 'Place Hold in Google Sheet'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
