import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { PropertiesCatalog } from './components/PropertiesCatalog';
import { ScraperDashboard } from './components/ScraperDashboard';
import { SettingsModal } from './components/SettingsModal';
import { api } from './services/api';
import { Property, Message, ScrapeStatus, HealthStatus } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'catalog' | 'scraper'>('chat');
  const [properties, setProperties] = useState<Property[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus | null>(null);
  
  // Settings
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('openrouter_api_key') || '');
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem('openrouter_model') || 'openrouter/free'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    loadHealth();
    loadProperties();
    loadScrapeStatus();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (e) {
      console.warn("Could not load health status:", e);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await api.getProperties('ALL', undefined, undefined, 100);
      setProperties(res.properties);
    } catch (e) {
      console.warn("Could not load properties:", e);
    }
  };

  const loadScrapeStatus = async () => {
    try {
      const status = await api.getScrapeStatus();
      setScrapeStatus(status);
    } catch (e) {
      console.warn("Could not load scrape status:", e);
    }
  };

  const handleSendMessage = async (userText: string) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resp = await api.sendChat(
        userText,
        messages,
        sourceFilter,
        apiKey || undefined,
        selectedModel
      );

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: resp.answer,
        sources: resp.sources,
        model_used: resp.model_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Error:** ${err.message || 'Unable to connect to Real Estate AI service. Please verify server status.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAIAboutProperty = (property: Property) => {
    setActiveTab('chat');
    const prompt = `Tell me all the details about ${property.title} in ${property.location} by ${property.source}. What is the price, bedroom count, unique design features, and investment potential?`;
    handleSendMessage(prompt);
  };

  const handleTriggerScrape = async () => {
    await api.triggerScrape();
    await loadScrapeStatus();
    await loadProperties();
    await loadHealth();
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onOpenSettings={() => setIsSettingsOpen(true)}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
      />

      {/* Main Body */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onClearHistory={() => setMessages([])}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            selectedModel={selectedModel}
          />
        )}

        {activeTab === 'catalog' && (
          <PropertiesCatalog
            properties={properties}
            onAskAI={handleAskAIAboutProperty}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
          />
        )}

        {activeTab === 'scraper' && (
          <ScraperDashboard
            status={scrapeStatus}
            onTriggerScrape={handleTriggerScrape}
            onRefreshStatus={loadScrapeStatus}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
}

export default App;
