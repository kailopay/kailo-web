var n=t=>{let e=t?new Date(t):new Date;return e.toString()==="Invalid Date"?"":new Date(e.getTime()-e.getTimezoneOffset()*6e4).toISOString().split(":").slice(0,2).join(":")};export{n as a};
