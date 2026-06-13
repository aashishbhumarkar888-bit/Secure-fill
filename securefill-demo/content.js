import{F as C,B as k,S as h}from"./storage.js";class y{static detectForms(){const t=document.querySelectorAll("form"),e=[];t.forEach((s,n)=>{const o=this.extractFormMetadata(s,n);o.fields.length>0&&e.push(o)});const i=this.detectImplicitForms();return e.push(...i),e}static extractFormMetadata(t,e){const i=this.extractFieldMetadata(t);return{formId:t.id||`form-${e}`,formName:t.name||`Form ${e+1}`,formAction:t.action,formMethod:t.method||"GET",fields:i,detectionTimestamp:new Date().toISOString()}}static extractFieldMetadata(t){const e=[];return t.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select').forEach((s,n)=>{const o=this.analyzeField(s,n);o&&!this.isBlockedField(o)&&e.push(o)}),e}static analyzeField(t,e){try{const i=this.getFieldLabel(t),s=t.getAttribute("placeholder")||"",n=t.getAttribute("name")||"",o=t.id||"",r=t.getAttribute("aria-label")||"",a=this.extractDataAttributes(t),d=t.className||"",m=t.getAttribute("type")||"text",b=`${i} ${s} ${n} ${o} ${r} ${d}`.toLowerCase(),g=this.classifyField(b,m);return{id:o||n||`field-${e}`,name:n,type:m,label:i,placeholder:s,ariaLabel:r,dataAttributes:a,classNames:d,confidenceScore:g?.85:0,suggestedField:g}}catch(i){return console.error("Error analyzing field:",i),null}}static getFieldLabel(t){if(t.id){const s=document.querySelector(`label[for="${t.id}"]`);if(s)return s.textContent||""}const e=t.closest("label");if(e)return e.textContent||"";const i=t.closest('[class*="form"], [class*="field"], [class*="group"]');return i?(i.textContent||"").substring(0,100):""}static extractDataAttributes(t){const e={};return Array.from(t.attributes).forEach(i=>{i.name.startsWith("data-")&&(e[i.name]=i.value)}),e}static classifyField(t,e){if(e==="email")return"email";if(e==="tel"||e==="telephone")return"phone";if(e==="date")return"dateOfBirth";for(const[i,s]of Object.entries(C))for(const n of s)if(n.test(t))return i;return null}static isBlockedField(t){const e=`${t.label} ${t.placeholder} ${t.name} ${t.type}`.toLowerCase();for(const i of k)if(i.test(e))return!0;return!1}static detectImplicitForms(){const t=[];return document.querySelectorAll('[class*="form"], [role="form"]').forEach((i,s)=>{if(i.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select').length>0&&!i.closest("form")){const o=this.extractFieldMetadata(i);o.length>0&&t.push({formId:i.id||`implicit-form-${s}`,formName:`Form ${s+1}`,formAction:"",formMethod:"POST",fields:o,detectionTimestamp:new Date().toISOString()})}}),t}static observeDOMChanges(t){const e=new MutationObserver(i=>{let s=!1;i.forEach(n=>{n.type==="childList"&&n.addedNodes.forEach(o=>{if(o.nodeType===1){const r=o;(r.tagName==="FORM"||r.tagName==="INPUT"||r.querySelector("form, input"))&&(s=!0)}})}),s&&t()});return e.observe(document.body,{childList:!0,subtree:!0,attributes:!1,characterData:!1}),e}static hasFillableForms(){return this.detectForms().length>0}static getFormForElement(t){return t.closest("form")||null}static getFormFields(t){return this.extractFieldMetadata(t)}}class f{static generateFieldMappings(t,e){const i=new Map;return t.forEach(s=>{if(s.suggestedField){const n=e[s.suggestedField];n&&n!==""&&i.set(s.id,s.suggestedField)}}),i}static fillField(t,e){try{const i=t.value;t.value=e;const s=new Event("input",{bubbles:!0});t.dispatchEvent(s);const n=new Event("change",{bubbles:!0});t.dispatchEvent(n);const o=new Event("blur",{bubbles:!0});t.dispatchEvent(o);const r=new Event("focus",{bubbles:!0});return t.dispatchEvent(r),t.value===e}catch(i){return console.error("Error filling field:",i),!1}}static fillForm(t,e,i){const s=[];return e.forEach((n,o)=>{const r=t.querySelector(`[id="${o}"], [name="${o}"]`);if(r){const a=String(i[n]||""),d=this.fillField(r,a);s.push({fieldId:o,success:d})}}),s}static findBestMatchingField(t,e){const i=t.find(n=>n.suggestedField===e);return i||t.map(n=>({field:n,score:this.calculateFieldMatchScore(n,e)})).filter(n=>n.score>.5).sort((n,o)=>o.score-n.score)[0]?.field||null}static calculateFieldMatchScore(t,e){let i=0;const s=`${t.label} ${t.placeholder} ${t.name} ${t.id}`.toLowerCase();return({fullName:["name","full name","first name","last name"],email:["email","mail","contact","inbox"],phone:["phone","tel","mobile","cell"],dateOfBirth:["date","birth","dob","age"],address:["address","street","line 1"],city:["city","town","locality"],state:["state","province","region"],country:["country","nation"],pincode:["pin","code","zip","postal"],linkedin:["linkedin","linked in","professional"],github:["github","repository","coding"],resumeUrl:["resume","cv","curriculum"],resumeText:["resume","cover"],lastUpdated:[],version:[]}[e]||[]).forEach(r=>{s.includes(r)&&(i+=.3)}),e==="email"&&t.type==="email"&&(i+=.4),e==="phone"&&t.type==="tel"&&(i+=.4),e==="dateOfBirth"&&t.type==="date"&&(i+=.4),Math.min(i,1)}static validateFillResults(t){return t.filter(i=>i.success).length/t.length>=.5}static getVisibleFields(t){return t.filter(e=>{const i=document.getElementById(e.id)||document.querySelector(`[name="${e.name}"]`);if(!i)return!1;const s=i.getBoundingClientRect(),n=window.getComputedStyle(i);return s.width>0&&s.height>0&&n.display!=="none"&&n.visibility!=="hidden"&&n.opacity!=="0"})}static shouldSkipField(t){const e=document.getElementById(t.id)||document.querySelector(`[name="${t.name}"]`);return!!(e&&e.value||e&&e.hasAttribute("readonly")||e&&e.hasAttribute("disabled"))}static fillGoogleForm(t){let e=0;return document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(n=>{const o=n;if(o.value)return;const r=o.getAttribute("aria-label")?.toLowerCase()||"",a=o.getAttribute("placeholder")?.toLowerCase()||"",d=o.getAttribute("name")?.toLowerCase()||"",m=o.getAttribute("id")?.toLowerCase()||"",b=`${r} ${a} ${d} ${m}`.toLowerCase();r.includes("name")||a.includes("name")||b.includes("full name")?this.fillField(o,t.fullName||t.firstName||"")&&e++:r.includes("email")||a.includes("email")?this.fillField(o,t.email||"")&&e++:r.includes("phone")||a.includes("phone")||r.includes("tel")?this.fillField(o,t.phone||"")&&e++:r.includes("age")||a.includes("age")?this.fillField(o,t.age||"")&&e++:r.includes("first name")||a.includes("first name")?this.fillField(o,t.firstName||t.fullName?.split(" ")[0]||"")&&e++:r.includes("last name")||a.includes("last name")?this.fillField(o,t.lastName||t.fullName?.split(" ").pop()||"")&&e++:r.includes("city")||a.includes("city")?this.fillField(o,t.city||"")&&e++:r.includes("state")||a.includes("state")?this.fillField(o,t.state||"")&&e++:r.includes("country")||a.includes("country")?this.fillField(o,t.country||"")&&e++:r.includes("address")||a.includes("address")?this.fillField(o,t.address||"")&&e++:r.includes("zip")||a.includes("zip")||r.includes("postal")?this.fillField(o,t.pincode||"")&&e++:r.includes("id")||a.includes("id")?this.fillField(o,t.id||t.enrollmentNumber||"")&&e++:(r.includes("enroll")||a.includes("enroll"))&&this.fillField(o,t.enrollmentNumber||t.enroll||"")&&e++}),document.querySelectorAll("select").forEach(n=>{const o=n;if(o.value)return;const r=o.getAttribute("aria-label")?.toLowerCase()||"",a=o.getAttribute("name")?.toLowerCase()||"",d=o.getAttribute("id")?.toLowerCase()||"";if(r.includes("gender")||a.includes("gender")||d.includes("gender")){const m=Array.from(o.options).find(b=>b.text.toLowerCase().includes(t.gender?.toLowerCase()||""));m&&this.fillField(o,m.value)&&e++}}),e}}class M{constructor(t={}){this.container=null,this.button=null,this.isVisible=!1,this.config={position:t.position||"bottom-right",zIndex:t.zIndex||1e4,animationDuration:t.animationDuration||300}}create(t){this.container||(this.container=document.createElement("div"),this.container.id="securefill-floating-button-container",this.container.style.cssText=`
      position: fixed;
      ${this.getPositionStyles()}
      z-index: ${this.config.zIndex};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `,this.button=document.createElement("button"),this.button.id="securefill-floating-button",this.button.setAttribute("aria-label","SecureFill AI - Autofill this form"),this.button.style.cssText=`
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      padding: 0;
      margin: 0;
      font-weight: 600;
      opacity: 0;
      transform: scale(0);
    `,this.button.innerHTML="✨",this.button.addEventListener("mouseenter",()=>{this.button.style.transform="scale(1.1)",this.button.style.boxShadow="0 6px 16px rgba(102, 126, 234, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15)"}),this.button.addEventListener("mouseleave",()=>{this.button.style.transform="scale(1)",this.button.style.boxShadow="0 4px 12px rgba(102, 126, 234, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)"}),this.button.addEventListener("click",e=>{e.stopPropagation(),t()}),this.container.appendChild(this.button),document.body.appendChild(this.container))}show(){!this.button||this.isVisible||(this.isVisible=!0,this.button.style.opacity="1",this.button.style.transform="scale(1)")}hide(){!this.button||!this.isVisible||(this.isVisible=!1,this.button.style.opacity="0",this.button.style.transform="scale(0)")}setLoading(t){this.button&&(t?(this.button.innerHTML="⏳",this.button.disabled=!0,this.button.style.opacity="0.7"):(this.button.innerHTML="✨",this.button.disabled=!1,this.button.style.opacity="1"))}showSuccess(){if(!this.button)return;const t=this.button.innerHTML;this.button.innerHTML="✓",this.button.style.background="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",setTimeout(()=>{this.button&&(this.button.innerHTML=t,this.button.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)")},2e3)}showError(t){if(!this.button)return;const e=this.button.innerHTML;this.button.innerHTML="✗",this.button.style.background="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",t&&this.showNotification(t,"error"),setTimeout(()=>{this.button&&(this.button.innerHTML=e,this.button.style.background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)")},2e3)}showNotification(t,e="success"){const i=document.createElement("div");i.id="securefill-notification",i.style.cssText=`
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: ${e==="success"?"#10b981":"#ef4444"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: ${this.config.zIndex-1};
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `,i.textContent=t,document.body.appendChild(i);const s=document.createElement("style");s.textContent=`
      @keyframes slideIn {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,document.head.appendChild(s),setTimeout(()=>{i.remove(),s.remove()},3e3)}getPositionStyles(){return{"bottom-right":"bottom: 20px; right: 20px;","bottom-left":"bottom: 20px; left: 20px;","top-right":"top: 20px; right: 20px;","top-left":"top: 20px; left: 20px;"}[this.config.position]}remove(){this.container&&(this.container.remove(),this.container=null,this.button=null,this.isVisible=!1)}setPosition(t){this.config.position=t,this.container&&(this.container.style.cssText=`
        position: fixed;
        ${this.getPositionStyles()}
        z-index: ${this.config.zIndex};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      `)}}let c=null,x=null,u=null,w=!0,F=!1,E=!1;async function S(){try{w=await h.isAutofillEnabled(),F=await h.hasConsentGiven(),E=await h.isAutofillOnLoad(),u=await h.getUserProfile(),L(),chrome.runtime.onMessage.addListener((l,t,e)=>($(l,e),!0)),console.log("[SecureFill] Content script initialized");try{if(E&&w&&!await h.isDomainBlocked(window.location.href)){if(!F){if(!await A()){console.log("[SecureFill] Autofill-on-load cancelled by user");return}await h.setConsent(!0),F=!0}await T()}}catch(l){console.error("[SecureFill] Autofill-on-load error:",l)}}catch(l){console.error("[SecureFill] Error initializing content script:",l)}}async function T(){try{const l=y.detectForms();if(l.length===0||(u=u??await h.getUserProfile(),!u))return;let t=0;for(const e of l){const i=document.getElementById(e.formId)||e.formId.startsWith("form-")&&document.querySelectorAll("form")[parseInt(e.formId.split("-")[1])];if(!i||!(i instanceof HTMLFormElement))continue;const n=f.getVisibleFields(e.fields).filter(d=>!f.shouldSkipField(d)),o=f.generateFieldMappings(n,u),a=f.fillForm(i,o,u).filter(d=>d.success).length;t+=a;try{const d=new URL(window.location.href).hostname;await h.logAutofillAction(d,a,!0)}catch{}}t>0&&c&&(c.showSuccess(),c.showNotification(`Autofilled ${t} field${t!==1?"s":""}`))}catch(l){console.error("[SecureFill] performAutofillOnLoad error:",l)}}function L(){if(!w)return;y.detectForms().length>0&&(c||(c=new M({position:"bottom-right"}),c.create(v)),c.show()),x||(x=y.observeDOMChanges(()=>{y.hasFillableForms()&&c&&c.show()}))}async function v(){if(!(!c||!u)){if(!F){if(!await A()){c.showError("Autofill cancelled");return}await h.setConsent(!0),F=!0}c.setLoading(!0);try{let l=0;if(window.location.href.includes("docs.google.com/forms")||document.body.innerHTML.includes("google.com/forms"))console.log("[SecureFill] Detected Google Form, using specialized filling"),l=f.fillGoogleForm(u);else{const e=y.detectForms();if(e.length===0){c.showError("No forms detected");return}let i=!0;for(const s of e){const n=document.getElementById(s.formId)||s.formId.startsWith("form-")&&document.querySelectorAll("form")[parseInt(s.formId.split("-")[1])];if(!n||!(n instanceof HTMLFormElement))continue;const o=f.getVisibleFields(s.fields),r=o.filter(p=>f.shouldSkipField(p)),a=o.filter(p=>!f.shouldSkipField(p)),d=f.generateFieldMappings(a,u),m=f.fillForm(n,d,u),b=f.validateFillResults(m);b||(i=!1);const g=m.filter(p=>p.success).length;l+=g;try{const p=new URL(window.location.href).hostname;await h.logAutofillAction(p,g,b)}catch{}}}l>0?(c.showSuccess(),c.showNotification(`✓ Filled ${l} field${l!==1?"s":""}`)):c.showError("Could not fill any fields")}catch(l){console.error("[SecureFill] Error during autofill:",l),c.showError("Error during autofill")}finally{c.setLoading(!1)}}}function A(){return new Promise(l=>{const t=document.createElement("div");t.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    `;const e=document.createElement("div");e.style.cssText=`
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
    `,e.innerHTML=`
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1f2937;">Allow SecureFill AI to autofill?</h2>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
        SecureFill will fill this form with your stored profile data. Your password and sensitive fields will never be autofilled.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="securefill-deny" style="
          padding: 10px 20px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        ">Don't Fill</button>
        <button id="securefill-allow" style="
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        ">Allow Autofill</button>
      </div>
    `,t.appendChild(e),document.body.appendChild(t);const i=e.querySelector("#securefill-deny"),s=e.querySelector("#securefill-allow"),n=()=>{t.remove()};i.addEventListener("click",()=>{n(),l(!1)}),s.addEventListener("click",()=>{n(),l(!0)}),t.addEventListener("click",o=>{o.target===t&&(n(),l(!1))})})}async function $(l,t){try{switch(l.type){case"FORM_DETECTED":L(),t({success:!0});break;case"REQUEST_AUTOFILL":await v(),t({success:!0});break;case"GET_PROFILE":t({profile:u});break;case"SAVE_PROFILE":l.payload&&(u=l.payload,await h.saveUserProfile(u),t({success:!0}));break;default:t({error:"Unknown message type"})}}catch(e){console.error("[SecureFill] Error handling message:",e),t({error:String(e)})}}window.addEventListener("beforeunload",()=>{x&&x.disconnect(),c&&c.remove()});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",S):S();
