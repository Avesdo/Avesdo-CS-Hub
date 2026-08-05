import fs from 'fs';

let content = fs.readFileSync('script/Code.js', 'utf8');

if (!content.includes('checkScheduledQuizzes(')) {
  const toFind = `    } catch (e) {
      console.error('Failed to send email for doc: ' + doc.name + ' - Error: ' + e.toString());
    }
  }
}`;
  
  const replacement = `    } catch (e) {
      console.error('Failed to send email for doc: ' + doc.name + ' - Error: ' + e.toString());
    }
  }
  
  // 4. Check Scheduled Quizzes
  checkScheduledQuizzes(idToken, projectId);
}

function checkScheduledQuizzes(idToken, projectId) {
  var firestoreUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/(default)/documents:runQuery';
  var queryPayload = {
    structuredQuery: {
      from: [{ collectionId: 'quizzes' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'scheduled' }
        }
      }
    }
  };
  
  var queryOptions = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + idToken },
    payload: JSON.stringify(queryPayload),
    muteHttpExceptions: true
  };
  
  var queryRes = UrlFetchApp.fetch(firestoreUrl, queryOptions);
  if (queryRes.getResponseCode() !== 200) {
    console.error("Firestore quizzes query failed: " + queryRes.getContentText());
    return;
  }
  
  var results = JSON.parse(queryRes.getContentText());
  
  var today = new Date();
  var todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  for (var i = 0; i < results.length; i++) {
    var doc = results[i].document;
    if (!doc) continue;
    
    var fields = doc.fields;
    var targetYear = fields.targetYear ? parseInt(fields.targetYear.integerValue) : today.getFullYear();
    var targetMonth = fields.targetMonth ? parseInt(fields.targetMonth.integerValue) : today.getMonth() + 1;
    
    var targetDateObj = new Date(targetYear, targetMonth - 1, 1).getTime();
    
    var shouldPublish = false;
    if (todayMonthStart > targetDateObj) {
      shouldPublish = true;
    } else if (todayMonthStart === targetDateObj) {
      var firstMondayDate = 1;
      var d = new Date(targetYear, targetMonth - 1, firstMondayDate);
      while (d.getDay() !== 1) {
        firstMondayDate++;
        d.setDate(firstMondayDate);
      }
      if (today.getDate() >= firstMondayDate) {
        shouldPublish = true;
      }
    }
    
    if (shouldPublish) {
      var enrolledIds = [];
      if (fields.enrolledUserIds && fields.enrolledUserIds.arrayValue && fields.enrolledUserIds.arrayValue.values) {
        var vals = fields.enrolledUserIds.arrayValue.values;
        for (var j = 0; j < vals.length; j++) {
          enrolledIds.push(vals[j].stringValue);
        }
      }
      
      var enrolledEmails = [];
      for (var k = 0; k < enrolledIds.length; k++) {
        var userUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/(default)/documents/users/' + enrolledIds[k];
        var userRes = UrlFetchApp.fetch(userUrl, {
          method: 'get',
          headers: { Authorization: 'Bearer ' + idToken },
          muteHttpExceptions: true
        });
        if (userRes.getResponseCode() === 200) {
          var userDoc = JSON.parse(userRes.getContentText());
          if (userDoc.fields && userDoc.fields.email && userDoc.fields.email.stringValue) {
            enrolledEmails.push(userDoc.fields.email.stringValue);
          }
        }
      }
      
      var emailTo = enrolledEmails.length > 0 ? enrolledEmails.join(',') : 'support@avesdo.com';
      var monthName = monthNames[targetMonth - 1] || '';
      var quizMonthYear = monthName + ' ' + targetYear;
      var appUrl = 'https://avesdo-cs-hub.web.app';
      
      var htmlContent = '<div style="background-color: #f8fafc; padding: 40px 20px; font-family: \\'Inter\\', -apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">' +
        '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">' +
          '<div style="background-color: #00bdd9; padding: 32px 40px; text-align: left;">' +
            '<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Avesdo CS Hub</h1>' +
            '<p style="margin: 8px 0 0 0; color: #e0f8fb; font-size: 15px;">Academy</p>' +
          '</div>' +
          '<div style="padding: 40px;">' +
            '<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">Hello team,</p>' +
            '<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">Your ' + quizMonthYear + ' Knowledge Check is Ready.</h2>' +
            '<p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569;">Please log in and submit your answers by the end of the current week.</p>' +
            '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">' +
              '<tr><td align="left">' +
                '<a href="' + appUrl + '" style="display: inline-block; padding: 14px 28px; background-color: #00bdd9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px; box-shadow: 0 4px 14px 0 rgba(0, 189, 217, 0.25);">Sign in to Start Assessment</a>' +
              '</td></tr>' +
            '</table>' +
            '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />' +
            '<p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">This is an automated notification from the Avesdo CS Hub.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
      
      try {
        MailApp.sendEmail({
          to: emailTo,
          subject: '[Avesdo Academy] Your Knowledge Check is Ready',
          body: 'Hello team,\\n\\nYour ' + quizMonthYear + ' Knowledge Check is ready.\\nPlease sign in at ' + appUrl,
          htmlBody: htmlContent
        });
        
        // Update Firestore status: 'published'
        var updateUrl = 'https://firestore.googleapis.com/v1/' + doc.name + '?updateMask.fieldPaths=status';
        var updatePayload = { fields: { status: { stringValue: 'published' } } };
        var updateOptions = {
          method: 'patch',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + idToken },
          payload: JSON.stringify(updatePayload),
          muteHttpExceptions: true
        };
        var patchRes = UrlFetchApp.fetch(updateUrl, updateOptions);
        if (patchRes.getResponseCode() !== 200) {
          console.error('Failed to update quiz status: ' + patchRes.getContentText());
        } else {
          console.log('Published quiz and sent emails: ' + doc.name);
        }
      } catch (e) {
        console.error('Failed to send quiz email for doc: ' + doc.name + ' - Error: ' + e.toString());
      }
    }
  }
}`;
  content = content.replace(toFind, replacement);
  fs.writeFileSync('script/Code.js', content);
}
