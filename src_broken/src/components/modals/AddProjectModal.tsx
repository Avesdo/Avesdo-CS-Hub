"import React, { useState } from 'react';\nimport { X } from 'lucide-react';\nimport { useUI } from '../../context/UIContext';\nimport { useAppState } from '../../context/AppStateContext';\nimport { updateProjectRecord } from '../../api/dbService';\nimport { Project } from '../../types';\nimport toast from 'react-hot-toast';\nimport { v4 as uuidv4 } from 'uuid';\n\nexport default function AddProjectModal() {\n  const { activeModal, closeModal } = useUI();\n  const { clients, settings } = useAppState();\n  \n  const [name, setName] = useState('');\n  const [selectedClient, setSelectedClient] = useState('');\n  const [releaseDateStr, setReleaseDateStr] = useState('');\n  const [units, setUnits] = useState('');\n  const [assignee, setAssignee] = useState('');\n  const [checklistUrl, setChecklistUrl] = useState('');\n  const [kycDetails, setKycDetails] = useState('');\n  const [note, setNote] = useState('');\n  const [isSubmitting, setIsSubmitting] = useState(false);\n\n  if (activeModal !== 'addProject') return null;\n\n  const handleSubmit = async () => {\n    if (!name.trim() || !selectedClient) {\n      toast.error(\"Project Name and Attached Client are required.\");\n      return;\n    }\n\n    setIsSubmitting(true);\n    try {\n      const clientObj = clients.find(c => c.id === selectedClient);\n      const newProject: Project = {\n        id: uuidv4(),\n        name,\n        clients: clientObj ? [clientObj.companyName] : [],\n        projectStatus: 'Onboarding',\n        projectTimeline: 'Not Started',\n        projectPhase: 'Not Started',\n        assignee: assignee || 'Unassigned',\n        units: units || '0',\n        releaseDateStr,\n        checklistUrl,\n        kycDetails,\n        dateAdded: new Date().getTime(),\n        lastUpdated: new Date().getTime(),\n        healthScore: \"N/A\",\n        scoreTrajectory: []\n      };\n\n      await updateProjectRecord(newProject);\n      \n      setName('');\n      setSelectedClient('');\n      setReleaseDateStr('');\n      setUnits('');\n      setAssignee(''
<truncated 8206 bytes>
        assignee: assignee || 'Unassigned',
        units: units || '0',
        releaseDateStr,
        releaseDateVal: releaseDateStr ? new Date(releaseDateStr).getTime() : 0,
        checklistUrl,
        kycDetails,
        dateAdded: new Date().getTime(),
      const newProject: Project = {
        id: newId,
        name: formData.name,
        clientIds: formData.clientName ? [clients.find((c: any) => c.companyName === formData.clientName)?.clientId || ''] : [],
        clients: formData.clientName ? [formData.clientName] : [],
        projectStatus: 'Onboarding',
      const clientObj = clients.find(c => (c.clientId || c.id) === selectedClient);
      const newProject: Project = {
        id: uuidv4(),
        name,
        clientIds: clientObj ? [clientObj.clientId || clientObj.id] : [],
        clients: clientObj ? [clientObj.companyName || clientObj.name] : [],
        projectStatus: 'Onboarding',
                {clients.map(c => (
                  <option key={c.clientId || c.id} value={c.clientId || c.id}>{c.companyName || c.name}</option>
                ))}