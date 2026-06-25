# System Logs & Audit Trail Mapping

Below is the consolidated audit of all system logs, updated with your notes and requested additions from the Excel file. 

> [!NOTE]
> **Did we miss anything?**
> Yes! Looking closely, we completely missed **User Management** (e.g. User Invited, User Role Changed, User Deactivated) which should definitely be tracked in the **Global Audit Trail**. I have added them to the bottom table for your review. We also missed basic client fields like "Primary Contact" or "Domain". I've added a generic "Client Detail Changed" to cover those bases.

### Author Attribution Rules
- **"User Name"**: Applied when an active user session is detected.
- **"System"**: Applied when the action is executed automatically by background logic, or if an anonymous session triggers it. *Note: As per your request, Admin Restores and Hard Deletes will be updated to attribute the User instead of being hardcoded to System.*

---

## 1. Client Drawer Timeline (`addAutoLog`)
These logs appear on the Client Profile's Timeline tab. 

| Trigger Event | Log Message Format | Author | Notes / Requirements |
| :--- | :--- | :--- | :--- |
| **Client Created** | `Client created.` | User (Fallback: System) | |
| **Client Archived** | `Client profile archived` | User (Fallback: System) | |
| **Project Created** | `Project "[Name]" was created under this client.` | User (Fallback: System) | |
| **Service Created** | `Service "[Name]" was added to project "[Name]".` | User (Fallback: System) | |
| **Project Deleted** | `Project "[Name]" was deleted.` | User (Fallback: System) | |
| **Project Archived** | `Project "[Name]" archived` | User (Fallback: System) | |
| **Project Status Updated** | `Project "[Name]" was Released.` | User (Fallback: System) | **Updated:** Only show if Phase changed to Released. |
| **Service Unlinked** | `Service "[Name]" was unlinked from project "[Name]".` | User (Fallback: System) | |
| **Service Archived** | `Service "[Name]" archived.` | User (Fallback: System) | |
| **Service Status Updated** | `Service "[Name]" was Completed.` | User (Fallback: System) | **Updated:** Only show if status changed to Completed. |
| **Admin Restore** | `Project "[Name]" restored` OR `Service "[Name]" restored` | User (Fallback: System) | **Updated:** Changed Author from hardcoded System. |
| **Admin Hard Delete** | `Project "[Name]" permanently deleted` OR `Service "[Name]" permanently deleted` | User (Fallback: System) | **Updated:** Changed Author from hardcoded System. |
| **Client Name Changed** | `Client Name was changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Client Type Changed** | `Client Type was changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Client Manager Changed** | `Client Manager was changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Client Detail Changed** | `[Field Name] was changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW (Agent Suggestion):** Covers misc fields like Domain or Primary Contact. |

---

## 2. Project Modal Timeline (`addProjectAutoLog`)
These logs appear on the Project Profile's Timeline tab. 

| Trigger Event | Log Message Format | Author | Notes / Requirements |
| :--- | :--- | :--- | :--- |
| **Project Created** | `Project created.` | User (Fallback: System) | |
| **Project Archived** | `Project "[Name]" archived` | User (Fallback: System) | |
| **Feature Toggled** | `Feature "[Feature ID]" was enabled` (or `disabled`) | User (Fallback: System) | |
| **Feature Edited** | `Value for "[Feature ID]" changed from "[Old]" to "[New]"` | User (Fallback: System) | |
| **Project Status Updated** | `Status changed from "[Old]" to "[New]"` | User (Fallback: System) | |
| **Service Created** | `Service "[Name]" was added to this project.` | User (Fallback: System) | |
| **Service Unlinked** | `Service "[Name]" was unlinked from this project.` | User (Fallback: System) | |
| **Service Archived** | `Service "[Name]" archived.` | User (Fallback: System) | |
| **Service Status Updated** | `Service "[Name]" was Completed.` | User (Fallback: System) | **Updated:** Only show if status changed to Completed. |
| **Admin Restore** | `Project "[Name]" restored` OR `Service "[Name]" restored` | User (Fallback: System) | **Updated:** Changed Author from hardcoded System. |
| **Admin Hard Delete** | `Project "[Name]" permanently deleted` OR `Service "[Name]" permanently deleted` | User (Fallback: System) | **Updated:** Changed Author from hardcoded System. |
| **Project Name Changed** | `Project Name changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Manager Updated** | `Manager updated from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Release Date Updated** | `Release Date updated from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Units Updated** | `Units updated from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Clients Updated** | `Clients updated from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Checklist Generated** | `Checklist generated` | User (Fallback: System) | **NEW** |
| **Form Generated** | `Form generated` | User (Fallback: System) | **NEW** |
| **Feature Added** | `Feature added: "[Name]"` | User (Fallback: System) | **NEW** |
| **Feature Removed** | `Feature removed: "[Name]"` | User (Fallback: System) | **NEW** |
| **Schedule Status Updated** | `Schedule Status updated from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Implementation Status Updated**| `Implementation Status updated from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Avesdo ID Updated** | `Avesdo ID updated to [New]` | User (Fallback: System) | **NEW** |
| **Teamwork Link Updated** | `Teamwork link updated` | User (Fallback: System) | **NEW** |
| **KYC Details Updated** | `KYC Details updated` | User (Fallback: System) | **NEW** |

---

## 3. Service Drawer Timeline (`addServiceAutoLog`)
These logs appear natively on a specific Service's Timeline. 

| Trigger Event | Log Message Format | Author | Notes / Requirements |
| :--- | :--- | :--- | :--- |
| **Service Created** | `Service created.` | User (Fallback: System) | |
| **Service Archived** | `Service archived` | User (Fallback: System) | |
| **Admin Restore** | `Service "[Name]" restored` | User (Fallback: System) | **Updated:** Changed Author from hardcoded System. |
| **Admin Hard Delete** | `Service "[Name]" permanently deleted` | User (Fallback: System) | **Updated:** Changed Author from hardcoded System. |
| **Service Name Changed** | `Service Name changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Service Type Changed** | `Service Type changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Outcome Changed** | `Outcome changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Fulfilment Status Changed**| `Fulfilment Status changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Manager Changed** | `Manager changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Service Value Changed** | `Service Value changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Invoice Value Changed** | `Invoice Value changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Client Contact Changed** | `Client Contact changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Completion Date Changed** | `Completion Date changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Invoice Number Changed** | `Invoice Number changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Invoice Sent Changed** | `Invoice Sent changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Invoice Paid Changed** | `Invoice Paid changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Commission Value Changed** | `Commission Value changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Commission Paid Changed** | `Commission Paid changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |

---

## 4. Global Audit Trail (`addGlobalLog`)
The Global Audit Trail (visible in the **Admin Hub**) is the master ledger of the platform. 

| Trigger Event | Log Message Format | Author | Notes / Requirements |
| :--- | :--- | :--- | :--- |
| **All Mirrored Events** | *(Mirrors the message from the Client/Project/Service logs above)* | User (Fallback: System) | |
| **Settings Added** | `Added new "[Category]" option: "[Name]"` | User (Fallback: System) | |
| **Settings Deleted** | `Deleted "[Category]" option: "[Name]"` | User (Fallback: System) | |
| **Settings Toggled Active** | `Changed "[Category]" active status for: "[Name]"` | User (Fallback: System) | **Explanation:** This happens when you click the "eye" icon in Admin Settings to disable a dropdown option without actually deleting it. |
| **Settings Reordered** | `Reordered "[Category]" options` | User (Fallback: System) | |
| **Admin Master Restore** | `Restored archived record` (Context: Type & Name) | User (Fallback: System) | |
| **Admin Master Delete** | `Permanently deleted record` (Context: Type & Name) | User (Fallback: System) | |
| **Settings Title Changed** | `Settings Title changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Settings Icon/Color** | `Settings Icon or colour changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Scoring Engine Changed**| `Scoring Engine changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW** |
| **Template Updated** | `Template updated` | User (Fallback: System) | **NEW** |
| **User Invited** | `User "[Email]" invited to platform` | User (Fallback: System) | **NEW (Agent Suggestion):** We were missing User Management logs. |
| **User Role Changed** | `User "[Name]" role changed from "[Old]" to "[New]"` | User (Fallback: System) | **NEW (Agent Suggestion)** |
| **User Deactivated** | `User "[Name]" access disabled` | User (Fallback: System) | **NEW (Agent Suggestion)** |