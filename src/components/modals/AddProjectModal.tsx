import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, Link as LinkIcon, Check, Calendar } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import {
  updateProjectRecord,
  updateClientRecord,
  addAutoLog,
  addProjectAutoLog,
} from '../../api/dbService';
import { calculateProjectHealth, calculateClientHealth } from '../../utils/scoringUtils';
import { Project } from '../../types';

import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import { DatePicker } from '../ui/DatePicker';

export default function AddProjectModal() {
  const { activeModal, isModalOpen, closeModal, openModal, openDrawer } = useUI();
  const { clients, settings, projects, user } = useAppState();

  const [name, setName] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [releaseDateVal, setReleaseDateVal] = useState<number | null>(null);
  const [units, setUnits] = useState('');
  const [assignee, setAssignee] = useState('');
  const [checklistUrl, setChecklistUrl] = useState('');
  const [kycDetails, setKycDetails] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isOpen = isModalOpen('addProject');

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClientCreated = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedClients((prev) => Array.from(new Set([...prev, customEvent.detail])));
    };
    window.addEventListener('clientCreated', handleClientCreated);
    return () => window.removeEventListener('clientCreated', handleClientCreated);
  }, []);

  if (!shouldRender) return null;

  const handleClose = () => {
    closeModal();
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Project Name is required.');
      return;
    }
    if (selectedClients.length === 0) {
      setErrorMsg('At least one Attached Client is required.');
      return;
    }
    const unitsNum = parseInt(units, 10);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      setErrorMsg('Live Units must be greater than 0.');
      return;
    }

    const nameExists = projects.some(
      (p) => (p.name || '').toLowerCase() === name.trim().toLowerCase()
    );
    if (nameExists) {
      setErrorMsg('A project with this exact name already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      const matchedClients = clients.filter((c) => selectedClients.includes(c.clientId || c.id));

      let finalReleaseDateStr = '';
      const finalReleaseDateVal = releaseDateVal || 0;
      if (releaseDateVal) {
        finalReleaseDateStr = new Date(releaseDateVal).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }

      const newProject: Project = {
        id: crypto.randomUUID(),
        name: name.trim(),
        clientIds: matchedClients.map((c) => c.clientId || c.id),
        clients: matchedClients.map((c) => c.companyName || c.name),
        features: activeFeatures,
        projectStatus: 'Onboarding',
        timelineStatus: 'Not Started',
        onboardingMilestone: 'Not Started',
        assignee: assignee || 'Unassigned',
        units: units.toString(),
        releaseDateStr: finalReleaseDateStr,
        releaseDateVal: finalReleaseDateVal,
        checklistUrl,
        kycDetails,
        dateAdded: new Date().getTime(),
        lastUpdated: new Date().getTime(),
        healthScore: 'N/A',
        scoreTrajectory: [],
      };

      // Calculate initial project score
      const pHealth = calculateProjectHealth(newProject, settings);
      newProject.healthScore = pHealth.totalScore;

      // Prepare database promises
      const dbPromises: Promise<any>[] = [];
      dbPromises.push(
        updateProjectRecord(newProject, {
          successMsg: `Project '${newProject.name}' successfully created.`,
          errorMsg: `Failed to create project '${newProject.name}'.`,
        })
      );
      dbPromises.push(addProjectAutoLog(newProject.id, `Project created.`, user?.name || 'System'));

      // Iteratively update attached clients
      for (const client of matchedClients) {
        dbPromises.push(
          addAutoLog(
            client.clientId || client.id,
            `New project added: ${newProject.name}`,
            user?.name || 'System',
            true
          )
        );

        // Recalculate client health locally to sync to DB
        // (Create a copy of projects array adding the new project for math)
        const updatedProjectsForMath = [...projects, newProject];
        const cHealth = calculateClientHealth(client, updatedProjectsForMath, settings);

        const updatedClient = {
          ...client,
          activeProjectCount: (client.activeProjectCount || 0) + 1,
          healthScore: cHealth.totalScore,
          lastUpdated: new Date().getTime(),
        };
        dbPromises.push(updateClientRecord(updatedClient, { silent: true }));
      }

      await Promise.all(dbPromises);

      // Reset Form
      setName('');
      setSelectedClients([]);
      setActiveFeatures([]);
      setReleaseDateVal(null);
      setUnits('');
      setAssignee('');
      setChecklistUrl('');
      setKycDetails('');
      setNote('');
      handleClose();

      // Seamless Routing Handoff (350ms delay to let Modal animate out)
      setTimeout(() => {
        openDrawer('project', newProject.id, { targetTab: 'overview' });
      }, 350);
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while creating the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex: 120 }}
      ></div>
      <div
        className={`fixed inset-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:py-12 flex items-start justify-center custom-thin-scroll transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 130 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div
          className={`relative w-full max-w-2xl bg-white border border-border rounded-xl shadow-2xl flex flex-col my-auto text-card-foreground transition-all duration-200 ease-out transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${activeModal !== 'addProject' ? 'blur-[2px] brightness-[0.8] pointer-events-none' : ''}`}
        >
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 rounded-t-xl shrink-0">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">
              Add New Project
            </h3>
            <button
              onClick={handleClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 flex-1">
            {errorMsg && (
              <div
                id="ap-error"
                className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 mb-5"
              >
                {errorMsg}
              </div>
            )}
            {/* REQUIRED METADATA */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm"
                  placeholder="Enter project name..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Attached Client(s) <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openModal('addClient')}
                    className="text-[10px] font-bold text-primary hover:underline transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none rounded-sm px-1"
                  >
                    + Add Client
                  </button>
                </div>
                <MultiSelect
                  values={selectedClients}
                  options={[...clients]
                    .sort((a, b) =>
                      (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')
                    )
                    .map((c) => ({ label: c.companyName || c.name, value: c.clientId || c.id }))}
                  onChange={(vals) => {
                    setSelectedClients(vals);
                    setErrorMsg('');
                  }}
                  searchable={true}
                  searchPlaceholder="Search clients..."
                  className="w-full block"
                  trigger={
                    <button
                      type="button"
                      className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                    >
                      <span
                        className={`truncate ${selectedClients.length ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {selectedClients.length
                          ? selectedClients
                              .map(
                                (id) =>
                                  clients.find((c) => c.clientId === id || c.id === id)
                                    ?.companyName || id
                              )
                              .join(', ')
                          : 'Select Attached Clients...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  }
                />
              </div>
            </div>

            {/* LOGISTICS */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 mb-5 grid grid-cols-2 gap-5 items-start">
              <div className="mt-0">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Release Date
                </label>
                <DatePicker
                  value={releaseDateVal}
                  onChange={(val) => setReleaseDateVal(val)}
                  placeholder="Select Date"
                  label="Set Release Date"
                />
              </div>
              <div className="mt-0 !space-y-0">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Live Units <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => {
                    setUnits(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-[38px]"
                  placeholder="0"
                />
              </div>
            </div>

            {/* CLASSIFICATION */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 mb-5 grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Manager
                </label>
                <Select
                  value={assignee}
                  options={(settings?.managers?.map((m) => m.name) || []).map((m) => ({
                    label: m,
                    value: m,
                  }))}
                  onChange={setAssignee}
                  className="w-full block"
                  trigger={
                    <button
                      type="button"
                      className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                    >
                      <span
                        className={`truncate ${assignee ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {assignee || 'Select Manager'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  }
                />
              </div>
              <div className="mt-0">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Active Features
                </label>
                <MultiSelect
                  values={activeFeatures}
                  options={settings?.features?.map((f) => ({ label: f, value: f })) || []}
                  onChange={setActiveFeatures}
                  searchable={true}
                  searchPlaceholder="Search features..."
                  className="w-full block"
                  trigger={
                    <button
                      type="button"
                      className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                    >
                      <span
                        className={`truncate ${activeFeatures.length ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {activeFeatures.length
                          ? `${activeFeatures.length} Selected`
                          : 'Select Active Features...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  }
                />
              </div>
            </div>

            {/* CONTEXT */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Deliverables Checklist URL{' '}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={checklistUrl}
                    onChange={(e) => setChecklistUrl(e.target.value)}
                    className="w-full min-w-0 rounded-md border border-input bg-white pl-9 pr-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  KYC Details <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={kycDetails}
                  onChange={(e) => setKycDetails(e.target.value)}
                  className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-auto resize-y custom-thin-scroll"
                  placeholder="Enter KYC details here..."
                ></textarea>
              </div>
              <div className="pt-3 border-t border-border/50">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Initial Note <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-auto resize-none custom-thin-scroll"
                  placeholder="Enter an optional note..."
                ></textarea>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0 rounded-b-xl mt-auto">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border border-input bg-white hover:bg-accent hover:text-accent-foreground h-10 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
