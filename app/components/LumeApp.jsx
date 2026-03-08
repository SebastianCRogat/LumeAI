"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getMockData } from "@/lib/analysis";
import { useIsMobile } from "@/lib/useMediaQuery";
import {
  BG,
  PN,
  CD,
  BD,
  AC,
  TX,
  MU,
  DM,
  GR,
  RD,
  BL,
  YL,
  CN,
  CARD_RADIUS,
  BTN_RADIUS,
  PIE_COLORS,
  CHART_COLOR,
  GRIDLINE,
  SPACE,
  CONTENT_MAX_WIDTH,
} from "@/lib/theme";

var ADMIN_EMAIL=(typeof process!=="undefined"&&process.env&&process.env.NEXT_PUBLIC_ADMIN_EMAIL)||"";
var FULL_ACCESS_USER_ID="0293de54-f62f-440b-a834-dec05f57cefc";
function isAdmin(user){if(!user)return false;if(user.id===FULL_ACCESS_USER_ID)return true;if(!ADMIN_EMAIL)return false;return user.email&&user.email.toLowerCase()===ADMIN_EMAIL.toLowerCase();}

var UNKNOWN_COLOR="#2d343c";
function isUrl(s){if(!s||typeof s!=="string")return false;var t=s.trim();return t.startsWith("http://")||t.startsWith("https://");}

function LumeLogo({size}){var s=size||24;return(<svg width={s} height={s} viewBox="0 0 32 32" fill="none"><rect width={32} height={32} rx={8} fill={BG}/><path d="M10 22V10h3v12h6v2H10z" fill={TX}/><path d="M22 14.5c0-.8.6-1.5 1.4-1.5.8 0 1.4.7 1.4 1.5v5c0 .8-.6 1.5-1.4 1.5-.8 0-1.4-.7-1.4-1.5v-5z" fill={TX} opacity={0.6}/></svg>);}

function parseMarketValue(s){if(!s||typeof s!=="string")return "—";var i=s.indexOf("(");var v=(i>0?s.slice(0,i).trim():s.trim())||"—";return v;}
function Badge({children,color}){var c=color||AC;return(<span style={{fontSize:10,fontWeight:700,letterSpacing:0.5,color:c,background:c+"20",padding:"4px 10px",borderRadius:BTN_RADIUS,border:"none"}}>{children}</span>);}
function Stat({label,value,color,expandable,maxLength,trend}){var isUp=trend==="up";var isDown=trend==="down";return(<div style={{padding:SPACE.lg,background:PN+"88",borderRadius:CARD_RADIUS,border:"none"}}><div style={{fontSize:10,color:DM,fontWeight:800,letterSpacing:0.5,marginBottom:SPACE.sm,textTransform:"uppercase"}}>{label}</div>{expandable?<ExpandableText text={value||"N/A"} maxLength={maxLength||60} style={{fontSize:18,fontWeight:700,color:color||TX,lineHeight:1.35,display:"block"}}/>:(<div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontSize:18,fontWeight:700,color:color||TX,lineHeight:1.35}}>{value||"N/A"}</span>{(isUp||isDown)&&<span style={{display:"inline-flex",alignItems:"center"}}>{isUp&&<svg width={14} height={14} viewBox="0 0 12 12" fill="none"><path d="M6 3v6M3 6l3-3 3 3" stroke={GR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}{isDown&&<svg width={14} height={14} viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 6l3 3 3-3" stroke={AC} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}</span>}</div>)}</div>);}
function Head({title}){return(<div style={{marginBottom:SPACE.md,marginTop:SPACE.xl}}><span style={{fontSize:11,fontWeight:800,letterSpacing:1.2,color:DM,textTransform:"uppercase"}}>{title}</span></div>);}

function ExpandableText({text,maxLength,style}){
  var limit=maxLength||80;
  var _exp=useState(false);var expanded=_exp[0];var setExpanded=_exp[1];
  if(!text||text.length<=limit)return <span style={style}>{text}</span>;
  return(
    <span style={style}>
      {expanded?text:text.slice(0,limit).trimEnd()+"..."}
      <button type="button" onClick={function(e){e.stopPropagation();setExpanded(!expanded);}} style={{fontSize:11,color:AC,background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontWeight:600,display:"inline",marginLeft:4}}>{expanded?"Show less":"See more"}</button>
    </span>
  );
}

function BentoCard({title,children,span}){return(<div style={{gridColumn:span||"span 1",background:CD,borderRadius:CARD_RADIUS,padding:0,boxShadow:"0 4px 24px rgba(0,0,0,0.4)",border:"1px solid "+BD+"40",overflow:"hidden"}}>{title&&<div style={{display:"flex",alignItems:"center",padding:SPACE.md+"px "+SPACE.lg+"px",borderBottom:"1px solid "+BD+"60"}}><span style={{fontSize:11,fontWeight:800,letterSpacing:1.5,color:TX,textTransform:"uppercase"}}>{title}</span></div>}<div style={{padding:SPACE.xl}}>{children}</div></div>);}
function ArrowUp(){return(<svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{display:"block",marginBottom:2}}><path d="M6 3v6M3 6l3-3 3 3" stroke={GR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function ArrowDown(){return(<svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{display:"block",marginBottom:2}}><path d="M6 9V3M3 6l3 3 3-3" stroke={AC} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function MetricBlock({value,label,trend}){var isUp=trend==="up";var isDown=trend==="down";return(<div style={{marginBottom:12}}>{isUp&&<ArrowUp/>}{isDown&&<ArrowDown/>}<div style={{fontSize:22,fontWeight:700,color:TX}}>{value}</div><div style={{fontSize:12,color:MU,marginTop:2}}>{label}</div></div>);}

function Collapsible({title,defaultOpen,children}){var _o=useState(!!defaultOpen);var open=_o[0];var setOpen=_o[1];return(<div style={{marginBottom:SPACE.lg}}><button type="button" onClick={function(){setOpen(function(o){return !o;});}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:PN+"66",border:"none",padding:"10px 14px",borderRadius:BTN_RADIUS,cursor:"pointer",color:TX,fontSize:12,fontWeight:600,textAlign:"left"}}><span style={{textTransform:"uppercase",letterSpacing:0.8,fontWeight:800}}>{title}</span><span style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block"}}><svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg></span></button>{open?<div style={{paddingTop:10}}>{children}</div>:null}</div>);}

function PieChart({competitors,compact,large}){
  var list=competitors||[];
  var slices=[];
  var knownTotal=0;
  for(var i=0;i<list.length;i++){
    var raw=String(list[i].share||"0").replace(/[^0-9.]/g,"");
    var pct=parseFloat(raw)||0;
    var src=list[i].shareSource||null;
    if(pct>0){slices.push({name:list[i].name,value:pct,color:PIE_COLORS[i%PIE_COLORS.length],source:isUrl(src)?src:null,sourceText:src&&!isUrl(src)?src:null});knownTotal+=pct;}
  }
  if(knownTotal<100){slices.push({name:"Unknown",value:100-knownTotal,color:UNKNOWN_COLOR,source:null});}
  var sz=large?220:160;
  var cx=90,cy=90,r=80,angle=-90;
  var paths=[];
  for(var j=0;j<slices.length;j++){
    var s=slices[j];
    var sweep=s.value/100*360;
    var startRad=angle*Math.PI/180;
    var endRad=(angle+sweep)*Math.PI/180;
    var x1=cx+r*Math.cos(startRad),y1=cy+r*Math.sin(startRad);
    var x2=cx+r*Math.cos(endRad),y2=cy+r*Math.sin(endRad);
    var large=sweep>180?1:0;
    if(sweep>=359.99){paths.push({d:"M "+(cx-r)+" "+cy+" A "+r+" "+r+" 0 1 1 "+(cx+r)+" "+cy+" A "+r+" "+r+" 0 1 1 "+(cx-r)+" "+cy,color:s.color,name:s.name,value:s.value,source:s.source});}
    else{paths.push({d:"M "+cx+" "+cy+" L "+x1+" "+y1+" A "+r+" "+r+" 0 "+large+" 1 "+x2+" "+y2+" Z",color:s.color,name:s.name,value:s.value,source:s.source});}
    angle+=sweep;
  }
  var wrapStyle=compact?{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap",marginBottom:0}:{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap",padding:16,background:CD,borderRadius:CARD_RADIUS,marginBottom:16,border:"1px solid "+BD+"30"};
  return(
    <div style={wrapStyle}>
      <svg width={sz} height={sz} viewBox="0 0 180 180">
        {paths.map(function(p,k){var hasLink=!!p.source;return <path key={k} d={p.d} fill={p.color} stroke={BG} strokeWidth={1.5} style={{cursor:hasLink?"pointer":"default",transition:"opacity 0.15s"}} onMouseEnter={function(e){if(hasLink)e.currentTarget.style.opacity="0.75";}} onMouseLeave={function(e){e.currentTarget.style.opacity="1";}} onClick={function(){if(hasLink)window.open(p.source,"_blank");}}/>;})
        }
        <circle cx={cx} cy={cy} r={24} fill={CD} stroke={GRIDLINE} strokeWidth={1}/>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {slices.map(function(s,k){var hasLink=!!s.source;var hasNote=!!s.sourceText;return(
          <div key={k}>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:hasLink?"pointer":"default",padding:"4px 6px",borderRadius:2,transition:"background 0.15s"}} onMouseEnter={function(e){if(hasLink)e.currentTarget.style.background=BD+"44";}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}} onClick={function(){if(hasLink)window.open(s.source,"_blank");}}>
              <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
              <span style={{fontSize:13,fontWeight:600,color:s.name==="Unknown"?MU:TX}}>{s.name}</span>
              <span style={{fontSize:13,fontWeight:700,color:s.name==="Unknown"?MU:CHART_COLOR}}>{s.value+"%"}</span>
              {hasLink&&<svg width={10} height={10} viewBox="0 0 12 12" fill="none"><path d="M3.5 1.5h7m0 0v7m0-7L3 9" stroke={s.color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            {hasLink&&<div style={{paddingLeft:22,fontSize:11,color:BL,cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220}} onClick={function(){window.open(s.source,"_blank");}}>{s.source.replace(/^https?:\/\/(www\.)?/,"").split("/")[0]}</div>}
            {hasNote&&<div style={{paddingLeft:22,fontSize:11,color:MU,fontStyle:"italic",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={s.sourceText}>{s.sourceText}</div>}
          </div>
        );})}
      </div>
    </div>
  );
}

function cleanJSON(raw){
  var t=raw.trim();var bt=String.fromCharCode(96);while(t.indexOf(bt)>-1)t=t.split(bt).join("");
  if(t.indexOf("json")===0)t=t.substring(4);t=t.trim();
  var s=t.indexOf("{");if(s<0)return null;
  var depth=0,inStr=false,esc=false,end=-1;
  for(var i=s;i<t.length;i++){var ch=t[i];if(esc){esc=false;continue;}if(ch==="\\"){esc=true;continue;}if(ch==='"'){inStr=!inStr;continue;}if(inStr)continue;if(ch==="{"||ch==="[")depth++;if(ch==="}"||ch==="]")depth--;if(depth===0){end=i;break;}}
  if(end>-1){try{return JSON.parse(t.substring(s,end+1));}catch(e){}}
  var chunk=t.substring(s),stk=[],s2=false,e2=false;
  for(var k=0;k<chunk.length;k++){var c=chunk[k];if(e2){e2=false;continue;}if(c==="\\"){e2=true;continue;}if(c==='"'){s2=!s2;continue;}if(s2)continue;if(c==="{")stk.push("}");if(c==="[")stk.push("]");if(c==="}"||c==="]"){if(stk.length)stk.pop();}}
  while(stk.length)chunk+=stk.pop();
  try{return JSON.parse(chunk);}catch(e){return null;}}

function buildPrompt(idea){
  var schema={summary:{title:"s",oneLiner:"s",verdict:"HIGH POTENTIAL",confidence:70,keyInsight:"s"},market:{globalSize:"s",targetSize:"s",cagr:"s",maturity:"GROWING",dataPoints:[{metric:"s",value:"s",type:"VERIFIED",benchmark:null}],trends:["s"],risks:["s"]},competitors:{total:"s",list:[{name:"s",desc:"s",share:"s",revenue:"s",strengths:["s"],weaknesses:["s"],threat:"HIGH"}],gaps:["s"],barriers:["s"]},product:{audience:"s",audienceSize:"s",painPoints:["s"],priceRange:"s",suggestedPrice:"s",channels:["s"],gtm:["s"]},assumptions:[{step:1,verified:"real data",assumption:"derived",logic:"reasoning",confidence:"HIGH"}]};
  return "You are a market research analyst. Research: "+idea+"\n\nAnalyze: 1) Market size, growth, trends, risks 2) Competitors 3) Target audience, pricing, channels 4) Assumption chain: use verified data as benchmark\n\ntype: VERIFIED or ASSUMPTION. verdict: HIGH POTENTIAL or MODERATE or RISKY or NICHE. threat: HIGH or MEDIUM or LOW.\nReturn ONLY valid JSON:\n"+JSON.stringify(schema);}

function DataPointRow({r}){
  var hasSource=r.type==="VERIFIED"&&r.source;
  var isVerified=r.type==="VERIFIED";
  return(<div style={{padding:"10px 0",borderBottom:"1px solid "+BD+"30",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,cursor:hasSource?"pointer":"default",transition:"background 0.15s",lineHeight:1.4}} onMouseEnter={function(e){if(hasSource)e.currentTarget.style.background=BD+"22";}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}} onClick={function(){if(hasSource)window.open(r.source,"_blank");}}><span style={{fontSize:13,color:MU,flex:1}}>{r.metric}</span><span style={{fontSize:13,fontWeight:600,color:TX}}>{r.value}</span>{isVerified?(<span style={{width:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",color:GR,flexShrink:0}} title="Verified"><svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke={GR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg></span>):(<span style={{width:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",color:YL,flexShrink:0}} title="Assumption"><svg width={10} height={10} viewBox="0 0 12 12" fill="none"><circle cx={6} cy={6} r={4} stroke={YL} strokeWidth={1.5}/></svg></span>)}</div>);
}

function TrendRiskRow({item,accentColor}){
  var text=typeof item==="string"?item:item.text;
  var type=typeof item==="string"?"ASSUMPTION":(item.type||"ASSUMPTION");
  var source=typeof item==="string"?null:(item.source||null);
  var hasSource=type==="VERIFIED"&&!!source;
  var isVerified=type==="VERIFIED";
  return(<div style={{fontSize:13,color:TX,padding:"10px 12px",marginBottom:6,borderLeft:"3px solid "+accentColor,borderRadius:4,borderBottom:"1px solid "+BD+"25",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,cursor:hasSource?"pointer":"default",transition:"background 0.15s",lineHeight:1.45}} onMouseEnter={function(e){if(hasSource)e.currentTarget.style.background=BD+"22";}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}} onClick={function(){if(hasSource)window.open(source,"_blank");}}><span style={{flex:1}}>{text}</span>{isVerified?(<span style={{width:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",color:GR,flexShrink:0}} title="Verified"><svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke={GR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg></span>):(<span style={{width:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",color:YL,flexShrink:0}} title="Assumption"><svg width={10} height={10} viewBox="0 0 12 12" fill="none"><circle cx={6} cy={6} r={4} stroke={YL} strokeWidth={1.5}/></svg></span>)}</div>);
}

function ShowMoreBtn({count,onClick,label}){if(count<=0)return null;return(<button type="button" onClick={onClick} style={{fontSize:11,color:AC,background:AC+"18",border:"1px solid "+AC+"44",padding:"8px 14px",borderRadius:BTN_RADIUS,cursor:"pointer",marginTop:10,fontWeight:600}}>{label||"Show "+count+" more"}</button>);}

function ChartTooltip({visible,x,y,title,value,unit}){
  if(!visible)return null;
  return(<div style={{position:"fixed",left:x,top:y+14,zIndex:9999,pointerEvents:"none",padding:"10px 14px",background:CD,border:"1px solid "+BD,borderRadius:BTN_RADIUS,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",fontSize:12,minWidth:140}}><div style={{fontSize:10,fontWeight:700,letterSpacing:0.5,color:DM,textTransform:"uppercase",marginBottom:4}}>{title}</div><div style={{fontSize:14,fontWeight:700,color:TX}}>{value}{unit!=null&&unit!==""?" "+unit:""}</div></div>);
}

function MarketChart5Y({history5y,large,compact}){
  var data=history5y||[];if(!data.length)return null;
  var _tip=useState({visible:false,x:0,y:0,year:"",value:""});var tooltip=_tip[0];var setTooltip=_tip[1];
  var vals=data.map(function(d){return typeof d.value==="number"?d.value:parseFloat(String(d.value).replace(/[^0-9.]/g,""))||0;});
  var max=Math.max.apply(null,vals)||1;
  var w=large?480:320;var h=large?200:140;var pad={l:40,r:40,t:24,b:36};
  var chartW=w-pad.l-pad.r;var chartH=h-pad.t-pad.b;
  var pts=data.map(function(d,i){var v=typeof d.value==="number"?d.value:parseFloat(String(d.value).replace(/[^0-9.]/g,""))||0;var pct=v/max;var x=pad.l+i/(Math.max(1,data.length-1))*chartW;var y=pad.t+chartH-pct*chartH;return{x:x,y:y,v:v,label:d.label||d.year};});
  var pathD=pts.length>1?"M "+pts.map(function(p){return p.x+" "+p.y;}).join(" L "):"";
  var gridLines=[];for(var g=1;g<=4;g++){var gy=pad.t+chartH*(1-g/4);gridLines.push(<line key={g} x1={pad.l} y1={gy} x2={w-pad.r} y2={gy} stroke={GRIDLINE} strokeWidth={1} strokeDasharray="2,2" opacity={0.6}/>);}
  var wrapStyle=compact?{marginBottom:0}:{padding:16,background:CD,borderRadius:CARD_RADIUS,marginBottom:16,border:"1px solid "+BD+"30"};
  var displayLabel=function(i){var L=data[i].label;if(L!=null&&String(L).trim()!=="")return String(L).trim();var raw=data[i].value;if(raw!=null&&String(raw).trim()!=="")return String(raw);return pts[i].v!=null?String(pts[i].v):"—";};
  return(<div style={wrapStyle}>{!compact&&<div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:DM,marginBottom:12,textTransform:"uppercase"}}>Market development (5 years)</div>}<ChartTooltip visible={tooltip.visible} x={tooltip.x} y={tooltip.y} title={tooltip.year?"Year "+tooltip.year:""} value={tooltip.value} unit={/^\d+(\.\d+)?$/.test(String(tooltip.value||"").trim())?"market size":undefined}/><svg width="100%" height={h} viewBox={"0 0 "+w+" "+h} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}><g>{gridLines}</g><path d={pathD} fill="none" stroke={CHART_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>{pts.map(function(p,i){return(<g key={i} onMouseEnter={function(e){setTooltip({visible:true,x:e.clientX,y:e.clientY,year:data[i].year||"",value:displayLabel(i)});}} onMouseLeave={function(){setTooltip({visible:false});}}><circle cx={p.x} cy={p.y} r={4} fill={CHART_COLOR} style={{cursor:"pointer"}}/><text x={p.x} y={h-10} textAnchor="middle" fill={DM} style={{fontSize:10,fontWeight:600}}>{data[i].year||""}</text></g>);})}</svg></div>);
}

function CompetitorChart5Y({competitors5y,large,compact}){
  var data=competitors5y||[];if(!data.length)return null;
  var _tip=useState({visible:false,x:0,y:0,year:"",value:""});var tooltip=_tip[0];var setTooltip=_tip[1];
  var vals=data.map(function(d){return typeof d.count==="number"?d.count:parseInt(String(d.count).replace(/[^0-9]/g,""),10)||0;});
  var max=Math.max.apply(null,vals)||1;
  var w=large?360:280;var h=large?260:180;var pad={l:36,r:20,t:24,b:36};
  var chartW=w-pad.l-pad.r;var chartH=h-pad.t-pad.b;
  var pts=data.map(function(d,i){var v=typeof d.count==="number"?d.count:parseInt(String(d.count).replace(/[^0-9]/g,""),10)||0;var pct=max>0?v/max:0;var x=pad.l+i/(Math.max(1,data.length-1))*chartW;var y=pad.t+chartH-pct*chartH;return{x:x,y:y,v:v,label:d.year};});
  var pathD=pts.length>1?"M "+pts.map(function(p){return p.x+" "+p.y;}).join(" L "):"";
  var gridLines=[];for(var g=1;g<=4;g++){var gy=pad.t+chartH*(1-g/4);gridLines.push(<line key={g} x1={pad.l} y1={gy} x2={w-pad.r} y2={gy} stroke={GRIDLINE} strokeWidth={1} strokeDasharray="2,2" opacity={0.6}/>);}
  var wrapStyle=compact?{marginBottom:0}:{padding:16,background:CD,borderRadius:CARD_RADIUS,marginBottom:16,border:"1px solid "+BD+"30"};
  return(<div style={wrapStyle}>{!compact&&<div style={{fontSize:11,fontWeight:800,letterSpacing:1,color:MU,marginBottom:12,textTransform:"uppercase"}}>Amount of competitors</div>}<ChartTooltip visible={tooltip.visible} x={tooltip.x} y={tooltip.y} title={tooltip.year?"Year "+tooltip.year:""} value={tooltip.value} unit="competitors"/><svg width="100%" height={h} viewBox={"0 0 "+w+" "+h} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}><g>{gridLines}</g><path d={pathD} fill="none" stroke={CHART_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>{pts.map(function(p,i){return(<g key={i} onMouseEnter={function(e){setTooltip({visible:true,x:e.clientX,y:e.clientY,year:data[i].year||"",value:String(p.v)});}} onMouseLeave={function(){setTooltip({visible:false});}}><circle cx={p.x} cy={p.y} r={5} fill={CHART_COLOR} style={{cursor:"pointer"}}/><text x={p.x} y={h-10} textAnchor="middle" fill={TX} style={{fontSize:12,fontWeight:700}}>{data[i].year||""}</text></g>);})}</svg></div>);
}

function parseRevenueNum(s){
  if(!s||typeof s!=="string")return 0;
  var t=s.replace(/\s/g,"").toUpperCase();
  var mult=1;
  if(t.indexOf("B")>-1)mult=1000;
  var raw=parseFloat(t.replace(/[^0-9.]/g,""))||0;
  return raw*mult;
}

function SpiderChart({competitors,compact,large}){
  var list=competitors||[];
  if(list.length<2)return null;
  var axes=[{key:"share",label:"Share"},{key:"threat",label:"Threat"},{key:"strengths",label:"Strengths"},{key:"weaknesses",label:"Weaknesses"},{key:"revenue",label:"Revenue"}];
  var revVals=list.map(function(c){return parseRevenueNum(c.revenue);});
  var revMax=Math.max.apply(null,revVals)||1;
  var series=list.map(function(c,i){
    var share=parseFloat(String(c.share||"0").replace(/[^0-9.]/g,""))||0;
    var threat=c.threat==="HIGH"?100:c.threat==="MEDIUM"?50:33;
    var strCount=(c.strengths||[]).length;
    var wknCount=(c.weaknesses||[]).length;
    var strengths=Math.min(100,strCount*25);
    var weaknesses=Math.max(0,100-wknCount*25);
    var revenue=revMax>0?Math.min(100,(parseRevenueNum(c.revenue)/revMax)*100):50;
    return{name:c.name,values:[share,threat,strengths,weaknesses,revenue],color:PIE_COLORS[i%PIE_COLORS.length]};
  });
  var totalSize=large?280:220;
  var margin=36;
  var totalView=totalSize+2*margin;
  var padding=44;
  var cx=totalView/2;var cy=totalView/2;
  var R=Math.min(totalSize/2-8,cx-margin-6);
  var n=5;
  var angle0=-90;
  var toXY=function(angle,r){var a=(angle0+angle)*Math.PI/180;return{cx:cx+r*Math.cos(a),cy:cy+r*Math.sin(a)};};
  var gridCircles=[];for(var g=1;g<=4;g++){var r=(g/4)*R;var pts=[];for(var a=0;a<=n;a++){var p=toXY(a*360/n,r);pts.push(p.cx+" "+p.cy);}gridCircles.push(<polygon key={g} points={pts.join(" ")} fill="none" stroke={GRIDLINE} strokeWidth={1} strokeDasharray="2,2" opacity={0.5}/>);}
  var axisLines=[];var axisLabels=[];var labelR=R+20;
  for(var a=0;a<n;a++){var deg=a*360/n;var p=toXY(deg,R);axisLines.push(<line key={a} x1={cx} y1={cy} x2={p.cx} y2={p.cy} stroke={GRIDLINE} strokeWidth={1} opacity={0.7}/>);var lp=toXY(deg,labelR);var anchor=lp.cx<cx-5?"end":lp.cx>cx+5?"start":"middle";axisLabels.push(<text key={a} x={lp.cx} y={lp.cy} textAnchor={anchor} fill={TX} fontSize={11} fontWeight={700} style={{textTransform:"uppercase"}}>{axes[a].label}</text>);}
  var polygons=series.map(function(s,k){var pts=[];for(var i=0;i<n;i++){var v=Math.max(0,Math.min(100,s.values[i]));var r=(v/100)*R;var p=toXY(i*360/n,r);pts.push(p.cx+","+p.cy);}return(<polygon key={k} points={pts.join(" ")} fill={s.color+"30"} stroke={s.color} strokeWidth={2} strokeLinejoin="round"/>);});
  var wrapStyle=compact?{marginBottom:0}:{padding:16,background:CD,borderRadius:CARD_RADIUS,marginBottom:16,border:"1px solid "+BD+"30"};
  return(<div style={wrapStyle}>{!compact&&<div style={{fontSize:11,fontWeight:800,letterSpacing:1,color:MU,marginBottom:12,textTransform:"uppercase"}}>Competitor comparison</div>}<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}><svg width="100%" viewBox={"0 0 "+totalView+" "+totalView} preserveAspectRatio="xMidYMid meet" style={{display:"block",maxWidth:totalView}}><g>{gridCircles}{axisLines}{polygons}{axisLabels}</g></svg><div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:12}}>{series.map(function(s,i){return(<div key={i} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/><span style={{fontSize:12,fontWeight:600,color:TX}}>{s.name}</span></div>);})}</div></div></div>);
}

function BarChartShare({competitors}){
  var list=competitors||[];
  var maxVal=0;
  var items=list.map(function(c,i){var raw=String(c.share||"0").replace(/[^0-9.]/g,"");var pct=parseFloat(raw)||0;if(pct>maxVal)maxVal=pct;return {name:c.name,pct:pct,color:PIE_COLORS[i%PIE_COLORS.length]};});
  if(!items.length)return null;
  var scale=maxVal>0?maxVal:100;
  return(<div style={{marginTop:SPACE.lg,paddingTop:SPACE.lg,borderTop:"1px solid "+BD+"40"}}><div style={{fontSize:11,fontWeight:800,letterSpacing:1,color:MU,marginBottom:SPACE.sm,textTransform:"uppercase"}}>Share by competitor</div><div style={{display:"flex",flexDirection:"column",gap:SPACE.sm}}>{items.map(function(x,i){return(<div key={i} style={{display:"flex",alignItems:"center",gap:SPACE.sm}}><span style={{width:100,fontSize:13,fontWeight:600,color:TX,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.name}</span><div style={{flex:1,height:22,borderRadius:4,background:BD+"60",overflow:"hidden"}}><div style={{width:(x.pct/scale*100)+"%",height:"100%",background:x.color,borderRadius:4,transition:"width 0.3s ease",minWidth:x.pct>0?4:0}}/></div><span style={{fontSize:13,fontWeight:700,color:CHART_COLOR,width:40,textAlign:"right"}}>{x.pct+"%"}</span></div>);})}</div></div>);
}

function TabMarket({d,isMobile}){var m=d.market||{};var dp=m.dataPoints||[];var trends=m.trends||[];var risks=m.risks||[];var _dp=useState(false);var _tr=useState(false);var _rk=useState(false);var dpExpanded=_dp[0];var trExpanded=_tr[0];var rkExpanded=_rk[0];var setDp=_dp[1];var setTr=_tr[1];var setRk=_rk[1];var DP_INIT=5;var TR_INIT=3;var RK_INIT=3;var dpShow=dpExpanded?dp:dp.slice(0,DP_INIT);var trShow=trExpanded?trends:trends.slice(0,TR_INIT);var rkShow=rkExpanded?risks:risks.slice(0,RK_INIT);var dpRest=dp.length-DP_INIT;var trRest=trends.length-TR_INIT;var rkRest=risks.length-RK_INIT;var statCols=isMobile?"1fr":"1fr 1fr 1fr 1fr";var bentoCols=isMobile?"1fr":"minmax(0,1fr) minmax(0,1fr)";return(<div><Head title="Market overview"/><div style={{display:"grid",gridTemplateColumns:statCols,gap:SPACE.sm,marginBottom:SPACE.lg}}><Stat label="Global" value={parseMarketValue(m.globalSize)} trend={m.globalSizeTrend}/><Stat label="Target" value={parseMarketValue(m.targetSize)} trend={m.targetSizeTrend}/><Stat label="CAGR" value={m.cagr} color={GR}/><Stat label="Maturity" value={m.maturity}/></div><div style={{display:"grid",gridTemplateColumns:bentoCols,gap:SPACE.lg,marginBottom:SPACE.lg}}><BentoCard title="Market development (5 years)"><MarketChart5Y history5y={m.history5y} large={!isMobile} compact={true}/></BentoCard><BentoCard title="Data points"><div style={{fontSize:10,color:DM,marginBottom:8,display:"flex",alignItems:"center",gap:12}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><span style={{color:GR}}>●</span> Verified</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><span style={{color:YL}}>○</span> Assumption</span></div><div style={{marginBottom:8}}>{dpShow.map(function(r,i){return <DataPointRow key={i} r={r}/>;})}{dpExpanded&&dpRest>0?(<button type="button" onClick={function(){setDp(false);}} style={{fontSize:11,color:MU,marginTop:8,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button>):<ShowMoreBtn count={dpRest} onClick={function(){setDp(true);}} label={dpRest>0?"Show "+dpRest+" more":null}/>}</div></BentoCard></div><Collapsible title="Trends" defaultOpen={false}><div>{trShow.map(function(t,i){return <TrendRiskRow key={i} item={t} accentColor={GR}/>;})}{trExpanded&&trRest>0?(<button type="button" onClick={function(){setTr(false);}} style={{fontSize:11,color:MU,marginTop:8,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button>):<ShowMoreBtn count={trRest} onClick={function(){setTr(true);}} label={trRest>0?"Show "+trRest+" more":null}/>}</div></Collapsible><Collapsible title="Risks" defaultOpen={false}><div>{rkShow.map(function(r,i){return <TrendRiskRow key={i} item={r} accentColor={RD}/>;})}{rkExpanded&&rkRest>0?(<button type="button" onClick={function(){setRk(false);}} style={{fontSize:11,color:MU,marginTop:8,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button>):<ShowMoreBtn count={rkRest} onClick={function(){setRk(true);}} label={rkRest>0?"Show "+rkRest+" more":null}/>}</div></Collapsible></div>);}

function CompetitorCard({x,tc}){
  var _sw=useState(false);var showSW=_sw[0];var setSW=_sw[1];
  var strengths=x.strengths||[];var weaknesses=x.weaknesses||[];
  var hasSW=strengths.length>0||weaknesses.length>0;
  return(
    <div style={{background:"transparent",borderRadius:6,padding:SPACE.lg,marginBottom:SPACE.lg,borderLeft:"3px solid "+(tc[x.threat]||MU),borderBottom:"1px solid "+BD+"40"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:SPACE.sm}}>
        <span style={{fontWeight:700,fontSize:14}}>{x.name}</span>
        <Badge color={tc[x.threat]||MU}>{x.threat}</Badge>
      </div>
      <div style={{fontSize:12,color:DM,marginBottom:SPACE.sm,lineHeight:1.55,maxWidth:"65ch"}}>{x.desc}</div>
      {hasSW&&(
        showSW
          ?<div><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{strengths.map(function(s,j){return <span key={j} style={{fontSize:10,color:GR,background:GR+"18",padding:"2px 6px",borderRadius:BTN_RADIUS}}>+ {s}</span>;})}{weaknesses.map(function(w,j){return <span key={j} style={{fontSize:10,color:RD,background:RD+"18",padding:"2px 6px",borderRadius:BTN_RADIUS}}>- {w}</span>;})}</div><button type="button" onClick={function(){setSW(false);}} style={{fontSize:11,color:MU,background:"none",border:"none",cursor:"pointer",padding:0}}>Hide</button></div>
          :<button type="button" onClick={function(){setSW(true);}} style={{fontSize:11,color:AC,background:"none",border:"1px solid "+AC+"44",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontWeight:600}}>Strengths & weaknesses</button>
      )}
    </div>
  );
}

function TabComp({d,isMobile}){var c=d.competitors||{};var list=c.list||[];var comp5y=c.competitors5y||[];var tc={HIGH:RD,MEDIUM:YL,LOW:GR};var _ad=useState({});var adVisible=_ad[0];var setAd=_ad[1];var toggleAd=function(i){setAd(function(prev){var next={};for(var k in prev)next[k]=prev[k];next[i]=!prev[i];return next;});};var gridCols=isMobile?"1fr":"minmax(0,1fr) minmax(0,1fr)";return(<div><Head title="Market share"/><div style={{display:"grid",gridTemplateColumns:gridCols,gap:SPACE.lg,marginBottom:SPACE.lg}}><BentoCard title="Market share"><PieChart competitors={list} compact={true} large={!isMobile}/><BarChartShare competitors={list}/></BentoCard><BentoCard title="Amount of competitors">{comp5y.length>0?<CompetitorChart5Y competitors5y={comp5y} large={!isMobile} compact={true}/>:<div style={{fontSize:12,color:DM,padding:12}}>No 5-year data</div>}</BentoCard></div><div style={{marginBottom:SPACE.lg}}><BentoCard title="Competitor comparison">{list.length>=2?<SpiderChart competitors={list} large={!isMobile} compact={true}/>:<div style={{fontSize:12,color:DM,padding:12}}>Add at least 2 competitors to compare</div>}</BentoCard></div><Collapsible title="Competitors" defaultOpen={true}><div>{list.map(function(x,i){return <CompetitorCard key={i} x={x} tc={tc}/>;})}<Head title="Market gaps"/><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(c.gaps||[]).map(function(g,i){return <Badge key={i} color={GR}>{g}</Badge>;})}</div></div></Collapsible><Collapsible title="Ad snapshot" defaultOpen={false}>{(list||[]).map(function(x,i){var ads=x.ads||[];if(!ads.length)return null;var open=!!adVisible[i];return(<div key={i} style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:13,fontWeight:700,color:TX,display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i%PIE_COLORS.length]}}/>{x.name}</div><button type="button" onClick={function(){toggleAd(i);}} style={{fontSize:11,color:AC,background:"none",border:"1px solid "+AC+"44",padding:"4px 10px",borderRadius:4,cursor:"pointer"}}>{open?"Hide ads":"Show ads"}</button></div>{open?(<div style={{display:"grid",gridTemplateColumns:ads.length>1?"1fr 1fr":"1fr",gap:8}}>{ads.map(function(ad,j){return(<div key={j} style={{background:CD,borderBottom:"1px solid "+BD+"40",borderRadius:6,padding:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Badge color={BL}>{ad.platform}</Badge><span style={{fontSize:9,color:DM,background:BD+"66",padding:"2px 6px",borderRadius:2}}>{ad.cta}</span></div><div style={{fontSize:13,fontWeight:700,color:TX,lineHeight:1.4,marginBottom:8}}>{'"'+ad.headline+'"'}</div><div style={{fontSize:11,color:AC,lineHeight:1.5,padding:"6px 10px",background:AC+"08",borderLeft:"3px solid "+AC+"44",borderRadius:2}}><span style={{fontSize:9,color:DM,display:"block",marginBottom:2}}>Angle</span>{ad.angle}</div></div>);})}</div>):null}</div>);})}</Collapsible></div>);}

function TabProd({d,isMobile}){var p=d.product||{};var pain=p.painPoints||[];var chans=p.channels||[];var gtm=p.gtm||[];var PP_INIT=3;var CH_INIT=5;var GTM_INIT=3;var _pp=useState(false);var _ch=useState(false);var _gtm=useState(false);var ppShow=_pp[0]?pain:pain.slice(0,PP_INIT);var chShow=_ch[0]?chans:chans.slice(0,CH_INIT);var gtmShow=_gtm[0]?gtm:gtm.slice(0,GTM_INIT);var ppRest=pain.length-PP_INIT;var chRest=chans.length-CH_INIT;var gtmRest=gtm.length-GTM_INIT;var statCols=isMobile?"1fr":"1fr 1fr";return(<div><Head title="Product"/><div style={{display:"grid",gridTemplateColumns:statCols,gap:SPACE.sm,marginBottom:SPACE.lg}}><Stat label="Audience" value={p.audience} expandable={true} maxLength={50}/><Stat label="Size" value={p.audienceSize} expandable={true} maxLength={50}/><Stat label="Price Range" value={p.priceRange}/><Stat label="Suggested" value={p.suggestedPrice} color={GR}/></div><Collapsible title="Pain points" defaultOpen={true}>{ppShow.map(function(x,i){return <div key={i} style={{fontSize:12,color:TX,padding:"10px 12px",marginBottom:6,borderLeft:"3px solid "+RD,borderRadius:4,borderBottom:"1px solid "+BD+"30"}}>{x}</div>;})}{_pp[0]&&ppRest>0?(<button type="button" onClick={function(){_pp[1](false);}} style={{fontSize:11,color:MU,marginTop:8,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button>):<ShowMoreBtn count={ppRest} onClick={function(){_pp[1](true);}} label={ppRest>0?"Show "+ppRest+" more":null}/>}</Collapsible><Collapsible title="Channels" defaultOpen={true}><div style={{marginBottom:8}}><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{chShow.map(function(ch,i){return <Badge key={i} color={BL}>{ch}</Badge>;})}</div>{_ch[0]&&chRest>0?(<button type="button" onClick={function(){_ch[1](false);}} style={{fontSize:11,color:MU,marginTop:8,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button>):<ShowMoreBtn count={chRest} onClick={function(){_ch[1](true);}} label={chRest>0?"Show "+chRest+" more":null}/>}</div></Collapsible><Collapsible title="Go-to-market" defaultOpen={true}>{gtmShow.map(function(s,i){return(<div key={i} style={{display:"flex",gap:8,padding:"10px 12px",marginBottom:6,borderBottom:"1px solid "+BD+"30",borderRadius:4}}><span style={{fontFamily:"monospace",fontSize:10,color:AC,fontWeight:700}}>{String(i+1).padStart(2,"0")}</span><span style={{fontSize:12}}>{s}</span></div>);})}{_gtm[0]&&gtmRest>0?(<button type="button" onClick={function(){_gtm[1](false);}} style={{fontSize:11,color:MU,marginTop:8,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button>):<ShowMoreBtn count={gtmRest} onClick={function(){_gtm[1](true);}} label={gtmRest>0?"Show "+gtmRest+" more":null}/>}</Collapsible></div>);}

function TabAssume({d}){var chain=d.assumptions||[];var cc={HIGH:GR,MEDIUM:YL,LOW:RD};var _exp=useState({});var expanded=_exp[0];var setExp=_exp[1];var toggle=function(i){setExp(function(prev){var next={};for(var k in prev)next[k]=prev[k];next[i]=!prev[i];return next;});};return(<div><Head title="Assumption chain"/>{chain.map(function(s,i){var hasSource=!!s.source;var open=!!expanded[i];return(<div key={i} style={{background:"transparent",borderRadius:6,padding:14,marginBottom:12,borderBottom:"1px solid "+BD+"40"}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{fontFamily:"monospace",fontSize:18,fontWeight:800,color:AC}}>{String(s.step).padStart(2,"0")}</span><Badge color={cc[s.confidence]||YL}>{s.confidence}</Badge><span style={{fontSize:13,color:TX,flex:1}}>{s.assumption}</span><button type="button" onClick={function(){toggle(i);}} style={{fontSize:11,color:AC,background:"none",border:"1px solid "+AC+"44",padding:"4px 10px",borderRadius:4,cursor:"pointer"}}>{open?"Hide details":"Show details"}</button></div>{open?(<div style={{marginTop:10}}><div style={{padding:"8px 12px",background:GR+"10",borderLeft:"3px solid "+GR,borderRadius:2,marginBottom:6,cursor:hasSource?"pointer":"default",transition:"background 0.15s"}} onMouseEnter={function(e){if(hasSource)e.currentTarget.style.background=GR+"20";}} onMouseLeave={function(e){e.currentTarget.style.background=GR+"10";}} onClick={function(){if(hasSource)window.open(s.source,"_blank");}}><div style={{fontSize:10,color:GR,marginBottom:2}}>Verified</div><div style={{fontSize:12}}>{s.verified}</div></div><div style={{fontSize:10,color:DM,textAlign:"center",padding:4}}>{s.logic}</div>{s.supportingData?(<div style={{padding:"8px 12px",background:BL+"10",borderLeft:"3px solid "+BL,borderRadius:2,marginBottom:6}}><div style={{fontSize:10,color:BL,marginBottom:2}}>Supporting data</div><div style={{fontSize:12,color:TX}}>{s.supportingData}</div></div>):null}<div style={{padding:"8px 12px",background:YL+"10",borderLeft:"3px solid "+YL,borderRadius:2}}><div style={{fontSize:10,color:YL,marginBottom:2}}>Assumption</div><div style={{fontSize:12}}>{s.assumption}</div></div></div>):null}</div>);})}</div>);}

function TabLegal({d}){var leg=d.legal||{};var regs=leg.regulations||[];var sc={HIGH:RD,MEDIUM:YL,LOW:GR};var REG_INIT=3;var _reg=useState(false);var _open=useState({});var regExpanded=_reg[0];var setReg=_reg[1];var cardOpen=_open[0];var setCardOpen=_open[1];var regShow=regExpanded?regs:regs.slice(0,REG_INIT);var regRest=regs.length-REG_INIT;var toggleCard=function(i){setCardOpen(function(prev){var next={};for(var k in prev)next[k]=prev[k];next[i]=!prev[i];return next;});};return(<div><div style={{padding:"12px 14px",background:RD+"10",borderBottom:"1px solid "+RD+"33",borderRadius:6,marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><svg width={14} height={14} viewBox="0 0 16 16" fill="none"><path d="M8 1l7 13H1L8 1z" stroke={RD} strokeWidth={1.5} strokeLinejoin="round"/><path d="M8 6v3" stroke={RD} strokeWidth={1.5} strokeLinecap="round"/><circle cx={8} cy={11.5} r={0.75} fill={RD}/></svg><span style={{fontSize:11,fontWeight:700,color:RD}}>Disclaimer</span></div><div style={{fontSize:12,color:MU,lineHeight:1.6}}>This legal overview is a general AI-generated estimate and should not be treated as legal advice. Regulations and requirements vary by jurisdiction, industry segment, and business structure. Always consult a qualified legal professional for your specific situation before making compliance decisions.</div></div><Head title="Regulatory overview"/><Collapsible title="Regulations" defaultOpen={true}>{regShow.map(function(r,i){var hasSource=!!r.source;var open=!!cardOpen[i];var req=r.requirement||"";var fl=(req.split("\n")[0]||"");var oneLine=fl.length>120?fl.slice(0,120)+"…":fl;return(<div key={i} style={{background:"transparent",borderBottom:"1px solid "+BD+"40",borderRadius:6,padding:14,marginBottom:8,borderLeft:"3px solid "+(sc[r.severity]||MU)}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:700,color:TX}}>{r.area}</span><Badge color={sc[r.severity]||MU}>{r.severity}</Badge></div>{open?(<div><div style={{fontSize:12,color:MU,lineHeight:1.6,marginBottom:hasSource?8:0}}>{r.requirement}</div>{hasSource&&<div style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,color:BL,cursor:"pointer",padding:"3px 8px",background:BL+"12",borderRadius:2,border:"1px solid "+BL+"33"}} onClick={function(){window.open(r.source,"_blank");}} onMouseEnter={function(e){e.currentTarget.style.background=BL+"22";}} onMouseLeave={function(e){e.currentTarget.style.background=BL+"12";}}>View source <svg width={9} height={9} viewBox="0 0 12 12" fill="none"><path d="M3.5 1.5h7m0 0v7m0-7L3 9" stroke={BL} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg></div>}<button type="button" onClick={function(){toggleCard(i);}} style={{fontSize:11,color:MU,marginTop:6,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button></div>):(<div><div style={{fontSize:12,color:MU,lineHeight:1.5}}>{oneLine}</div><button type="button" onClick={function(){toggleCard(i);}} style={{fontSize:11,color:AC,marginTop:6,background:"none",border:"none",cursor:"pointer",padding:0}}>Read more</button></div>)}</div>);})}{regExpanded&&regRest>0?(<button type="button" onClick={function(){setReg(false);}} style={{fontSize:11,color:MU,marginBottom:8,background:"none",border:"none",cursor:"pointer",padding:0}}>Show less</button>):<ShowMoreBtn count={regRest} onClick={function(){setReg(true);}} label={regRest>0?"Show all regulations":null}/>}</Collapsible>
{leg.keyTakeaway&&<div style={{marginTop:12}}><Head title="Key takeaway"/><div style={{padding:"12px 14px",background:AC+"10",border:"1px solid "+AC+"33",borderRadius:3,fontSize:12,color:AC,lineHeight:1.6}}>{leg.keyTakeaway}</div></div>}</div>);}

function ResearchLoader({deep}){
  var steps=deep
    ?["Defining research scope…","Scanning market data…","Mapping competitors…","Verifying sources…","Building assumption chain…","Compiling deep report…"]
    :["Scanning market data…","Identifying competitors…","Verifying data points…","Compiling report…"];
  var _idx=useState(0);var idx=_idx[0];var setIdx=_idx[1];
  useEffect(function(){
    var t=setInterval(function(){setIdx(function(i){return i<steps.length-1?i+1:i;});},deep?2800:2200);
    return function(){clearInterval(t);};
  },[steps.length,deep]);
  return(
    <div style={{padding:"48px 24px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:deep?"linear-gradient(135deg,#f97316,#fb923c)":"#1A1A1A",border:"2px solid #f9731640",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 32px #f9731630",animation:"lume-pulse 2s ease-in-out infinite"}}>
        {deep
          ?<svg width={28} height={28} viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#fff" stroke="#fff" strokeWidth={0.5} strokeLinejoin="round"/></svg>
          :<svg width={26} height={26} viewBox="0 0 24 24" fill="none"><circle cx={11} cy={11} r={7} stroke="#f97316" strokeWidth={2}/><path d="M16.5 16.5L21 21" stroke="#f97316" strokeWidth={2} strokeLinecap="round"/></svg>
        }
      </div>
      <div>
        <div style={{fontSize:15,fontWeight:700,color:"#FAFAFA",marginBottom:6}}>{deep?"Deep Research":"Market Research"}</div>
        <div key={idx} style={{fontSize:13,color:"#f97316",fontWeight:500,animation:"lume-fade-in 0.4s ease"}}>{steps[idx]}</div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {[0,1,2].map(function(i){return(
          <span key={i} style={{width:7,height:7,borderRadius:"50%",background:"#f97316",display:"inline-block",animation:"lume-dot 1.4s ease-in-out "+(i*0.16)+"s infinite"}}/>
        );})}
      </div>
    </div>
  );
}

function RunResearchButton({run,loading,idea,deep,canDeep,canRunLive,colors,compact}){
  var BG=colors.BG,BD=colors.BD,AC=colors.AC,CD=colors.CD,TX=colors.TX,DM=colors.DM,BTN_RADIUS=colors.BTN_RADIUS;
  var _h=useState(false);var hover=_h[0];var setHover=_h[1];
  var showTooltip=!canRunLive&&!loading&&hover;
  var disabled=loading||!idea.trim()||(deep&&!canDeep)||!canRunLive;
  var label=compact?(loading?<svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{animation:"spin 1s linear infinite"}}><circle cx={8} cy={8} r={6} stroke={DM} strokeWidth={2} strokeDasharray="20 12"/></svg>:<svg width={16} height={16} viewBox="0 0 16 16" fill="none"><path d="M3 8h7M10 5l3 3-3 3" stroke={loading?DM:canRunLive?BG:DM} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>):(loading?(deep?"Deep research...":"Analyzing..."):"Run research");
  return(
    <span style={{position:"relative",display:"inline-flex"}} onMouseEnter={function(){setHover(true);}} onMouseLeave={function(){setHover(false);}}>
      <button onClick={run} disabled={disabled} style={{padding:compact?"8px 10px":"12px 22px",background:loading?BD:canRunLive?AC:BD,color:loading?DM:canRunLive?BG:DM,border:"none",borderRadius:compact?8:BTN_RADIUS,fontWeight:700,fontSize:12,cursor:loading?"wait":disabled?"default":"pointer",opacity:!idea.trim()?0.5:1,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{label}</button>
      {showTooltip&&(
        <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,padding:"14px 18px",background:CD,border:"1px solid "+BD,borderRadius:6,fontSize:12,color:TX,lineHeight:1.5,width:280,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",pointerEvents:"none",animation:"lume-fade-in 0.2s ease"}}>
          <div style={{position:"absolute",top:-5,right:16,width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid "+BD}}/>
          <div style={{position:"absolute",top:-4,right:16,width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid "+CD}}/>
          <div style={{fontWeight:600,color:AC,marginBottom:4}}>Upgrade to run research</div>
          <div style={{fontSize:11,color:DM}}>Sign in and upgrade to Pro for live AI-powered market research.</div>
        </div>
      )}
    </span>
  );
}

function DeepResearchHelp({canDeep,deepUsed,deepLimit,colors}){
  var DM=colors.DM,AC=colors.AC,BD=colors.BD,CD=colors.CD,TX=colors.TX;
  var _h=useState(false);var hover=_h[0];var setHover=_h[1];
  var tooltipText=canDeep?"Deep research gives a more comprehensive, higher-quality analysis. Uses Claude Opus for deeper insights.":"Deep research requires Pro or Business. Pro: 1/month. Business: 5/month. Upgrade to unlock.";
  return(
    <span style={{position:"relative",display:"inline-flex",alignItems:"center"}} onMouseEnter={function(){setHover(true);}} onMouseLeave={function(){setHover(false);}}>
      <span style={{width:16,height:16,borderRadius:"50%",background:hover?BD+"88":CD,border:"1px solid "+(hover?AC+"44":BD),color:DM,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",cursor:"help",flexShrink:0,transition:"all 0.2s ease"}}>?</span>
      {hover&&(
        <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",marginTop:2,padding:"14px 16px",background:CD,border:"1px solid "+BD,borderRadius:6,fontSize:12,color:TX,lineHeight:1.6,width:340,maxWidth:360,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",overflow:"visible"}}>
          <div style={{marginBottom:canDeep?10:0,whiteSpace:"normal",wordWrap:"break-word"}}>{tooltipText}</div>
          {canDeep&&<div style={{fontSize:11,fontFamily:"monospace",color:AC,fontWeight:700}}>Your quota: {deepUsed} of {deepLimit} used this month</div>}
          <div style={{position:"absolute",top:-5,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid "+CD}}></div>
        </div>
      )}
    </span>
  );
}

function DeepResearchToggle({deep,setDeep,canDeep,deepUsed,deepLimit,colors,compact}){
  var DM=colors.DM,AC=colors.AC,BD=colors.BD,CD=colors.CD,TX=colors.TX,YL=colors.YL;
  var remaining=Math.max(0,deepLimit-deepUsed);
  var quotaColor=remaining===0?YL:DM;
  if(compact){
    return(<div style={{display:"flex",alignItems:"center",gap:4,opacity:canDeep?1:0.5}}>
      <button type="button" role="switch" aria-checked={deep} onClick={function(){if(canDeep)setDeep(!deep);}} disabled={!canDeep} title={canDeep?(deep?"Disable deep research":"Enable deep research"):"Upgrade to unlock deep research"} style={{width:34,height:20,borderRadius:10,background:deep?"linear-gradient(135deg,#f97316,#fb923c)":BD,border:"none",cursor:canDeep?"pointer":"not-allowed",position:"relative",flexShrink:0,transition:"background 0.25s ease",boxShadow:deep?"0 0 8px #f9731640":"none"}}>
        <span style={{position:"absolute",top:2,left:deep?16:2,width:16,height:16,borderRadius:"50%",background:deep?"#fff":"#ccc",boxShadow:deep?"0 1px 4px rgba(249,115,22,0.4)":"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s ease",display:"flex",alignItems:"center",justifyContent:"center"}}>{deep&&<svg width={8} height={8} viewBox="0 0 12 12" fill="none"><path d="M7 1.5L3 7H6.5L5.5 11L10 5H6.5L7 1.5Z" fill="#f97316" strokeLinejoin="round"/></svg>}</span>
      </button>
      <span style={{fontSize:10,fontWeight:600,color:canDeep?(deep?AC:MU):DM,whiteSpace:"nowrap"}}>Deep research</span>
    </div>);
  }
  return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:canDeep?(deep?AC+"18":CD):BD+"22",border:"1px solid "+(deep?AC+"55":BD),borderRadius:BTN_RADIUS,transition:"all 0.2s ease",opacity:canDeep?1:0.7}}><button type="button" role="switch" aria-checked={deep} onClick={function(){if(canDeep)setDeep(!deep);}} disabled={!canDeep} style={{width:42,height:24,borderRadius:12,background:deep?"linear-gradient(135deg,#f97316,#fb923c)":BD,border:"none",cursor:canDeep?"pointer":"not-allowed",position:"relative",flexShrink:0,transition:"background 0.25s ease",boxShadow:deep?"0 0 10px #f9731650":"none"}}><span style={{position:"absolute",top:3,left:deep?21:3,width:18,height:18,borderRadius:"50%",background:deep?"linear-gradient(135deg,#fff5ee,#fff)":"#fff",boxShadow:deep?"0 1px 6px rgba(249,115,22,0.5)":"0 1px 4px rgba(0,0,0,0.3)",transition:"left 0.25s ease, box-shadow 0.25s ease",display:"flex",alignItems:"center",justifyContent:"center"}}>{deep&&<svg width={10} height={10} viewBox="0 0 12 12" fill="none"><path d="M7 1.5L3 7H6.5L5.5 11L10 5H6.5L7 1.5Z" fill="#f97316" strokeLinejoin="round"/></svg>}</span></button><span style={{fontSize:11,fontWeight:600,color:canDeep?(deep?AC:TX):DM}}>Deep research</span>{canDeep&&<span style={{fontSize:10,fontWeight:500,color:quotaColor}}>{remaining} left</span>}<DeepResearchHelp canDeep={canDeep} deepUsed={deepUsed} deepLimit={deepLimit} colors={{DM,AC,BD,CD,TX,YL}}/></div>);
}

export default function App(){
  var ref=useRef(null);
  var _i=useState("");var idea=_i[0];var setIdea=_i[1];
  var _d=useState(null);var data=_d[0];var setData=_d[1];
  var _l=useState(false);var loading=_l[0];var setLoading=_l[1];
  var _e=useState(null);var err=_e[0];var setErr=_e[1];
  var _tier=useState("free");var tier=_tier[0];var setTier=_tier[1];
  var _deep=useState(false);var deep=_deep[0];var setDeep=_deep[1];
  var _usage=useState(null);var usage=_usage[0];var setUsage=_usage[1];
  var _sample=useState(false);var isSampleData=_sample[0];var setIsSampleData=_sample[1];
  var _ideaConfirm=useState(false);var ideaConfirmOpen=_ideaConfirm[0];var setIdeaConfirmOpen=_ideaConfirm[1];
  var router=useRouter();
  function looksLikeIdea(t){var s=(t||"").trim().toLowerCase();if(s.length<10)return false;var words=s.split(/\s+/).filter(Boolean);if(words.length<2)return false;if(/[?]/.test(s))return false;var nonIdea=/^(test|hello|hey|hi|asdf|foo|bar|abc|123|hvad|what|how|why|when|where)\b/i;if(nonIdea.test(s))return false;if(/^\d+$/.test(words.join("")))return false;return true;}
  var {user,session,loading:authLoading}=useAuth();
  var admin=isAdmin(user);
  var canRunLive=!!(user&&(tier==="pro"||tier==="business"||tier==="free"||admin));
  var canDeep=tier==="pro"||tier==="business"||admin;
  var deepLimit=admin?5:tier==="pro"?1:tier==="business"?5:0;
  var deepUsed=usage?.deep_count||0;
  var standardUsed=usage?.standard_count||0;
  var standardLimit=admin?50:tier==="business"?50:tier==="pro"?10:1;
  var quotaExhausted=!admin&&tier==="free"&&standardUsed>=1;
  useEffect(function(){if(session?.access_token){fetch("/api/profile",{headers:{Authorization:"Bearer "+session.access_token}}).then(function(r){return r.json();}).then(function(d){if(d.tier)setTier(d.tier);}).catch(function(){});}},[session]);
  useEffect(function(){if(!user||!session)return;var m=new Date().toISOString().slice(0,7);supabase.from("usage").select("standard_count, deep_count").eq("user_id",user.id).eq("month",m).maybeSingle().then(function(r){setUsage(r.data);}).catch(function(){});},[user,session]);
  useEffect(function(){if(ref.current)ref.current.focus();},[data,loading]);

  function tryWithSample(ideaOverride){
    var t=(ideaOverride||idea).trim();
    if(!t)return;
    if(t.length<10){setErr("Please describe your business idea in a few words (e.g. 'Meal kits in Denmark')");return;}
    if(t.split(/\s+/).filter(Boolean).length<2){setErr("Please describe your idea with at least 2 words (e.g. 'Dog food EU')");return;}
    setErr(null);setData(getMockData(t));setIsSampleData(true);
  }

  function doRun(){
    if(!idea.trim()||loading)return;
    if(deep&&!canDeep)return;
    var t=idea.trim();
    if(t.length<10){setErr("Please describe your business idea in a few words (e.g. 'Meal kits in Denmark')");return;}
    if(t.split(/\s+/).filter(Boolean).length<2){setErr("Please describe your idea with at least 2 words (e.g. 'Dog food EU')");return;}
    setLoading(true);setErr(null);setData(null);setIsSampleData(false);
    var headers={"Content-Type":"application/json"};
    if(session?.access_token)headers["Authorization"]="Bearer "+session.access_token;
    fetch("/api/analyze",{method:"POST",headers:headers,body:JSON.stringify({idea:idea.trim(),deep:deep&&canDeep})})
    .then(function(r){return r.json();})
    .then(function(res){
      if(res.error){
        if(res.upgrade){router.push("/pricing");return;}
        throw new Error(res.error);
      }
      setData(res);
      if(user){var m=new Date().toISOString().slice(0,7);supabase.from("usage").select("standard_count, deep_count").eq("user_id",user.id).eq("month",m).maybeSingle().then(function(r){setUsage(r.data);});}
    })
    .catch(function(e){setErr(e.message);})
    .finally(function(){setLoading(false);});}

  function run(){
    if(!idea.trim()||loading)return;
    if(deep&&!canDeep)return;
    if(!user){router.push("/pricing");return;}
    if(quotaExhausted){router.push("/pricing");return;}
    var t=idea.trim();
    if(t.length<10){setErr("Please describe your business idea in a few words (e.g. 'Meal kits in Denmark')");return;}
    if(t.split(/\s+/).filter(Boolean).length<2){setErr("Please describe your idea with at least 2 words (e.g. 'Dog food EU')");return;}
    if(!looksLikeIdea(t)){setIdeaConfirmOpen(true);return;}
    doRun();
  }

  var isMobile=useIsMobile();
  var hasResults=!!(data||loading||err);
  var sm=data?(data.summary||{}):{};

  var searchBar=(<div style={{position:"relative",width:"100%",background:CD,border:"1px solid "+BD,borderRadius:BTN_RADIUS,display:"flex",flexDirection:isMobile?"column":"row",alignItems:"stretch"}}>
    <input ref={ref} value={idea} onChange={function(e){var v=e.target.value;if(v.length<=250)setIdea(v);}} onKeyDown={function(e){if(e.key==="Enter")run();}} placeholder="Describe your business idea..." disabled={loading} maxLength={250} style={{flex:1,minWidth:0,padding:isMobile?"16px 14px":"14px 8px 14px 18px",background:"transparent",border:"none",color:TX,fontSize:isMobile?16:14,boxSizing:"border-box",outline:"none",minHeight:isMobile?48:undefined}}/>
    <div style={{display:"flex",alignItems:"center",gap:isMobile?10:8,padding:isMobile?"12px 14px":"0 10px 0 0",flexShrink:0,minHeight:isMobile?48:undefined,borderTop:isMobile?"1px solid "+BD:undefined}}>
      <span style={{fontSize:10,color:DM,whiteSpace:"nowrap"}}>{idea.length}/250</span>
      {!isMobile&&<div style={{width:1,height:20,background:BD,flexShrink:0}}/>}
      <DeepResearchToggle deep={deep} setDeep={setDeep} canDeep={canDeep} deepUsed={deepUsed} deepLimit={deepLimit} colors={{DM,AC,BD,CD,TX,YL}} compact={true}/>
      <RunResearchButton run={run} loading={loading} idea={idea} deep={deep} canDeep={canDeep} canRunLive={canRunLive&&!quotaExhausted} colors={{BG,BD,AC,CD,TX,DM,BTN_RADIUS}} compact={true}/>
    </div>
  </div>);

  return(
    <>
      {hasResults?(
        <div style={{padding:isMobile?"12px 16px":"16px 24px",borderBottom:"1px solid "+BD+"40"}}>
          <div style={{maxWidth:CONTENT_MAX_WIDTH,margin:"0 auto"}}>{searchBar}</div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:isMobile?"70vh":"75vh",padding:isMobile?"20px 16px":"32px 24px"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:isMobile?24:32}}>
            <LumeLogo size={isMobile?44:56}/>
            <div style={{fontWeight:800,fontSize:isMobile?24:28,letterSpacing:0.5,color:TX,textTransform:"uppercase",marginTop:12}}>Lume</div>
            <div style={{fontSize:13,color:DM,marginTop:6}}>Market research engine</div>
          </div>
          <div style={{width:"100%",maxWidth:640}}>{searchBar}</div>
          <div style={{marginTop:28,display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {["Meal kits Denmark","Dog food EU","SaaS accounting"].map(function(ex,i){return(<button key={i} onClick={function(){setIdea(ex);tryWithSample(ex);}} style={{padding:"10px 18px",background:CD,border:"1px solid "+BD,borderRadius:BTN_RADIUS,fontSize:12,fontWeight:600,color:MU,cursor:"pointer",transition:"all 0.15s"}}>{ex}</button>);})}
          </div>
          {!user&&<div style={{marginTop:20,fontSize:12,color:DM,textAlign:"center"}}>Sign up free to run your first analysis, or explore sample data above.</div>}
          {user&&tier==="free"&&!quotaExhausted&&<div style={{marginTop:20,fontSize:12,color:GR,textAlign:"center"}}>You have 1 free analysis — try it out!</div>}
          {user&&quotaExhausted&&<div style={{marginTop:20,fontSize:12,color:AC,textAlign:"center"}}>Free analysis used. <span onClick={function(){router.push("/pricing");}} style={{textDecoration:"underline",cursor:"pointer"}}>Upgrade to Pro</span> for more research.</div>}
        </div>
      )}
      {ideaConfirmOpen&&(
        <div onClick={function(){setIdeaConfirmOpen(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={function(e){e.stopPropagation();}} style={{width:"min(420px,92vw)",background:PN,border:"1px solid "+BD,borderRadius:CARD_RADIUS,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{padding:"20px 24px"}}>
              <div style={{fontSize:14,fontWeight:700,color:TX,marginBottom:8}}>Doesn&apos;t look like a business idea</div>
              <div style={{fontSize:12,color:MU,lineHeight:1.5,marginBottom:16}}>Is &quot;{idea.trim().slice(0,60)}{idea.trim().length>60?"…":""}&quot; an idea or product you want to research?</div>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={function(){setIdeaConfirmOpen(false);}} style={{padding:"8px 16px",background:CD,border:"1px solid "+BD,borderRadius:BTN_RADIUS,fontWeight:600,fontSize:12,color:MU,cursor:"pointer"}}>No, cancel</button>
                <button onClick={function(){setIdeaConfirmOpen(false);doRun();}} style={{padding:"8px 16px",background:AC,border:"none",borderRadius:BTN_RADIUS,fontWeight:700,fontSize:12,color:BG,cursor:"pointer"}}>Yes, continue</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {loading&&<ResearchLoader deep={deep}/>}
      {err&&<div style={{margin:20,padding:18,background:RD+"15",border:"1px solid "+RD+"44",borderRadius:BTN_RADIUS,fontSize:12,color:RD,maxWidth:CONTENT_MAX_WIDTH,marginLeft:"auto",marginRight:"auto"}}>{err}</div>}
      {data&&!loading&&<AnalysisResultView data={data} isSampleData={isSampleData}/>}
    </>
  );
}

var TABS=["market","product","competitor","assumptions","legal"];
function TabBar({active,onChange,isMobile}){
  return(<div className={isMobile?"lume-tabs-scroll":undefined} style={{display:"flex",gap:SPACE.sm,padding:isMobile?SPACE.sm+"px "+SPACE.md+"px":SPACE.md+"px "+SPACE.xl+"px",borderTop:"1px solid "+BD+"40",borderBottom:"1px solid "+BD+"40",flexWrap:"nowrap",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
    {TABS.map(function(t){var isActive=active===t;return(<button key={t} type="button" onClick={function(){onChange(t);}} style={{padding:isMobile?"10px 14px":SPACE.sm+"px "+SPACE.lg+"px",fontSize:12,fontWeight:600,color:isActive?TX:MU,background:isActive?AC+"18":"transparent",border:"none",borderBottom:isActive?"2px solid "+AC:"2px solid transparent",borderRadius:BTN_RADIUS,cursor:"pointer",textTransform:"capitalize",marginBottom:0,flexShrink:0}}>{t}</button>);})}
  </div>);
}

function ConfidenceGauge({value}){
  var pct=Math.min(100,Math.max(0,Number(value)||0));
  var color=pct>60?GR:YL;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:SPACE.xs}}><div style={{width:64,height:8,borderRadius:4,background:BD+"80",overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:color,borderRadius:4,transition:"width 0.3s ease"}}/></div><div style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:color}}>{pct+"%"}</div><div style={{fontSize:9,fontFamily:"monospace",color:DM}}>CONFIDENCE</div></div>);
}

export function AnalysisResultView({data,isSampleData}){
  var isMobile=useIsMobile();
  var _tab=useState("market");var activeTab=_tab[0];var setActiveTab=_tab[1];
  var sm=data?(data.summary||{}):{};
  var vc={"HIGH POTENTIAL":GR,MODERATE:YL,RISKY:RD,NICHE:CN};
  var tabContent={market:<TabMarket d={data} isMobile={isMobile}/>,product:<TabProd d={data} isMobile={isMobile}/>,competitor:<TabComp d={data} isMobile={isMobile}/>,assumptions:<TabAssume d={data}/>,legal:<TabLegal d={data}/>};
  return(<div style={{maxWidth:CONTENT_MAX_WIDTH,margin:"0 auto",padding:isMobile?SPACE.md:SPACE.xl,display:"flex",flexDirection:"column"}}>
    <div style={{paddingBottom:0}}>
      <BentoCard title="Summary" span="span 1">
        <div style={{display:"flex",alignItems:"flex-start",gap:isMobile?SPACE.md:SPACE.xl,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:0,maxWidth:"65ch"}}>
            <div style={{fontWeight:800,fontSize:isMobile?18:22,letterSpacing:"-0.02em",marginBottom:SPACE.sm}}>{sm.title||"Results"}</div>
            <div style={{fontSize:13,color:MU,lineHeight:1.55}}>{sm.oneLiner}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:SPACE.sm,flexWrap:"wrap"}}>
            {isSampleData&&<Badge color={CN}>Sample data</Badge>}
            {sm.verdict&&<Badge color={vc[sm.verdict]||MU}>{sm.verdict}</Badge>}
            {sm.confidence!=null&&<ConfidenceGauge value={sm.confidence}/>}
          </div>
        </div>
      </BentoCard>
    </div>
    <TabBar active={activeTab} onChange={setActiveTab} isMobile={isMobile}/>
    <div style={{paddingTop:isMobile?SPACE.md:SPACE.lg}}>
      <BentoCard title={activeTab.charAt(0).toUpperCase()+activeTab.slice(1)}>{tabContent[activeTab]}</BentoCard>
    </div>
  </div>);
}
