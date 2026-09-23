async function c(n){let r=new TextEncoder().encode(n),t=await crypto.subtle.digest("SHA-256",r);return Array.from(new Uint8Array(t)).map(a=>a.toString(16).padStart(2,"0")).join("")}export{c as a};
