# System Toast Notifications & Alerts Audit

Below is the comprehensive audit of all "Toast" notifications (temporary pop-up alerts that appear at the top/bottom of the screen) used across the application. They are categorized by module and state (Loading, Success, Error).

---

## 1. Authentication & Access (`AuthContext.tsx`)
| Trigger Event | Status | Toast Message |
| :--- | :---: | :--- |
| **Login Success** | 🟢 Success | `Welcome, [Name or Email]!` |
| **Login Unauthorized** | 🔴 Error | `Access Denied: Only @avesdo.com email addresses are authorized.` |
| **Login Failure** | 🔴 Error | `Authentication failed. Please try again.` |
| **Logout Success** | 🟢 Success | `Successfully logged out.` |
| **Logout Failure** | 🔴 Error | `Failed to log out.` |

---

## 2. Core Database Operations (`dbService.ts`)
These are the fallback defaults for standard CRUD (Create, Read, Update, Delete) operations when a component doesn't provide a custom message.

| Trigger Event | Status | Toast Message |
| :--- | :---: | :--- |
| **Record Added** | 🟢 Success | `[Record Name] successfully added.` |
| **Record Add Failed** | 🔴 Error | `Failed to add [Record Name].` |
| **Record Updated** | 🟢 Success | `Updates to '[Record Name]' saved successfully.` |
| **Record Update Failed**| 🔴 Error | `Failed to save updates to '[Record Name]'.` |
| **Record Archived** | 🟢 Success | `'[Record Name]' successfully archived.` |
| **Record Archive Fail** | 🔴 Error | `Failed to archive '[Record Name]'.` |
| **Record Restored** | 🟢 Success | `'[Record Name]' successfully restored.` |
| **Record Restore Fail** | 🔴 Error | `Failed to restore '[Record Name]'.` |
| **Record Hard Deleted** | 🟢 Success | `'[Record Name]' permanently deleted.` |
| **Record Delete Fail** | 🔴 Error | `Failed to delete '[Record Name]'.` |

---

## 3. Bulk Operations & Aliasing (`ProjectTracker.tsx` & `dbService.ts`)
| Trigger Event | Status | Toast Message |
| :--- | :---: | :--- |
| **Bulk Update Start** | ⏳ Loading | `Updating [X] projects...` |
| **Bulk Projects Done** | 🟢 Success | `Bulk Update Complete: [X] projects updated.` |
| **Bulk Projects Fail** | 🔴 Error | `Bulk Update Failed (Projects): [Error Message]` |
| **Bulk Clients Done** | 🟢 Success | `Bulk Update Complete: [X] clients updated.` |
| **Bulk Clients Fail** | 🔴 Error | `Bulk Update Failed (Clients): [Error Message]` |
| **Bulk Services Done** | 🟢 Success | `Bulk Update Complete: [X] services updated.` |
| **Bulk Services Fail** | 🔴 Error | `Bulk Update Failed (Services): [Error Message]` |
| **Alias Approved** | 🟢 Success | `Alias approved and merged.` |
| **Alias Mapped** | 🟢 Success | `Alias manually mapped and verified.` |
| **Alias New Entity** | 🟢 Success | `Alias mapped to a new entity.` |
| **Alias Rejected** | 🟢 Success | `Alias suggestion rejected and deleted.` |
| **Alias Failed** | 🔴 Error | `Failed to resolve alias.` |

---

## 4. Admin Hub & Settings (`AdminHub.tsx`, `Settings.tsx`)
| Trigger Event | Status | Toast Message |
| :--- | :---: | :--- |
| **Restore Record** | ⏳ Loading | `Restoring record...` |
| **Delete Record** | ⏳ Loading | `Deleting record permanently...` |
| **Clear Audit Trail** | 🟢 Success | `Audit trail cleared.` |
| **Clear Audit Fail** | 🔴 Error | `Failed to clear audit trail.` |
| **Save Settings Start** | ⏳ Loading | `Saving settings...` |
| **Save Settings Done** | 🟢 Success | `Settings saved successfully.` |
| **Save Settings Fail** | 🔴 Error | `Failed to save settings.` |
| **Settings Cascade Fail**| 🔴 Error | `Cascade Failed: Failed to cascade updates to active records.` |
| **Empty Name Field** | 🔴 Error | `Name cannot be empty.` |
| **Invalid Weights** | 🔴 Error | `Weights must equal exactly 100%.` |
| **Invalid Thresholds** | 🔴 Error | `Warning threshold must be strictly less than Healthy threshold.` |
| **Copy to Clipboard** | 🟢 Success | `[ID/Data] copied to clipboard.` |

---

## 5. Templates & Data Uploader (`TemplateDesigner.tsx`, `DataUploader.tsx`)
| Trigger Event | Status | Toast Message |
| :--- | :---: | :--- |
| **Invalid File Type** | 🔴 Error | `Only CSV files are supported.` |
| **Compile Success** | 🟢 Success | `Compilation successful!` |
| **Compile Error** | 🔴 Error | `Compiler error: [Error Message]` |
| **Snapshots Success** | 🟢 Success | `Snapshots generated successfully!` |
| **Snapshots Error** | 🔴 Error | `Failed to generate snapshots: [Error Message]` |
| **Template Saved** | 🟢 Success | `[Template Name] template saved successfully!` |
| **Template Save Fail** | 🔴 Error | `Failed to save template.` |
| **Preview Submitted** | 🟢 Success | `Preview submitted successfully!` |

---

## 6. Component-Specific Custom Messages
When users interact with specific fields inside the Drawers and Modals, the standard `dbService.ts` success/error messages are frequently overridden to provide more contextual feedback. 

*Examples include:*
- 🟢 `Teamwork link updated.`
- 🟢 `Avesdo ID updated to [New ID].`
- 🟢 `KYC Details updated successfully.`
- 🟢 `Schedule Status successfully updated.`
- 🟢 `Portal Link copied to clipboard.`
- 🟢 `Updated manager for [Client Name].`
- 🟢 `Active Features successfully updated for '[Project Name]'.`
- 🔴 `Failed to update Teamwork link.`
- 🔴 `Failed to update ID.`
- 🔴 `Failed to update KYC Details.`

> [!TIP]
> **Implementation Note:** If you want us to standardize the format of these toasts (e.g. standardizing capitalization, removing periods at the end of sentences, or adding an "Undo" button to certain success toasts), we can include those changes in our upcoming implementation alongside the System Logs updates!