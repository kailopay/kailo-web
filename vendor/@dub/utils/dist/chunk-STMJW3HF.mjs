var r=(e,n)=>{let t=new Date(e),a=new Date;return t.toLocaleDateString("en-US",{day:"numeric",month:"long",...t.getUTCFullYear()!==a.getUTCFullYear()?{year:"numeric"}:{},...n})};export{r as a};
