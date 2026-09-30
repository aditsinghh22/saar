import React, { useState } from 'react';
import { Header } from './components/Header';
import { ParcelMap } from './components/ParcelMap';
import { ParcelDetailDrawer } from './components/ParcelDetailDrawer';
import { WorkflowEngine } from './components/WorkflowEngine';
import { CitizenServices } from './components/CitizenServices';
import { IntegrityEngine } from './components/IntegrityEngine';
import { StateOnboarding } from './components/StateOnboarding';
import { LivingDocument } from './components/LivingDocument';
import { GoRTModal } from './components/GoRTModal';
import { AuditChainModal } from './components/AuditChainModal';
import { MOCK_PARCELS } from './data/mockParcels';
import { Parcel, StateCode, LanguageCode } from './types/land';

export const App: React.FC = () => {
  // Navigation & State Management
  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedState, setSelectedState] = useState<StateCode>('CH');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  
  // Parcels Data State (allowing mutations and onboarding additions)
  const [parcels, setParcels] = useState<Parcel[]>(MOCK_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // Modals
  const [isGoRTModalOpen, setIsGoRTModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Global Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle Search Submission
  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    const found = parcels.find(
      (p) =>
        p.ulpin.toLowerCase().includes(q) ||
        p.localSurveyNo.toLowerCase().includes(q) ||
        p.owners.some((o) => o.name.toLowerCase().includes(q))
    );

    if (found) {
      setSelectedState(found.state);
      setSelectedParcel(found);
      setActiveTab('map');
    } else {
      alert(`No parcel found matching "${searchQuery}". Try "104-B", "341/1", or "Harpreet".`);
    }
  };

  // Handle successful mutation approval updating RoR
  const handleMutationSuccess = (ulpin: string, newOwnerName: string) => {
    setParcels((prev) =>
      prev.map((p) => {
        if (p.ulpin === ulpin) {
          return {
            ...p,
            owners: [
              {
                id: `OWN-${Date.now()}`,
                name: newOwnerName,
                maskedName: `${newOwnerName.slice(0, 2)}******* ${newOwnerName.slice(-3)}`,
                shareNumerator: 1,
                shareDenominator: 1,
                sharePercentage: 100,
                aadhaarToken: 'VID-MUTATED-TOKEN',
                gender: 'Individual'
              }
            ],
            tax: {
              ...p.tax,
              annualValueInr: 48000,
              arrearsInr: 0,
              paymentStatus: 'PAID'
            },
            systemTime: new Date().toLocaleString()
          };
        }
        return p;
      })
    );
  };

  // Handle state deployment from 5-Minute Onboarding Studio
  const handleStateDeployed = (stateCode: StateCode) => {
    setSelectedState(stateCode);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413] flex flex-col font-sans selection:bg-[#C45A34] selection:text-white">
      {/* Universal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        onOpenGoRTModal={() => setIsGoRTModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'map' && (
          <ParcelMap
            parcels={parcels}
            selectedState={selectedState}
            onSelectParcel={(parcel) => setSelectedParcel(parcel)}
            selectedParcel={selectedParcel}
          />
        )}

        {activeTab === 'workflow' && (
          <WorkflowEngine
            parcels={parcels}
            onTriggerMutationSuccess={handleMutationSuccess}
          />
        )}

        {activeTab === 'citizen' && (
          <CitizenServices
            parcels={parcels}
          />
        )}

        {activeTab === 'integrity' && (
          <IntegrityEngine
            parcels={parcels}
            onInspectParcel={(parcel) => {
              setSelectedState(parcel.state);
              setSelectedParcel(parcel);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'onboarding' && (
          <StateOnboarding
            onStateDeployed={handleStateDeployed}
          />
        )}

        {activeTab === 'standards' && (
          <LivingDocument />
        )}

        {/* Parcel Inspection Side Drawer */}
        <ParcelDetailDrawer
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          onActionClick={(action, p) => {
            if (action === 'DISPATCH_WORKFLOW') {
              setActiveTab('integrity');
              setSelectedParcel(null);
            }
          }}
        />
      </main>

      {/* Glossaries and Audit Modals */}
      <GoRTModal
        isOpen={isGoRTModalOpen}
        onClose={() => setIsGoRTModalOpen(false)}
      />

      <AuditChainModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};

export default App;
