function parseSectionsFromText(text) {
  const lines = text.split('\n').map(l => l.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  
  let currentSection = '';
  const sections = {
    dates: [],
    fees: [],
    age: [],
    ageHeader: '',
    vacancy: [],
    links: [],
    totalPosts: ''
  };

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const ll = l.toLowerCase();

    if (ll === 'important dates' || ll.startsWith('important dates:')) {
      currentSection = 'dates';
      continue;
    } else if (ll === 'application fee' || ll.startsWith('application fee:')) {
      currentSection = 'fees';
      continue;
    } else if (ll.includes('age limit') || ll.includes('age limits')) {
      currentSection = 'age';
      sections.ageHeader = l;
      continue;
    } else if (ll === 'total post' || ll === 'total vacancies') {
      currentSection = 'total_post';
      if (lines[i+1] && /^\d+/.test(lines[i+1])) {
        sections.totalPosts = lines[i+1];
        i++;
      }
      continue;
    } else if (ll.includes('vacancy details') || ll.includes('eligibility criteria')) {
      currentSection = 'vacancy';
      continue;
    } else if (ll.includes('important links') || ll.includes('some useful important links')) {
      currentSection = 'links';
      continue;
    } else if (ll.includes('mode of selection') || ll.includes('how to fill') || ll.includes('important question')) {
      currentSection = 'other';
    }

    if (currentSection === 'dates') {
      sections.dates.push(l);
    } else if (currentSection === 'fees') {
      sections.fees.push(l);
    } else if (currentSection === 'age') {
      sections.age.push(l);
    }
  }

  return sections;
}

const sampleText = `Important Dates
Online Apply Start Date : 15 July 2026
Online Apply Last Date : 14 August 2026 (23:59 PM)
Last Date For Fee Payment : 16 August 2026
Correction Date : 17 – 26 August 2026
Exam Date : 12 – 13 October 2026
Exam City Details : 02 October 2026 Available Now
Admit Card : 08 October 2026 Available Soon
Result Date : Will Be Updated Here Soon
Candidates are advised to confirm from the RRB official website.
Application Fee
For General / OBC / EWS : ₹ 500/-
For SC / ST / EBC : ₹ 250/- 
For All Category female : ₹ 250/-
After Appearing in CBT-I Exam
UR / OBC / EWS Fee Refund : Rs. 400/-
SC / ST / PH & Female Refund : Rs. 250/-
Payment Mode (Online): You can make the payment using the following methods:
Debit Card
Credit Card
Internet Banking
IMPS
Cash Card / Mobile Wallet

RRB Section Controller Notification 2026 : Age Limits As On 01 July 2026
Minimum Age : 20 Years
Maximum Age : 33 Years
RRB provides age relaxation for the Section Controller position as per their regulations.
Total Post
119 Posts`;

console.log(parseSectionsFromText(sampleText));
