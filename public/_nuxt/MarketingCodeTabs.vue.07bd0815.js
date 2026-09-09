import{d as u,y as d,o as r,c,b as t,F as l,r as p,k as b,e as i,t as s}from"./entry.b4a0f580.js";const m={class:"flex flex-wrap gap-1 border-b border-white/[0.07] px-3.5 py-3"},y=["onClick"],x={class:"m-0 min-h-[340px] overflow-x-auto px-5 py-[22px] font-mono text-[12.5px] leading-[1.95] text-[#C9D2DE]"},D=u({__name:"MarketingCodeTabs",setup(_){const n=[{label:"cURL",code:`curl -X POST "https://api.sinbad.com/v1/quote" \\
  -H "Authorization: Bearer $SINBAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "direction": "onramp",
    "currencyIn": "LBP",
    "currencyOut": "USDC",
    "amount": "1500000"
  }'`},{label:"Node",code:`import { Sinbad } from "@sinbad/sdk";

const sinbad = new Sinbad(({}).SINBAD_KEY);

const quote = await sinbad.quotes.create({
  direction: "onramp",
  currencyIn: "LBP",
  currencyOut: "USDC",
  amount: "1500000",
});`},{label:"React",code:`import { useSinbadQuote } from "@sinbad/react";

function Ramp() {
  const { quote } = useSinbadQuote({
    direction: "onramp",
    currencyIn: "LBP",
    currencyOut: "USDC",
    amount: "1500000",
  });

  return <QuoteCard quote={quote} />;
}`},{label:"Flutter",code:`final sinbad = Sinbad(apiKey: dotenv.env['SINBAD_KEY']);

final quote = await sinbad.quotes.create(
  direction: Direction.onramp,
  currencyIn: 'LBP',
  currencyOut: 'USDC',
  amount: '1500000',
);`},{label:"Swift",code:`let sinbad = Sinbad(apiKey: env["SINBAD_KEY"]!)

let quote = try await sinbad.quotes.create(
    direction: .onramp,
    currencyIn: "LBP",
    currencyOut: "USDC",
    amount: "1500000"
)`}],e=d(0);return(S,f)=>(r(),c("div",null,[t("div",m,[(r(),c(l,null,p(n,(o,a)=>t("button",{key:o.label,type:"button",class:b(["rounded-[7px] px-[11px] py-1.5 font-mono text-[11.5px] transition-colors",i(e)===a?"bg-white/10 text-[#E8EAF0]":"text-ink-footer hover:text-ink-muted"]),onClick:B=>e.value=a},s(o.label),11,y)),64))]),t("pre",x,s(n[i(e)].code),1)]))}});export{D as _};
