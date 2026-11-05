import React from 'react';
import { HistoryRecord } from '../types.ts';

interface HistoryViewProps {
  history: HistoryRecord[];
  onReopen: (record: HistoryRecord) => void;
  onClearHistory: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onReopen,
  onClearHistory
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Generation History Log
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Tracks generation requests with parameters, settings, and result snapshots.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear History
          </button>
        )}
      </div>

      {/* History Items */}
      {history.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-lg bg-slate-900/50 border border-slate-800">
          <h3 className="text-base font-bold text-slate-300 mb-1">No history yet</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Your generation requests will be logged here for easy review and reopening.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => {
            const count = record.result?.ideas?.length || 0;

            return (
              <div
                key={record.id}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-base">
                      {record.topic}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span>{record.settings?.category || 'General'}</span>
                    <span className="text-slate-600">/</span>
                    <span>{record.settings?.style || 'Witty'}</span>
                    <span className="text-slate-600">/</span>
                    <span>{record.settings?.language || 'English'}</span>
                    <span className="text-slate-600">/</span>
                    <span>{count} ideas generated</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-500">
                      {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onReopen(record)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors cursor-pointer"
                  >
                    Reopen in Studio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
