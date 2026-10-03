import { readFileSync } from 'fs';

const rawText = `
Railway Recruitment Board (RRB)
RRB Section Controller Exam City Details 2026
Important Dates
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
119 Posts

RRB Section Controller Recruitment 2026 : Vacancy Details
 Railway RRB Section Controller 2026 : Category Wise Vacancy Details 
Post Name\tCategory Name\tNo. Of Post
Section Controller\tGeneral \t50
EWS\t09
OBC\t29
SC\t19
ST\t12

Post Name\tEligibility Criteria
RRB Section Controller\tCandidates must be a Graduate in any discipline from a recognized university.

Check Exam City Details
Click Here
Download Application Status
Click Here
Check Application Status Notice
Click Here
Check Exam Date Notice
Click Here
Apply Online Link
Click Here
Check Short Notice
Click Here
`;

console.log("Raw text length:", rawText.length);
