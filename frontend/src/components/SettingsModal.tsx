import React, { useState } from 'react';
import { X, Key, Cpu, ExternalLink, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'openrouter/free', name: 'OpenRouter Free Auto-Route (Recommended)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta Llama 3.3 70B Instruct (Free)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Google Gemini 2.0 Flash (Free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 Reasoning (Free)' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B Instruct (Free)' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct (Free)' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey);
    setSelectedModel(tempModel);
    localStorage.setItem('openrouter_api_key', tempKey);
    localStorage.setItem('openrouter_model', tempModel);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-dargold-400/20 text-dargold-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white">OpenRouter AI Configuration</h2>
              <p className="text-xs text-slate-400">Set API key & select model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-300">OpenRouter API Key</label>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="text-dargold-400 hover:underline flex items-center space-x-1"
            >
              <span>Get API key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <input
            type="password"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-dargold-400 text-sm font-mono"
          />
          <p className="text-[11px] text-slate-400">
            If left blank, the assistant uses the backend environment key or intelligent grounded synthesis.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Model Selection
          </label>
          <select
            value={tempModel}
            onChange={(e) => setTempModel(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-dargold-400 text-sm"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            All listed models are on OpenRouter's free tier with automated fallback on rate-limits.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-dargold-400 text-navy-950 font-bold hover:bg-dargold-300 transition-all text-xs shadow-md shadow-dargold-500/20"
          >
            {savedNotice ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
