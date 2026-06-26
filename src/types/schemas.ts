import { z } from 'zod';

export const ClientSchema = z
  .object({
    clientId: z.string().catch(''),
    companyName: z.string().catch('Unknown Client'),
    accountManager: z.string().catch('Unassigned'),
    activeProjectCount: z.number().catch(0),
    healthScore: z.union([z.number(), z.literal('N/A')]).catch('N/A'),
    isArchived: z.boolean().optional().catch(false),
  })
  .passthrough();

export const ProjectSchema = z
  .object({
    id: z.string().catch(''),
    name: z.string().catch('Unknown Project'),
    assignee: z.string().catch('Unassigned'),
    clientIds: z.array(z.string()).catch([]),
    clients: z.array(z.string()).optional().catch([]),
    developerIds: z.array(z.string()).optional().catch([]),
    developers: z.array(z.string()).optional().catch([]),
    salesMarketingIds: z.array(z.string()).optional().catch([]),
    salesMarketingClients: z.array(z.string()).optional().catch([]),
    projectStatus: z.string().catch('Unknown'),
    releaseDateStr: z.string().catch(''),
    releaseDateVal: z.number().catch(0),
    isArchived: z.boolean().optional().catch(false),
    timelineStatus: z.string().optional(),
    onboardingPhase: z.string().optional(),
    features: z.array(z.string()).optional().catch([]),
    units: z.union([z.number(), z.string()]).optional().catch(0),
    history: z.array(z.any()).optional().catch([]),
    invoiceStatus: z.string().optional(),
    daysOutstanding: z.number().optional().catch(0),
    totalOutstanding: z.number().optional().catch(0),
    outstandingInvoiceCount: z.number().optional().catch(0),
    healthScore: z
      .union([z.number(), z.literal('N/A')])
      .optional()
      .catch('N/A'),
    trendData: z.array(z.any()).optional().catch([]),
    onboardingCsat: z
      .object({
        quality: z.string().catch(''),
        planning: z.string().catch(''),
        communication: z.string().catch(''),
        knowledge: z.string().catch(''),
        recommendation: z.string().catch(''),
        comments: z.string().catch(''),
        score: z.number().catch(0),
        submittedAt: z.string().catch(''),
      })
      .optional(),
  })
  .passthrough();

export const ServiceSchema = z
  .object({
    id: z.string().catch(''),
    name: z.string().catch('Unknown Service'),
    type: z.string().catch('Unknown Type'),
    manager: z.string().optional(),
    managers: z.array(z.string()).optional().catch([]),
    clientIds: z.array(z.string()).catch([]),
    projectId: z.string().optional(),
    projectIds: z.array(z.string()).optional().catch([]),
    outcome: z.string().catch('Pending'),
    dateVal: z.number().catch(0),
    isArchived: z.boolean().optional().catch(false),
    serviceValue: z.number().optional().catch(0),
  })
  .passthrough();

export const SettingsSchema = z
  .object({
    managers: z
      .array(
        z.object({
          name: z.string().catch(''),
          color: z.string().catch(''),
          icon: z.string().optional(),
        })
      )
      .catch([]),
    clientTypes: z
      .array(
        z.object({
          name: z.string().catch(''),
          color: z.string().catch(''),
          icon: z.string().optional(),
        })
      )
      .catch([]),
    features: z.array(z.string()).catch([]),
    services: z
      .array(z.object({ name: z.string().catch(''), price: z.number().catch(0) }))
      .catch([]),
    statuses: z
      .array(
        z.object({
          name: z.string().catch(''),
          color: z.string().catch(''),
          icon: z.string().optional(),
        })
      )
      .catch([]),
    timelines: z
      .array(
        z.object({
          name: z.string().catch(''),
          color: z.string().catch(''),
          icon: z.string().optional(),
        })
      )
      .catch([]),
    phases: z
      .array(
        z.object({
          name: z.string().catch(''),
          color: z.string().catch(''),
          icon: z.string().optional(),
        })
      )
      .catch([]),
    scoring: z
      .object({
        weights: z
          .object({
            opActivity: z.number().catch(20),
            featAdoption: z.number().catch(20),
            userVol: z.number().catch(20),
            csat: z.number().catch(20),
            financial: z.number().catch(20),
          })
          .catch({ opActivity: 20, featAdoption: 20, userVol: 20, csat: 20, financial: 20 }),
        thresholds: z
          .object({
            healthy: z.number().catch(70),
            warning: z.number().catch(40),
          })
          .catch({ healthy: 70, warning: 40 }),
      })
      .catch({
        weights: { opActivity: 20, featAdoption: 20, userVol: 20, csat: 20, financial: 20 },
        thresholds: { healthy: 70, warning: 40 },
      }),
  })
  .passthrough();
