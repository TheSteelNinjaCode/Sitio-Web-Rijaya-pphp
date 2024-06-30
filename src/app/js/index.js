var eventAttributes=["onclick","ondblclick","onmousedown","onmouseup","onmouseover","onmousemove","onmouseout","onwheel","onkeypress","onkeydown","onkeyup","onfocus","onblur","onchange","oninput","onselect","onsubmit","onreset","onresize","onscroll","onload","onunload","onabort","onerror","onbeforeunload","oncopy","oncut","onpaste","ondrag","ondragstart","ondragend","ondragover","ondragenter","ondragleave","ondrop","oncontextmenu","ontouchstart","ontouchmove","ontouchend","ontouchcancel","onpointerdown","onpointerup","onpointermove","onpointerover","onpointerout","onpointerenter","onpointerleave","onpointercancel"];document.addEventListener("DOMContentLoaded",attachWireFunctionEvents);var state={checkedElements:new Set},responseData=null,store=null,isNavigating=!1;function attachWireFunctionEvents(){handleHiddenAttribute();document.querySelectorAll("button, input, select, textarea, a, form, label, div, span").forEach((e=>{if(handleAnchorTag(e),eventAttributes.forEach((t=>{const n=e.getAttribute(t),s=t.slice(2);n&&(e.removeAttribute(t),handleDebounce(e,s,n))})),e instanceof HTMLFormElement){const t=e.getAttribute("onsubmit");t&&(e.removeAttribute("onsubmit"),handleDebounce(e,"submit",t))}}))}function handleHiddenAttribute(){document.querySelectorAll("[pp-hidden]").forEach((e=>{let t=e.getAttribute("pp-hidden");if(t)if(isJsonLike(t))try{handleElementVisibility(e,parseJson(t))}catch(e){}else{const n=parseTime(t);n>0&&scheduleVisibilityChange(e,n,"hidden")}}))}function isJsonLike(e){return e.trim().startsWith("{")&&e.trim().endsWith("}")}function handleElementVisibility(e,t){const n=t.start?parseTime(t.start):0,s=t.end?parseTime(t.end):0;n>0?(e.style.visibility="hidden",scheduleVisibilityChange(e,n,"visible"),s>0&&scheduleVisibilityChange(e,n+s,"hidden")):s>0&&scheduleVisibilityChange(e,s,"hidden")}function scheduleVisibilityChange(e,t,n){setTimeout((()=>{requestAnimationFrame((()=>{e.style.visibility=n}))}),t)}function parseTime(e){if("number"==typeof e)return e;const t=e.match(/^(\d+)(ms|s|m)?$/);if(t){const e=parseInt(t[1],10);switch(t[2]||"ms"){case"ms":return e;case"s":return 1e3*e;case"m":return 60*e*1e3;default:return e}}return 0}async function handleDebounce(e,t,n){const s=e.getAttribute("pp-debounce")||"",o=e.getAttribute("pp-trigger")||"",a=e.getAttribute("pp-target-only")||"",c=async t=>{t.preventDefault();try{(o||a)&&(a?invokeHandler(e,o):await invokeHandler(e,o)),await invokeHandler(e,n)}catch(e){}};if(s){const n=debounce(c,parseTime(s));e instanceof HTMLFormElement&&"submit"===t?e.addEventListener(t,(e=>{e.preventDefault(),n(e)})):e.addEventListener(t,n)}else e.addEventListener(t,c)}async function invokeHandler(e,t){try{const n=t.match(/^(\w+(\.\w+)*)\((.*)\)$/);if(n){const s=n[1],o=n[3],a=s.split("."),{context:c,methodName:i}=resolveContext(a);if("function"==typeof c[i]){const e=parseArguments(o);await c[i](...e)}else await handleParsedCallback(e,t)}else await handleParsedCallback(e,t)}catch(e){}}function resolveContext(e){let t=window;for(let n=0;n<e.length-1;n++)if(t=t[e[n]],!t)throw new Error(`Cannot find object ${e[n]} in the context.`);return{context:t,methodName:e[e.length-1]}}function parseArguments(e){return e?JSON.parse(`[${e}]`):[]}async function handleParsedCallback(e,t){const{funcName:n,data:s}=parseCallback(e,t);if(!n)return;const o=window[n];if("function"==typeof o){const t=Array.isArray(s.args)?s.args:[],n=responseData?parseJson(responseData):null;await o(...t,e,s,n)}else responseData=await handleUndefinedFunction(e,n,s)}function handleAnchorTag(e){e instanceof HTMLAnchorElement&&e.addEventListener("click",(async e=>{const t=e.currentTarget,n=t.getAttribute("href"),s=t.getAttribute("target");if(n&&"_blank"!==s&&!e.metaKey&&!e.ctrlKey&&(e.preventDefault(),!isNavigating)){isNavigating=!0;try{/^(https?:)?\/\//i.test(n)&&!n.startsWith(window.location.origin)?window.location.href=n:(history.pushState(null,"",n),await handleNavigation())}catch(e){}finally{isNavigating=!1}}}))}async function handleNavigation(){try{updateDocumentContent(await pphpFetch(window.location.href))}catch(e){}}function updateDocumentContent(e){if(e.includes("<!DOCTYPE html>")){const t=(new DOMParser).parseFromString(e,"text/html"),n=e=>{const t=e.querySelectorAll("script"),n=[];return t.forEach((e=>{const t=document.createElement("script");t.type=e.type||"text/javascript",e.src?t.src=e.src:t.textContent=e.textContent,n.push(t),e.remove()})),n},s=n(t.head),o=n(t.body);document.replaceChild(document.adoptNode(t.documentElement),document.documentElement),s.forEach((e=>document.head.appendChild(e))),o.forEach((e=>document.body.appendChild(e)))}else{saveState();const t=saveScrollPositions(),n=(new DOMParser).parseFromString(e,"text/html"),s=Array.from(n.body.querySelectorAll("script")),o=n.body;diffAndPatch(document.body,o),restoreState(),restoreScrollPositions(t),s.forEach((e=>{const t=document.createElement("script");t.textContent=e.textContent,document.body.appendChild(t),document.body.removeChild(t)}))}attachWireFunctionEvents()}function diffAndPatch(e,t){e.nodeType===t.nodeType?e.nodeType!==Node.TEXT_NODE||t.nodeType!==Node.TEXT_NODE?e instanceof HTMLElement&&t instanceof HTMLElement&&e.replaceWith(t):e.textContent!==t.textContent&&(e.textContent=t.textContent):e.parentNode?.replaceChild(t,e)}function saveState(){const e=document.activeElement;state.focusId=e?.id||e?.name,state.focusValue=e?.value,state.focusChecked=e?.checked,state.focusType=e?.type,state.focusSelectionStart=e?.selectionStart,state.focusSelectionEnd=e?.selectionEnd,state.isSuspense=e.hasAttribute("pp-suspense"),state.checkedElements.clear(),document.querySelectorAll('input[type="checkbox"]:checked').forEach((e=>{state.checkedElements.add(e.id||e.name)})),document.querySelectorAll('input[type="radio"]:checked').forEach((e=>{state.checkedElements.add(e.id||e.name)}))}function restoreState(){if(state.focusId){const e=document.getElementById(state.focusId)||document.querySelector(`[name="${state.focusId}"]`);if(e instanceof HTMLInputElement){e.focus();const t=e.value.length||0;if(void 0!==state.focusSelectionStart&&null!==state.focusSelectionEnd&&e.setSelectionRange(t,t),state.focusValue)if("checkbox"===e.type||"radio"===e.type)e.checked=!!state.focusChecked;else{e.hasAttribute("pp-suspense")||state.isSuspense||(e.value=state.focusValue)}}else if(e instanceof HTMLTextAreaElement){e.focus();const t=e.value.length||0;void 0!==state.focusSelectionStart&&null!==state.focusSelectionEnd&&e.setSelectionRange(t,t),state.focusValue&&(e.value=state.focusValue)}else e instanceof HTMLSelectElement&&(e.focus(),state.focusValue&&(e.value=state.focusValue))}state.checkedElements.forEach((e=>{const t=document.getElementById(e);t&&(t.checked=!0)}))}function saveScrollPositions(){const e={};return document.querySelectorAll("*").forEach((t=>{(t.scrollTop||t.scrollLeft)&&(e[getElementKey(t)]={scrollTop:t.scrollTop,scrollLeft:t.scrollLeft})})),e}function restoreScrollPositions(e){document.querySelectorAll("*").forEach((t=>{const n=getElementKey(t);e[n]&&(t.scrollTop=e[n].scrollTop,t.scrollLeft=e[n].scrollLeft)}))}function getElementKey(e){return e.id||e.className||e.tagName}async function pphpFetch(e,t){const n=await fetch(e,{...t,headers:{...t?.headers,"X-Requested-With":"XMLHttpRequest"}});return await n.text()}function parseCallback(e,t){let n={};const s=e.closest("form");if(s){new FormData(s).forEach(((e,t)=>{n[t]?Array.isArray(n[t])?n[t].push(e):n[t]=[n[t],e]:n[t]=e}))}else e instanceof HTMLInputElement?n=handleInputElement(e):(e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement)&&(n[e.name]=e.value);const o=t.match(/(\w+)\((.*)\)/);if(o){const e=o[1];let t=o[2].trim();if(t.startsWith("{")&&t.endsWith("}"))try{const e=parseJson(t);"object"==typeof e&&null!==e&&(n={...n,...e})}catch(e){}else{const e=t.split(/,(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/).map((e=>e.trim().replace(/^['"]|['"]$/g,"")));n.args=e}return{funcName:e,data:n}}return{funcName:t,data:n}}function handleInputElement(e){let t={};if(e.name)if("checkbox"===e.type)t[e.name]={value:e.value,checked:e.checked};else if("radio"===e.type){const n=document.querySelector(`input[name="${e.name}"]:checked`);t[e.name]=n?n.value:null}else t[e.name]=e.value;else"checkbox"===e.type||"radio"===e.type?t.value=e.checked:t.value=e.value;return t}function updateElementAttributes(e,t){for(const n in t)if(t.hasOwnProperty(n))switch(n){case"innerHTML":case"outerHTML":case"textContent":case"innerText":e[n]=decodeHTML(t[n]);break;case"insertAdjacentHTML":e.insertAdjacentHTML(t.position||"beforeend",decodeHTML(t[n].html));break;case"insertAdjacentText":e.insertAdjacentText(t.position||"beforeend",decodeHTML(t[n].text));break;case"setAttribute":e.setAttribute(t.attrName,decodeHTML(t[n]));break;case"removeAttribute":e.removeAttribute(t[n]);break;case"className":e.className=decodeHTML(t[n]);break;case"classList.add":e.classList.add(...decodeHTML(t[n]).split(","));break;case"classList.remove":e.classList.remove(...decodeHTML(t[n]).split(","));break;case"classList.toggle":e.classList.toggle(decodeHTML(t[n]));break;case"classList.replace":const[s,o]=decodeHTML(t[n]).split(",");e.classList.replace(s,o);break;case"dataset":e.dataset[t.attrName]=decodeHTML(t[n]);break;case"style":Object.assign(e.style,t[n]);break;case"value":e.value=decodeHTML(t[n]);break;case"checked":e.checked=t[n];break;default:e.setAttribute(n,decodeHTML(t[n]))}}function decodeHTML(e){const t=document.createElement("textarea");return t.innerHTML=e,t.value}async function handleSuspenseElement(e){let t=e.getAttribute("pp-suspense")||"";const n=(e,t)=>{for(const n in t)if(t.hasOwnProperty(n))for(const t of e.elements)if(t instanceof HTMLInputElement||t instanceof HTMLButtonElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement){const e=t.getAttribute("pp-suspense")||"";if(e)if(isJsonLike(e)){const n=parseJson(e);"disabled"!==n.onsubmit&&updateElementAttributes(t,n)}else s(t,e)}},s=(e,t)=>{e instanceof HTMLInputElement?e.value=t:e.textContent=t};try{if(t&&isJsonLike(t)){const s=parseJson(t);if(s)if(e instanceof HTMLFormElement){const t=new FormData(e),o={};t.forEach(((e,t)=>{o[t]=e})),s.disabled&&toggleFormElements(e,!0);const{disabled:a,...c}=s;updateElementAttributes(e,c),n(e,o)}else if(s.targets){s.targets.forEach((e=>{const{id:t,...s}=e,o=document.querySelector(t);o&&((e,t)=>{e instanceof HTMLFormElement?n(e,t):updateElementAttributes(e,t)})(o,s)}));const{targets:t,...o}=s;updateElementAttributes(e,o)}else{if("disabled"===s.empty&&""===e.value)return;const{empty:t,...n}=s;updateElementAttributes(e,n)}}else if(t)s(e,t);else if(e instanceof HTMLFormElement){const t=new FormData(e),s={};t.forEach(((e,t)=>{s[t]=e})),n(e,s)}}catch(e){}}function parseJson(e){return JSON.parse(e.replace(/'/g,'"'))}function toggleFormElements(e,t){Array.from(e.elements).forEach((e=>{(e instanceof HTMLInputElement||e instanceof HTMLButtonElement||e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement)&&(e.disabled=t)}))}async function handleUndefinedFunction(e,t,n){const s={callback:t,...n},o={method:"POST",headers:{"Content-Type":"application/json",HTTP_PPHP_WIRE_REQUEST:"true"},body:JSON.stringify(s)},a={method:"POST",headers:{"Content-Type":"application/json",HTTP_PPHP_WIRE_REQUEST:"true"},body:JSON.stringify({secondRequestC69CD:!0})};try{handleSuspenseElement(e);const t=e.getAttribute("pp-target-only")||"";t&&handlerTargetOnly(e,t);const n=window.location.pathname,s=await pphpFetch(n,o);if(t)return s;const c=e.getAttribute("pp-function-only")||"";if(handleFunctionOnly(c,s),c)return s;const i=await pphpFetch(n,a);if(s.includes("redirect_7F834=")){const e=s.split("=")[1];await handleRedirect(e)}else{const e=new DOMParser,t=e.parseFromString(i,"text/html").body.innerHTML;updateDocumentContent(s+t)}}catch(e){}}function handlerTargetOnly(e,t){if(!isJsonLike(t))return;const n=e=>{if(e.startsWith("#")){const t=e.slice(1);return document.querySelector(`[id="${t}"]`)}return document.querySelector(e)},s=parseJson(t);s.targets.forEach((t=>{const o=(e=>{if(e.includes(" + ")){const[t,s]=e.split(" + "),o=n(t);if(o){const e=o.nextElementSibling;if(e&&e.matches(s))return e}return null}return n(e)})(t.id);if(o){const n=!!t.this.condition&&((e,t)=>{switch(t){case"checked":return e.checked;case"focus":return e===document.activeElement;default:return!1}})(e,t.this.condition),c=t.this.classList,i={...t.this};c&&((e,t,n)=>{n?(t.add&&e.classList.add(...t.add.split(" ")),t.remove&&e.classList.remove(...t.remove.split(" "))):(t.add&&e.classList.remove(...t.add.split(" ")),t.remove&&e.classList.add(...t.remove.split(" ")))})(o,c,n),Object.keys(i).forEach((e=>{if("id"!==e&&"condition"!==e&&"classList"!==e){const t=i[e];"function"==typeof o[e]?o[e](t):o[e]=t}})),s.actions&&(a=o,s.actions.forEach((e=>{const[t,...n]=e.method.split("."),s=e.value;if(n.length){let e=a[t];for(let t=0;t<n.length-1;t++)e=e[n[t]];e[n[n.length-1]]=s}else a[t]=s})))}var a}))}function handleFunctionOnly(e,t){if(!isJsonLike(e))return;const n=parseJson(e),s=t?parseJson(t):null,o=n.targets;Array.isArray(o)&&o.forEach((e=>{const{id:t,...n}=e,o=document.querySelector(t);let a={};if(s){for(const t in n)if(n.hasOwnProperty(t))switch(t){case"innerHTML":case"outerHTML":case"textContent":case"innerText":"response"===n[t]&&(a[t]=e.responseKey?s[e.responseKey]:s.response);break;default:a[t]=n[t];break}}else a=n;o&&updateElementAttributes(o,a)}))}async function handleRedirect(e){if(e){history.pushState(null,"",e),window.dispatchEvent(new PopStateEvent("popstate",{state:null}));try{const t=await fetch(e,{headers:{"X-Requested-With":"XMLHttpRequest"}});updateDocumentContent(await t.text())}catch(e){}}}function debounce(e,t=300,n=!1){let s;return function(...o){const a=this;s&&clearTimeout(s),s=setTimeout((()=>{s=null,n||e.apply(a,o)}),t),n&&!s&&e.apply(a,o)}}function copyCode(e,t,n,s,o=2e3){const a=e.closest(`.${t}`)?.querySelector("pre code"),c=a?.textContent?.trim()||"";c?navigator.clipboard.writeText(c).then((()=>{const t=e.querySelector("i");t&&(t.className=s),setTimeout((()=>{t&&(t.className=n)}),o)}),(()=>{alert("Failed to copy command to clipboard")})):alert("Failed to find the code block to copy")}if(window.addEventListener("popstate",(async()=>{await handleNavigation()})),void 0===store){class e{static instance=null;state;listeners;constructor(e={}){this.state=e,this.listeners=[]}static getInstance(t={}){return e.instance||(e.instance=new e(t),e.instance.loadState()),e.instance}setState(e,t=!1){this.state={...this.state,...e},this.listeners.forEach((e=>e(this.state))),t&&this.saveState()}subscribe(e){return this.listeners.push(e),e(this.state),()=>{this.listeners=this.listeners.filter((t=>t!==e))}}saveState(){localStorage.setItem("appState",JSON.stringify(this.state))}loadState(){const e=localStorage.getItem("appState");e&&(this.state=JSON.parse(e),this.listeners.forEach((e=>e(this.state))))}resetState(e=!1){this.state={},this.listeners.forEach((e=>e(this.state))),e&&localStorage.removeItem("appState")}}store=e.getInstance()}