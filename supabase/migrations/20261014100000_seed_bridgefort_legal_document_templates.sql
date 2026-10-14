-- Replace generic starter templates with the source-based Bridgefort legal drafts.
-- They remain disabled pending legal counsel approval of company particulars and estate-specific title clauses.
insert into public.transaction_document_templates (document_type, name, subject_template, body_html_template, enabled)
values
('contract_of_sale', 'Bridgefort Contract of Sale (Legal Review Required)', 'Your Contract of Sale – {{property_name}}', $bridgefort_cos$<h1 style="text-align:center">CONTRACT OF SALE</h1>
<p style="text-align:center">BETWEEN</p>
<h2 style="text-align:center">BRIDGEFORT HOMES DEVELOPMENT LTD</h2>
<p style="text-align:center">(THE VENDOR)</p>
<p style="text-align:center">AND</p>
<h2 style="text-align:center">{{client_name}}</h2>
<p style="text-align:center">(THE PURCHASER)</p>
<p style="text-align:center">IN RESPECT OF ALL THAT PARCEL OF LAND BEING {{plot_count_words}} ({{plot_count}}) PLOT(S), MEASURING {{plot_size}}, LYING, SITUATE AND BEING AT {{property_name}}, {{property_address}}.</p>
<p style="text-align:center">DATED THIS {{document_date}}.</p>
<p><strong>PREPARED BY:</strong><br/>Legal Department, Bridgefort Homes Development Ltd<br/>Plot 117, W. O. Seriki Street, Eleganza Gardens Estate, Opposite VGC, Lekki-Ajah, Lagos.<br/>+234 807 071 0688<br/>legal@bridgeforthomes.com<br/>www.bridgeforthomes.com</p>
<p><strong>THIS CONTRACT OF SALE</strong> is made this {{document_date}}.</p>
<p><strong>BETWEEN</strong></p>
<p><strong>BRIDGEFORT HOMES DEVELOPMENT LTD</strong> (RC NO. [TO BE CONFIRMED BY LEGAL COUNSEL]), of Plot 117 W. O. Seriki Street, Eleganza Gardens Estate, VGC, Lekki-Ajah, Lagos State (hereinafter referred to as the “Vendor”, which expression shall where the context so admits include its representatives, successors-in-title, assigns, proxies and legal representatives) of the ONE PART.</p>
<p><strong>AND</strong></p>
<p><strong>{{client_name}}</strong> of {{client_address}} (hereinafter referred to as the “Purchaser”, which expression shall where the context so admits include his/her heirs, assigns, successors-in-title, executors, administrators, personal and legal representatives) of the OTHER PART.</p>
<h3>1. WHEREAS</h3>
<p>(a) All that vast area of land known as “{{property_name}}”, lying, situate and being at {{property_address}}, is subject to the landownership and root of title stated in the estate-specific legal particulars approved for this transaction: <strong>[ESTATE-SPECIFIC ROOT OF TITLE / LANDOWNER RECITAL TO BE VERIFIED AND INSERTED BY LEGAL COUNSEL]</strong> (hereinafter referred to as the “Property”).</p>
<p>(b) Sequel to the Purchaser’s expression of interest, the Vendor has offered to sell while the Purchaser has accepted to buy {{plot_count_words}} ({{plot_count}}) plot(s) of land measuring {{plot_size}} at the Property, for the valuable consideration stated below, subject to the terms of this Contract of Sale.</p>
<h3>2. NOW THIS CONTRACT WITNESSES AS FOLLOWS</h3>
<p>In pursuance of this Contract of Sale and in consideration of the sum of {{purchase_price}} ({{purchase_price_words}} only), being the full purchase price paid by the Purchaser and acknowledged by the Vendor upon confirmation of cleared funds, the Vendor as BENEFICIAL OWNER agrees to SELL UNTO THE PURCHASER, his/her heirs, successors-in-title, executors, administrators, assigns, personal and legal representatives, all that parcel of residential land situate, lying and being at {{property_name}}, {{property_address}}, comprising {{plot_count_words}} ({{plot_count}}) plot(s) measuring approximately {{plot_size}}, with all rights, easements and things appurtenant thereto, TO HOLD the same UNTO and to the USE of the PURCHASER for the term unexpired, subject to the following terms and conditions.</p>
<h3>3. CONSIDERATION</h3>
<p>The consideration for the sale of the parcel of land is {{purchase_price}} ({{purchase_price_words}} only), being the amount paid in full and acknowledged by the Vendor, subject to the Vendor’s reconciliation and confirmation of cleared funds.</p>
<h3>4. PAYMENTS AND OTHER APPLICABLE FEES</h3>
<p>The purchase price for the land has been paid in full as at the date of this agreement. Other applicable fees, where relevant and as communicated in writing by the Vendor, may include:</p>
<p>(a) Development Fee per Plot: [ESTATE-SPECIFIC AMOUNT AND TERMS TO BE CONFIRMED IN WRITING]. This fee may cover perimeter fencing, gate house, estate roads, green areas and urban furniture where provided under the applicable estate terms.</p>
<p>(b) Deed of Assignment Fee: [CURRENT APPROVED FEE SCHEDULE APPLIES].</p>
<p>(c) Land Survey Fee: [CURRENT APPROVED FEE SCHEDULE APPLIES].</p>
<p>(d) Plot Demarcation Fee: [CURRENT APPROVED FEE SCHEDULE APPLIES].</p>
<p>(e) Estate Service Charge Levy: This levy shall be determined and communicated by the Estate Management appointed by the Vendor, and may cover sanitation and waste disposal, security, water supply, street lighting, recreational facilities and electrification, subject to the applicable estate terms.</p>
<p>(f) Other Fees: Any additional fees necessary for the perfection of title shall be communicated to the Purchaser in writing and handled in accordance with the applicable law and estate terms.</p>
<h3>5. VENDOR’S CAPACITY</h3>
<p>The Vendor sells as beneficial owner of the Property and represents that its interest derives from the landowners and root of title identified in the estate-specific particulars approved by its legal counsel.</p>
<h3>6. CONDITION OF THE PARCEL OF LAND</h3>
<p>The Purchaser confirms satisfaction with the physical condition of the parcel of land and that it is vacant, viable and suitable for development at {{property_name}}, {{property_address}}, subject to any inspection record and estate guidelines applicable to the transaction.</p>
<h3>7. POSSESSION</h3>
<p>(a) Upon completion of payment of the purchase price and after physical allocation has been conducted by the Vendor, the Purchaser shall have access to the parcel of land and may commence work or construction on it, subject to the approval of the Vendor, applicable State Government building laws and regulations, and the Estate Guidelines.</p>
<p>(b) The Purchaser shall have the right against encumbrances and disturbance from the Vendor or persons claiming title through the Vendor, provided that the Purchaser continues to pay other applicable fees as and when due.</p>
<h3>8. DEED OF ASSIGNMENT</h3>
<p>The Vendor undertakes to execute a Deed of Assignment in favour of the Purchaser and to provide additional documentation reasonably required to enable perfection of title to the parcel of land at the Purchaser’s cost, subject to the Vendor’s obligations regarding perfection of title to the land comprised within the Estate.</p>
<h3>9. INDEMNITY</h3>
<p>The Vendor agrees to indemnify the Purchaser against losses or damages arising from and connected with the Vendor’s title or the actions of its representatives, successors-in-title, assigns, proxies and legal representatives, or due to the Vendor’s misfeasance or nonfeasance, subject to applicable law.</p>
<h3>10. FORCE MAJEURE</h3>
<p>Where an event beyond an obliged party’s control prevents access to the parcel of land or performance of obligations under this Contract, including persistent adverse weather conditions, natural disasters, government-ordered lockdowns, curfews or civil unrest, affected obligations shall be held in abeyance during the event and shall fall due after it ends, adjusted by the period of delay, subject to applicable law.</p>
<h3>11. GOVERNING LAW AND DISPUTE RESOLUTION</h3>
<p>(a) This Contract of Sale shall be governed by the laws of the Federal Republic of Nigeria.</p>
<p>(b) Any dispute arising from performance of this Contract shall first be referred to mediation.</p>
<p>(c) Unresolved disputes may subsequently be referred to arbitration in Nigeria before a single arbitrator appointed in accordance with the Arbitration and Conciliation Act or other applicable law in force at the relevant time.</p>
<p>(d) The parties shall use their best endeavours to conclude arbitration expeditiously and shall bear their own costs unless otherwise agreed or ordered.</p>
<h3>12. NOTICES AND ALTERATIONS</h3>
<p>(a) Notices under this Agreement shall be given in writing or by electronic mail.</p>
<p>(b) No alteration, consensual cancellation, variation or addition shall have effect unless reduced to writing and signed by duly authorised representatives of both parties.</p>
<h3>13. INTERPRETATION</h3>
<p>The parties acknowledge that they understand written and spoken English, have read and understood this Agreement, and freely consent to its terms.</p>
<h3>14. COST AND EXPENSES</h3>
<p>The Purchaser shall pay costs incidental to preparation and execution of this Agreement as agreed and permitted by applicable law.</p>
<p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Contract on the date stated above.</p>
<p><strong>COMMON SEAL OF BRIDGEFORT HOMES DEVELOPMENT LTD</strong><br/>Director: ___________________________ &nbsp;&nbsp; Secretary: ___________________________</p>
<p><strong>SIGNED, SEALED AND DELIVERED BY THE PURCHASER</strong><br/>{{client_name}}<br/>Signature: ___________________________ Date: __________________</p>
<p><strong>WITNESS TO THE PURCHASER</strong><br/>Name: ______________________________ Address: ______________________________<br/>Occupation: _________________________ Date: __________________ Signature: __________________</p>
<p><strong>TRANSACTION SUMMARY (FOR IDENTIFICATION)</strong><br/>Purchaser: {{client_name}}<br/>Estate: {{property_name}}<br/>Property location: {{property_address}}<br/>Number of plots: {{plot_count}}<br/>Plot size: {{plot_size}}<br/>Purchase price: {{purchase_price}}<br/>Amount paid: {{amount_paid}}<br/>Order reference: {{order_reference}}<br/>Document date: {{document_date}}</p>$bridgefort_cos$, false),
('deed_of_assignment', 'Bridgefort Deed of Assignment (Legal Review Required)', 'Your Deed of Assignment – {{property_name}}', $bridgefort_doa$<h1 style="text-align:center">DEED OF ASSIGNMENT</h1>
<p style="text-align:center">BETWEEN</p>
<h2 style="text-align:center">BRIDGEFORT HOMES DEVELOPMENT LTD</h2>
<p style="text-align:center">(ASSIGNOR)</p>
<p style="text-align:center">AND</p>
<h2 style="text-align:center">{{client_name}}</h2>
<p style="text-align:center">(ASSIGNEE)</p>
<p style="text-align:center">IN RESPECT OF ALL THAT {{plot_count_words}} ({{plot_count}}) RESIDENTIAL PLOT(S) OF LAND MEASURING APPROXIMATELY {{plot_size}}, LYING AND SITUATE AT {{property_name}}, {{property_address}}.</p>
<p><strong>PREPARED BY:</strong><br/>Legal Department, Bridgefort Homes Development Ltd<br/>Plot 117, W. O. Seriki Street, Eleganza Gardens Estate, Opposite VGC, Lekki-Ajah, Lagos.<br/>+234 807 071 0688<br/>legal@bridgeforthomes.com<br/>www.bridgeforthomes.com</p>
<p><strong>THIS DEED OF ASSIGNMENT</strong> is made this {{document_date}}.</p>
<p><strong>BETWEEN:</strong></p>
<p><strong>BRIDGEFORT HOMES DEVELOPMENT LTD</strong> (RC NO. [TO BE CONFIRMED BY LEGAL COUNSEL]), a company incorporated under the laws of the Federal Republic of Nigeria, with its office at Plot 117 W. O. Seriki Street, Eleganza Gardens Estate, VGC, Lekki-Ajah, Lagos State, Nigeria (hereinafter referred to as the “ASSIGNOR”, which expression shall where the context so admits mean and include its agents, privies, successors-in-title, authorised representatives and assigns) of the FIRST PART.</p>
<p><strong>AND</strong></p>
<p><strong>{{client_name}}</strong> of {{client_address}} (hereinafter referred to as the “ASSIGNEE”, which expression shall where the context so admits mean and include the Assignee’s agents, privies, successors-in-title, executors, administrators, authorised representatives and assigns) of the OTHER PART.</p>
<h3>WHEREAS</h3>
<p>1. The ASSIGNOR is a real estate marketing and investment company engaged in the acquisition of land and development of estates, schemes and gated estates which may be allocated to subscribers.</p>
<p>2. The ASSIGNOR’s title to the relevant estate derives from the estate-specific root of title and conveyance particulars recorded for the property. <strong>[INSERT AND VERIFY THE LANDOWNER, ROOT OF TITLE, INSTRUMENT, REGISTRATION AND ACQUISITION DETAILS FOR THIS ESTATE. DO NOT REUSE DETAILS FROM ANOTHER ESTATE.]</strong></p>
<p>3. The ASSIGNOR has procured or holds the interest described in the approved estate particulars for {{property_name}}, {{property_address}}, where interested persons or organisations may subscribe to the scheme by monthly or quarterly contribution or outright payment towards ownership of plots of land.</p>
<p>4. The ASSIGNOR is desirous of assigning its rights and interest in {{plot_count_words}} ({{plot_count}}) residential plot(s) of land measuring approximately {{plot_size}}, lying and situate at {{property_name}}, {{property_address}} (hereinafter referred to as the “PROPERTY”) to the ASSIGNEE, and the ASSIGNEE has agreed to accept the assignment subject to the conditions set out herein.</p>
<h3>NOW THIS DEED WITNESSES AS FOLLOWS</h3>
<p>In consideration of {{purchase_price}} ({{purchase_price_words}} only), as the purchase consideration recorded for the PROPERTY and paid by the ASSIGNEE to the ASSIGNOR, the receipt of which the ASSIGNOR acknowledges subject to reconciliation and confirmation of cleared funds, the ASSIGNOR as beneficial owner hereby assigns UNTO THE ASSIGNEE its unexpired interest in {{plot_count_words}} ({{plot_count}}) residential plot(s) of land measuring approximately {{plot_size}}, lying and situate at {{property_name}}, {{property_address}}, with all rights, easements and things appurtenant thereto, TO HOLD the same UNTO the ASSIGNEE for the term unexpired, subject to the Land Use Act 1978 and applicable law.</p>
<p><strong>SURVEY DETAILS:</strong> [SURVEY COORDINATES, SURVEY PLAN NUMBER, DATE, AND REGISTERED SURVEYOR MUST BE VERIFIED AND INSERTED FROM THE APPROVED SURVEY PLAN FOR THIS PROPERTY.]</p>
<h3>THE ASSIGNOR COVENANTS WITH THE ASSIGNEE</h3>
<p>1. The ASSIGNOR covenants that it possesses full power, authority and right to assign its unexpired rights, interest and title in the PROPERTY to the ASSIGNEE and that the ASSIGNEE shall peaceably hold and enjoy the demised PROPERTY throughout the term created without interruption or disturbance by the ASSIGNOR or persons rightfully claiming through, under or in trust for it.</p>
<p>2. The ASSIGNOR warrants, to the extent supported by its verified title documents, that there are no subsisting third-party rights, interests, charges or encumbrances attached to the PROPERTY other than those disclosed in writing.</p>
<p>3. The ASSIGNOR covenants to indemnify the ASSIGNEE for successful third-party claims, proceedings, costs, expenses and liabilities arising from an established defect in the ASSIGNOR’s title to the PROPERTY, subject to applicable law.</p>
<p>4. At the request and cost of the ASSIGNEE or a person deriving title through the ASSIGNEE, the ASSIGNOR shall execute or do such acts as are reasonably required to enable registration of the ASSIGNEE’s title or deeds to the PROPERTY pursuant to statutory duty.</p>
<p>5. The ASSIGNOR shall not create or permit a charge or encumbrance detrimental to the ASSIGNEE’s possession of the PROPERTY, subject to disclosed existing rights and applicable law.</p>
<h3>THE ASSIGNEE COVENANTS WITH THE ASSIGNOR</h3>
<p>1. The ASSIGNEE covenants to assume and perform the obligations applicable to the PROPERTY, including payment of land and development charges, rates and levies imposed by the Governor of the relevant State or another competent authority.</p>
<p>2. The ASSIGNEE shall pay to the appropriate authorities a proportionate share of levies, dues, Land Use Charge, rates, taxes, assessments, charges, outgoings and other impositions charged on the PROPERTY or any part thereof, insofar as incidental to ownership and use.</p>
<p>3. The ASSIGNEE shall observe and perform applicable bye-laws, rules and regulations made for the management and administration of the PROPERTY by the ASSIGNOR, estate management company or residents’ association.</p>
<p>4. The ASSIGNEE shall keep the PROPERTY and surrounding area clean and tidy.</p>
<p>5. The ASSIGNEE shall not alter or add to a building development approved for the PROPERTY without prior approval and written consent of the ASSIGNOR or other body corporate charged with its management, where such consent is required.</p>
<p>6. The ASSIGNEE shall not use the PROPERTY for unlawful purposes or carry on noisy, offensive, dangerous or illegal activities thereon.</p>
<p>7. The ASSIGNEE shall not use fuel or materials that create excessive smoke, fumes, obnoxious smells or nuisance to other occupants.</p>
<p>8. The ASSIGNEE shall abide by the applicable terms, obligations, conditions and restrictions stipulated in the estate manager’s conditions and residents’ handbook, as lawfully amended.</p>
<p>9. The ASSIGNEE shall pay annual maintenance levies due for communal estate services to the nominated estate managers from the date possession is deemed transferred under the final legally approved terms.</p>
<p>10. The ASSIGNEE shall ensure that annual maintenance levies are paid as and when due to the designated estate manager or company appointed to manage communal infrastructure and services.</p>
<p>11. Before commencing development works, the ASSIGNEE shall observe applicable rules, regulations and guidelines contained in the estate residents’ handbook.</p>
<h3>THE ASSIGNEE FURTHER COVENANTS</h3>
<p>(a) To pay a proportionate share of sums levied for the improvement and upkeep of communal facilities, including walls, fences, sewers, drains, roadways, pipes, watercourses, community centre and other shared facilities, as equitably determined under the Estate Guidelines.</p>
<p>(b) Prior to or simultaneously with execution of this Deed, or at a time stipulated by the ASSIGNOR, to enter into standard agreements for electricity, water supply, estate communication and refuse disposal services provided to the PROPERTY, where applicable.</p>
<p>(c) To observe and perform obligations under such service agreements, including payment for services consumed.</p>
<p>(d) To comply with lawful estate service arrangements and restrictions approved for the PROPERTY.</p>
<p>(e) Not to assign or transfer title to the PROPERTY to a third party without prior consent where required by the final approved estate covenants, such consent not to be unreasonably withheld where applicable.</p>
<p>(f) To give the ASSIGNOR any right of first refusal only where that right is validly included in the final legal terms agreed by the parties and permitted by applicable law.</p>
<h3>IT IS FURTHER AGREED THAT</h3>
<p>(g) In consideration of the ASSIGNEE paying the sums due and observing the covenants and conditions herein, the ASSIGNEE shall peaceably hold and enjoy the PROPERTY without interruption by the ASSIGNOR or persons rightfully claiming through it.</p>
<p>(h) The ASSIGNEE shall enjoy the use of the PROPERTY subject to the provisions, rules, guidelines, covenants and restrictions lawfully in place for the effective management of the estate.</p>
<p>(i) The ASSIGNOR covenants that the ASSIGNEE’s easement rights shall be protected subject to the ASSIGNEE abiding by stated obligations, including rights of way and access to drainage, light, sewage and water facilities, while preserving any lawful easement rights required for infrastructure serving adjoining plots.</p>
<h3>SCHEDULE</h3>
<p>1. All that {{plot_count_words}} ({{plot_count}}) residential plot(s) of land measuring approximately {{plot_size}}, lying and situate at {{property_name}}, {{property_address}}.</p>
<p>2. Survey coordinates: [VERIFY FROM APPROVED SURVEY PLAN]. Plan number: [VERIFY]. Plan date: [VERIFY]. Registered surveyor: [VERIFY].</p>
<p><strong>IN WITNESS WHEREOF</strong>, the parties have set their respective hands and common seal on the date stated above.</p>
<p><strong>SIGNED, SEALED AND DELIVERED BY BRIDGEFORT HOMES DEVELOPMENT LTD (ASSIGNOR)</strong><br/>Director: ___________________________ &nbsp;&nbsp; Secretary: ___________________________</p>
<p><strong>WITNESS TO THE ASSIGNOR</strong><br/>Name: ______________________________ Address: ______________________________<br/>Occupation: _________________________ Signature: ____________________________</p>
<p><strong>SIGNED, SEALED AND DELIVERED BY THE ASSIGNEE</strong><br/>{{client_name}}<br/>Signature: ___________________________ Date: __________________</p>
<p><strong>WITNESS TO THE ASSIGNEE</strong><br/>Name: ______________________________ Address: ______________________________<br/>Occupation: _________________________ Signature: ____________________________</p>
<p>[ANY REQUIRED GOVERNOR’S CONSENT, LAND REGISTRY, STAMP DUTY OR STATE-SPECIFIC EXECUTION/REGISTRATION ENDORSEMENT MUST BE COMPLETED BY LEGAL COUNSEL FOR THE PROPERTY’S STATE.]</p>
<p><strong>TRANSACTION SUMMARY (FOR IDENTIFICATION)</strong><br/>Assignee: {{client_name}}<br/>Estate: {{property_name}}<br/>Property location: {{property_address}}<br/>Number of plots: {{plot_count}}<br/>Plot size: {{plot_size}}<br/>Consideration: {{purchase_price}}<br/>Amount paid: {{amount_paid}}<br/>Order reference: {{order_reference}}<br/>Document date: {{document_date}}</p>$bridgefort_doa$, false)
on conflict (document_type) do update set
  name=excluded.name,
  subject_template=excluded.subject_template,
  body_html_template=excluded.body_html_template,
  enabled=false,
  updated_at=now();
