"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import {
  FRAME_TYPES,
  PART_INFO,
  computeGeometry,
  craneLabel,
  craneNote,
  craneSpansFor,
  mezzArea,
  mezzLabel,
  mezzNote,
  mezzSpansFor,
  toggleCraneSpan,
  toggleMezzSpan,
  type Config,
  type Features,
  type Geometry,
  type MezzSide,
} from "@/components/frames3d/frames";
import {
  OPENING_KINDS,
  WALLS,
  defaultOpenings,
  isGable,
  type ResolvedOpening,
  type WallId,
} from "@/components/frames3d/openings";
import { useEntrances } from "@/components/frames3d/useEntrances";
import EntranceControls from "./EntranceControls";
import WallElevation from "./WallElevation";

const VW=920,VH=420,GY=278,MX=460,CW=18,RD=14,CLW=9;

type Roof="pitched"|"mono";
interface Lbl{id:string;px:number;py:number;tx:number;ty:number;text:string;detail:string;cat:"structure"|"roofing"|"product";anchor?:"start"|"middle"|"end";}

const FEAT=[
  {id:"mezzanine",label:"Mezzanine Floor",icon:"▬",color:"#7C3AED",products:["Mezzanine Beam Anchor Bolts","Grating Fasteners","Deck Screws","Handrail Base Plate Bolts","Stair Stringer Bolts"]},
  {id:"crane",label:"EOT Crane Rail",icon:"⊤",color:"#C026D3",products:["Vibration-Rated SSR Clips","Crane Bracket Bolts","Anti-Vibration Fasteners"]},
  {id:"skylight",label:"Skylight Strips",icon:"◌",color:"#0EA5E9",products:["Skylight Foam Closers","Skylight Fasteners"]},
  {id:"insulation",label:"Roof Insulation",icon:"≡",color:"#10B981",products:["Insulated Ridge Closers","Insulation Valley Strips"]},
  {id:"canopy",label:"Eave Canopy",icon:"⊓",color:"#8B5CF6",products:["Canopy SSR Clips","Eave Gutter Brackets"]},
  {id:"ventilator",label:"Ridge Ventilator",icon:"△",color:"#EF4444",products:["Ridge Vent Foam Closers","Ventilator Fasteners"]},
  {id:"valley",label:"Valley Gutter",icon:"∨",color:"#0369A1",products:["Valley Gutter Brackets","Valley Foam Closers"]},
  {id:"rcc",label:"RCC Columns",icon:"▒",color:"#78716C",products:["Column Base Plate Bolts","Anchor Bolts","RCC Interface Fasteners"]},
];
type Feat=Record<string,boolean>;
const DEF_FEAT:Feat={mezzanine:false,crane:false,skylight:false,insulation:false,canopy:false,ventilator:false,valley:false,rcc:false};

interface Preset{id:string;name:string;sub:string;practical:string;width:number;eave:number;pitch:number;spans:1|2|3;roof:Roof;feat:Partial<Feat>;desc:string;}
const PRESETS:Preset[]=[
  {id:"cs-p",name:"Clear Span",sub:"Pitched Roof",practical:"6m – 70m",width:40,eave:7,pitch:10,spans:1,roof:"pitched",feat:{},desc:"Single bay with no intermediate columns. Symmetric pitched roof — the most common PEB frame for warehouses and hangars."},
  {id:"cs-m",name:"Clear Span",sub:"Mono Slope",practical:"3m – 18m",width:12,eave:7,pitch:10,spans:1,roof:"mono",feat:{},desc:"Single-slope roof draining to one side. Ideal for lean-to sheds, loading dock covers and small industrial buildings."},
  {id:"ms2-p",name:"Multi Span MS-2",sub:"Pitched Roof",practical:"24m – 45m",width:36,eave:7,pitch:10,spans:2,roof:"pitched",feat:{},desc:"Two bays with one intermediate column. Two mirrored pitched spans — efficient for medium to large warehouses."},
  {id:"ms2-m",name:"Multi Span MS-2",sub:"Mono Slope",practical:"20m – 35m",width:28,eave:7,pitch:8,spans:2,roof:"mono",feat:{},desc:"Two mono-slope bays with one intermediate column. Used for loading yards and large industrial terminals."},
  {id:"ms3-p",name:"Multi Span MS-3",sub:"Pitched Roof",practical:"36m – 72m",width:54,eave:7,pitch:10,spans:3,roof:"pitched",feat:{},desc:"Three bays with two intermediate columns. Most economical for very wide industrial buildings up to 72m."},
  {id:"ms3-m",name:"Multi Span MS-3",sub:"Mono + Valley Gutter",practical:"24m – 60m",width:42,eave:7,pitch:8,spans:3,roof:"mono",feat:{valley:true},desc:"Three mono-slope bays with valley gutters at intermediate columns. Suited for large-footprint factories."},
  {id:"ms2-cr",name:"MS-2 + Crane",sub:"EOT Crane & Mezzanine",practical:"24m – 45m",width:36,eave:10,pitch:10,spans:2,roof:"pitched",feat:{crane:true,mezzanine:true},desc:"Heavy industrial frame: EOT crane rail in the first bay, mezzanine floor in the second. Requires vibration-rated fasteners."},
  {id:"ss-rcc",name:"Single Span",sub:"RCC Column System",practical:"5m – 25m",width:15,eave:5,pitch:8,spans:1,roof:"pitched",feat:{rcc:true},desc:"Steel rafter system on RCC (reinforced concrete) columns — common for extensions on existing concrete structures."},
];

const toW=(w:number)=>100+((w-10)/60)*200;
const toH=(e:number)=>72+((e-4)/8)*118;

function geo(wM:number,eM:number,pd:number,sp:number,rf:Roof){
  const hw=toW(wM),eh=toH(eM),LX=MX-hw,RX=MX+hw,eY=GY-eh,spW=hw*2/sp;
  const rp=Math.min((spW/2)*Math.tan(pd*Math.PI/180),eY-14),aY=eY-rp;
  const dp=Math.min(hw*2*Math.tan(pd*Math.PI/180)*0.6,50);
  const cXs=Array.from({length:sp+1},(_,i)=>LX+spW*i);
  const cTs:[number,number][]=cXs.map((_,i)=>rf==="pitched"?[cXs[i],eY]:[cXs[i],eY+(dp/sp)*i]);
  let pts=`${LX},${GY} `,rPts=`${LX},${cTs[0][1]} `;
  if(rf==="pitched"){pts+=`${LX},${eY} `;for(let i=0;i<sp;i++){const aX=LX+spW*i+spW/2;pts+=`${aX},${aY} ${LX+spW*(i+1)},${eY} `;rPts+=`${aX},${aY} ${LX+spW*(i+1)},${eY} `;}}
  else cTs.forEach(([cx,cy])=>{pts+=`${cx},${cy} `;rPts+=`${cx},${cy} `;});
  pts+=`${RX},${GY}`;
  const rafs:[number,number,number,number][]=[];
  for(let i=0;i<sp;i++){
    if(rf==="pitched"){const sL=LX+spW*i,sR=sL+spW,aX=(sL+sR)/2;rafs.push([sL,eY,aX,aY],[sR,eY,aX,aY]);}
    else{const[x1,y1]=cTs[i],[x2,y2]=cTs[i+1];rafs.push([x1,y1,x2,y2]);}
  }
  const ridgeM=rf==="pitched"?+((wM/sp/2)*Math.tan(pd*Math.PI/180)).toFixed(1):+(wM*Math.tan(pd*Math.PI/180)).toFixed(1);
  return{LX,RX,eY,aY,spW,dp,cXs,cTs,pts,rPts,rafs,ridgeM,eh,hw,sp,rf};
}
type G=ReturnType<typeof geo>;

function mkLabels(g:G,ft:Feat):Lbl[]{
  const{LX,RX,eY,aY,cXs,cTs,spW,hw,sp,rf}=g;
  const ls:Lbl[]=[];
  const bw=hw*2;
  // Roof sheeting
  if(rf==="pitched"){const rx=LX+spW*.32,ry=eY+(aY-eY)*.4;ls.push({id:"sht",px:rx,py:ry,tx:rx+52,ty:aY-26,text:"Roof Sheeting",detail:"Metal cladding panels (trapezoidal or SSR) spanning across Z/C purlins — the primary weatherproofing layer.",cat:"roofing"});}
  else{const rx=LX+bw*.45,ry=cTs[0][1]-3;ls.push({id:"sht",px:rx,py:ry,tx:rx+44,ty:ry-28,text:"Roof Sheeting",detail:"Metal cladding on mono-slope roof, draining to the lower eave.",cat:"roofing"});}
  // Steel Rafter
  const rpx=LX+spW*.26,rpy=eY+(aY-eY)*.46;
  ls.push({id:"raf",px:rpx,py:rpy,tx:Math.max(68,rpx-62),ty:rpy-24,text:"Steel Rafter",detail:"Haunched built-up I-section rafter — primary inclined load-carrying member from column top to ridge.",cat:"structure"});
  // Side Cladding
  const cy=eY+(GY-eY)*.55;
  ls.push({id:"cld",px:LX-CLW/2,py:cy,tx:LX+22,ty:cy+36,text:"Side Cladding",detail:"Profiled metal sheeting on outer wall from eave to FFL, fixed to wall girts.",cat:"roofing"});
  // Steel Column / RCC Column
  const colY=GY-(GY-eY)*.38;
  ft.rcc
    ?ls.push({id:"col",px:RX+CLW,py:colY,tx:RX+CLW+5,ty:colY,text:"R.C.C. Column",detail:"Reinforced concrete column supporting the steel rafter — common in extensions on existing RCC structures.",cat:"structure",anchor:"start"})
    :ls.push({id:"col",px:RX+CLW,py:colY,tx:RX+CLW+5,ty:colY,text:"Steel Column",detail:"Tapered built-up I-section primary column — transfers all roof and wall loads to foundations.",cat:"structure",anchor:"start"});
  // Intermediate column
  if(sp>1){const ix=cXs[1],iy=cTs[1][1]+(GY-cTs[1][1])*.62;ls.push({id:"ic",px:ix,py:iy,tx:ix+13,ty:iy+26,text:"Intermediate Steel Column",detail:"Shared interior column between adjacent bays — carries rafters from both sides.",cat:"structure",anchor:"start"});}
  return ls;
}

function prods(rf:Roof,sp:number,ft:Feat,doorCount=0):string[]{
  const b=rf==="pitched"?["Fixed SSR Clips","Sliding SSR Clips","Ridge Foam Closers","Eave Foam Closers"]:["Sliding SSR Clips","Eave Foam Closers","Hip Closers"];
  if(sp>1&&rf==="pitched")b.push("Valley Foam Closers");
  b.push("Structural Fasteners","Self-Drilling Screws");
  FEAT.forEach(f=>{if(ft[f.id])b.push(...f.products);});
  if(doorCount>0)b.push(...PART_INFO.door.products);
  return Array.from(new Set(b));
}




export default function RoofExplorer(){
  const[eM,setEM]=useState(7),[wM,setWM]=useState(40),[pitch,setPitch]=useState(10);
  const[spans,setSpans]=useState<1|2|3>(1),[roof,setRoof]=useState<Roof>("pitched");
  const[ft,setFt]=useState<Feat>(DEF_FEAT),[preset,setPreset]=useState("cs-p"),[aId,setAId]=useState<string|null>(null);
  const[bays,setBays]=useState(FRAME_TYPES[0].bays),[mezzSide,setMezzSide]=useState<MezzSide>("right"),[mezzSpans,setMezzSpans]=useState<number[]|undefined>(),[craneSpans,setCraneSpans]=useState<number[]|undefined>(),[view,setView]=useState<"section"|WallId>("section");
  const G=useMemo(()=>geo(wM,eM,pitch,spans,roof),[wM,eM,pitch,spans,roof]);
  const baySp=(FRAME_TYPES.find(t=>t.id===preset)??FRAME_TYPES[0]).baySpacing;
  // Real-metre building model shared with the 3D explorer: drives entrances and the mezzanine.
  const cfg:Config=useMemo(()=>({width:wM,eave:eM,pitch,spans,bays,baySpacing:baySp,roof,features:{...DEF_FEAT,...ft} as Features,mezzSide,mezzSpans,craneSpans}),[wM,eM,pitch,spans,bays,baySp,roof,ft,mezzSide,mezzSpans,craneSpans]);
  const G3=useMemo(()=>computeGeometry(cfg),[cfg]);
  const ent=useEntrances(G3,defaultOpenings({...FRAME_TYPES[0],width:PRESETS[0].width}));
  const lbls=useMemo(()=>mkLabels(G,ft),[G,ft]);
  const tog=(id:string|null)=>{setAId(p=>p===id?null:id);ent.setSelId(null);};
  const apply=(p:Preset)=>{
    const t=FRAME_TYPES.find(x=>x.id===p.id)??FRAME_TYPES[0];
    setWM(p.width);setEM(p.eave);setPitch(p.pitch);setSpans(p.spans);setRoof(p.roof);setFt({...DEF_FEAT,...p.feat} as Feat);setPreset(p.id);setAId(null);
    setBays(t.bays);setMezzSide("right");setMezzSpans(undefined);setCraneSpans(undefined);
    ent.reset(defaultOpenings({...t,width:p.width,spans:p.spans,features:p.feat as Features}));
  };
  const togF=(id:string)=>{id==="crane"&&!ft.crane?setFt(p=>({...p,crane:true,mezzanine:true})):setFt(p=>({...p,[id]:!p[id]}));setAId(null);};
  const lInfo=useMemo(()=>{if(!aId)return null;const g=lbls.find(l=>l.id===aId);if(g)return{text:g.text,detail:g.detail,cat:g.cat};return null;},[aId,lbls]);
  const enFt=FEAT.filter(f=>ft[f.id]);
  const pr=`1:${Math.round(1/Math.tan(pitch*Math.PI/180))}`;
  const cur=PRESETS.find(p=>p.id===preset)!;
  const mzArea=mezzArea(G3);
  const mzPicked=mezzSpansFor(spans,mezzSpans);
  const selDoor=ent.resolved.find(d=>d.id===ent.selId)??null;
  const pickDoor=(id:string)=>{setAId(null);ent.setSelId(ent.selId===id?null:id);};
  const VIEWS:{id:"section"|WallId;label:string}[]=[{id:"section",label:"Section"},...WALLS.map(w=>({id:w.id as WallId,label:w.label}))];
  return(
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white" id="roof-explorer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.span initial={{opacity:0,y:-10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="inline-block bg-brand-orange/10 text-brand-orange font-semibold text-sm px-4 py-1.5 rounded-full mb-4">Interactive Building Configurator</motion.span>
          <motion.h2 initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.1}} className="text-3xl sm:text-4xl font-bold text-brand-blue mb-3">All 8 PEB Frame Types — Engineering Diagrams</motion.h2>
          <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:.2}} className="text-slate-500 max-w-2xl mx-auto">Select a frame type. Adjust dimensions with sliders. Add crane rails, skylights, mezzanines. Click any label to see which Infinity Fabtech products are needed.</motion.p>
        </div>
        {/* 8 Preset cards */}
        <div className="mb-7">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Select Frame Type</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {PRESETS.map(p=>{
              const pg=geo(p.width,p.eave,p.pitch,p.spans,p.roof);
              const on=preset===p.id;
              return(
                <motion.button key={p.id} whileTap={{scale:.93}} onClick={()=>apply(p)} className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${on?"border-brand-orange shadow-lg shadow-brand-orange/25":"border-slate-200 hover:border-slate-300"}`}>
                  <div className={on?"bg-brand-orange/5":"bg-white"}>
                    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{height:52}}>
                      <rect width={VW} height={VH} fill={on?"#FFF7F0":"#fff"} />
                      <rect x={0} y={GY} width={VW} height={50} fill="#EEE" />
                      <line x1={0} y1={GY} x2={VW} y2={GY} stroke="#666" strokeWidth="2" />
                      <polygon points={pg.pts} fill={on?"#FFF0E8":"#F5F9FF"} opacity=".9" />
                      <polyline points={pg.rPts} fill="none" stroke="#00ACC1" strokeWidth="3.5" strokeDasharray="8,5" />
                      <rect x={pg.LX-CLW} y={pg.cTs[0][1]} width={CLW} height={GY-pg.cTs[0][1]} fill="#2E7D32" />
                      <rect x={pg.RX} y={pg.cTs[pg.cTs.length-1][1]} width={CLW} height={GY-pg.cTs[pg.cTs.length-1][1]} fill="#2E7D32" />
                      {pg.cXs.map((cx,i)=>{const[,yT]=pg.cTs[i];const isO=i===0||i===pg.sp;return p.feat.rcc&&isO?<rect key={i} x={cx-18} y={yT} width={36} height={GY-yT} fill="none" stroke="#555" strokeWidth="3" strokeDasharray="6,3" />:<rect key={i} x={cx-CW/2} y={yT} width={CW} height={GY-yT} fill={on?"#E05C00":"#CC0000"} />;}) }
                      {pg.rafs.map(([x1,y1,x2,y2],i)=><polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x2},${y2+RD} ${x1},${y1+RD}`} fill={on?"#E05C00":"#CC0000"} />)}
                      {p.feat.crane&&pg.cXs.length>1&&<rect x={pg.LX+CW/2} y={pg.eY+(GY-pg.eY)*.30} width={pg.cXs[1]-pg.LX-CW} height={9} fill="#C026D3" opacity=".9" rx="1" />}
                      {p.feat.mezzanine&&pg.cXs.length>1&&<rect x={pg.cXs[pg.cXs.length-2]+CW/2} y={pg.eY+(GY-pg.eY)*.54} width={pg.RX-pg.cXs[pg.cXs.length-2]-CW} height={9} fill="#7C3AED" opacity=".9" rx="1" />}
                      {p.feat.valley&&pg.cXs.slice(1,-1).map((vx,vi)=><polygon key={vi} points={`${vx-12},${pg.cTs[vi+1][1]-6} ${vx},${pg.cTs[vi+1][1]+10} ${vx+12},${pg.cTs[vi+1][1]-6}`} fill="#0369A1" opacity=".85" />)}
                    </svg>
                  </div>
                  <div className={`px-1.5 py-1.5 ${on?"bg-brand-orange/8":""}`}>
                    <div className={`text-[8.5px] font-bold truncate ${on?"text-brand-orange":"text-slate-700"}`}>{p.name}</div>
                    <div className={`text-[7.5px] truncate ${on?"text-brand-orange/70":"text-slate-400"}`}>{p.sub}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="grid lg:grid-cols-[1fr_296px] gap-5 items-start">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-4 py-3" role="tablist" aria-label="Drawing view">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">View</span>
              {VIEWS.map(v=><button key={v.id} role="tab" aria-selected={view===v.id} onClick={()=>setView(v.id)} className={`rounded-lg border px-3 py-1 text-[11px] font-bold transition-all ${view===v.id?"border-brand-orange bg-brand-orange text-white":"border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{v.label}</button>)}
              <span className="ml-auto text-[10px] italic text-slate-400">{view==="section"?"Cross-section — doors shown dashed":"Elevation from outside — click a door"}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={`${preset}-${view}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}} className="p-3">
                {view==="section"
                  ?<CrossSvg G={G} G3={G3} lbls={lbls} aId={aId} tog={tog} ft={ft} cur={cur} doors={ent.resolved} selId={ent.selId} onPickDoor={pickDoor} />
                  :<WallElevation g={G3} wall={view} doors={ent.resolved} selId={ent.selId} onPick={pickDoor} />}
              </motion.div>
            </AnimatePresence>
            {(
              <div className="border-t border-slate-100 p-5 bg-slate-50/70">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-5">
                  <Slider label="Eave Height" value={eM} min={4} max={12} step={.5} unit="m" color="#B91C1C" onChange={v=>{setEM(v);setAId(null);}} />
                  <Slider label="Building Width" value={wM} min={10} max={70} step={5} unit="m" color="#991B1B" onChange={v=>{setWM(v);setAId(null);}} />
                  <Slider label="Roof Pitch" value={pitch} min={3} max={25} step={1} unit="°" color="#B91C1C" onChange={v=>{setPitch(v);setAId(null);}} />
                  <Slider label="Number of Bays" value={bays} min={2} max={10} step={1} unit="" color="#991B1B" onChange={v=>{setBays(v);setAId(null);}} />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-600">Spans</span>
                      <div className="flex gap-1">{([1,2,3] as (1|2|3)[]).map(n=><button key={n} onClick={()=>{setSpans(n);setAId(null);}} className={`w-9 h-8 rounded-lg text-xs font-bold border transition-all ${spans===n?"bg-brand-blue text-white border-brand-blue":"bg-white border-slate-200 text-slate-600"}`}>{n}</button>)}</div>
                    </div>
                    <div className="flex gap-2">{([["pitched","Pitched ▲"],["mono","Mono ⟍"]] as [Roof,string][]).map(([rt,lb])=><button key={rt} onClick={()=>{setRoof(rt);setAId(null);}} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${roof===rt?"bg-brand-orange text-white border-brand-orange":"bg-white border-slate-200 text-slate-600"}`}>{lb}</button>)}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Add / Remove Components</span><button onClick={()=>{setFt(DEF_FEAT);setAId(null);}} className="text-[10px] text-slate-400 hover:text-slate-600 underline">Reset</button></div>
                  <div className="flex flex-wrap gap-2">
                    {FEAT.map(f=>{const on=ft[f.id];return(
                      <motion.button key={f.id} whileTap={{scale:.93}} onClick={()=>togF(f.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${on?"text-white border-transparent shadow-sm":"bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`} style={on?{background:f.color,borderColor:f.color}:undefined}>
                        <span>{f.icon}</span>{on?<><Minus size={10} className="inline"/> {f.label}</>:<><Plus size={10} className="inline"/> {f.label}</>}
                      </motion.button>
                    );})}
                  </div>
                  {ft.crane&&<div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <span className="text-xs font-semibold text-slate-500">EOT crane in</span>
                    {spans===1
                      ?<span className="rounded-md px-2.5 py-1 text-[11px] font-bold text-white" style={{background:"#C026D3"}}>Full Span</span>
                      :<SpanChips spans={spans} picked={craneSpansFor(spans,craneSpans)} color="#C026D3" onToggle={i=>{setCraneSpans(toggleCraneSpan(spans,craneSpans,i));setAId(null);}} onAll={()=>{setCraneSpans(Array.from({length:spans},(_,i)=>i));setAId(null);}} />}
                    {G3.cranes.length>0&&<span className="ml-auto text-[11px] text-slate-400">{craneNote(G3)}{spans===1&&" · the bridge spans column to column"}</span>}
                  </div>}
                  {ft.mezzanine&&<div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <span className="text-xs font-semibold text-slate-500">{spans===1?"Mezzanine over the":"Mezzanine in"}</span>
                    {spans===1
                      ?(["left","right","full"] as MezzSide[]).map(sd=><button key={sd} aria-pressed={mezzSide===sd} onClick={()=>{setMezzSide(sd);setAId(null);}} className={`rounded-md border px-2.5 py-1 text-[11px] font-bold transition-all ${mezzSide===sd?"border-transparent text-white":"border-slate-200 text-slate-600 hover:border-slate-300"}`} style={mezzSide===sd?{background:"#7C3AED"}:undefined}>{sd==="full"?"Full Width":`${sd==="left"?"Left":"Right"} Half`}</button>)
                      :<SpanChips spans={spans} picked={mzPicked} color="#7C3AED" onToggle={i=>{setMezzSpans(toggleMezzSpan(spans,mezzSpans,i));setAId(null);}} onAll={()=>{setMezzSpans(Array.from({length:spans},(_,i)=>i));setAId(null);}} />}
                    {G3.mezzanines.length>0&&<span className="ml-auto text-[11px] text-slate-400">{mezzNote(G3,spans,mezzSide)}</span>}
                  </div>}
                </div>
                <div className="mt-5"><EntranceControls geo={G3} ent={ent} /></div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 px-4 py-3 border-t border-slate-100">
              {[["#CC0000","Primary Steel"],["#00ACC1","Roof Sheeting"],["#2E7D32","Side Cladding"]].map(([c,t])=><div key={t} className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm" style={{background:c}} />{t}</div>)}
              {enFt.map(f=><div key={f.id} className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm" style={{background:f.color}} />{f.label}</div>)}
              {ent.resolved.length>0&&<div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm" style={{background:"#334155"}} />Entrances</div>}
              <span className="ml-auto text-xs text-slate-400 italic">Click labels to explore</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-brand-blue rounded-2xl p-5 text-white">
              <div className="text-[10px] font-semibold text-red-300 uppercase tracking-wider mb-0.5">{cur?.name} — {cur?.sub}</div>
              <div className="text-sm font-bold mb-2">Practical: {cur?.practical}</div>
              <p className="text-xs text-red-100 leading-relaxed mb-3">{cur?.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                {[{l:"Width",v:`${wM}m`},{l:"Eave Ht.",v:`${eM}m`},{l:"Ridge Ht.",v:`+${G.ridgeM}m`},{l:"Pitch",v:`${pitch}° (${pr})`},{l:"Spans",v:`${spans} Bay${spans>1?"s":""}`},{l:"Roof",v:roof==="pitched"?"Pitched":"Mono"},{l:"Length",v:`${G3.length}m`},{l:"Entrances",v:`${ent.resolved.length}`},].map(({l,v})=><div key={l} className="bg-white/10 rounded-lg p-2"><div className="text-[9px] text-red-300 uppercase tracking-wide">{l}</div><div className="text-xs font-bold text-white mt-0.5">{v}</div></div>)}
              </div>
              {enFt.length>0&&<div className="mt-3 bg-white/10 rounded-lg p-2.5"><div className="text-[9px] text-red-300 uppercase tracking-wide mb-1">Active Components</div><div className="flex flex-wrap gap-1">{enFt.map(f=><span key={f.id} className="text-[10px] font-semibold px-2 py-0.5 rounded text-white" style={{background:f.color+"55"}}>{f.icon} {f.label}</span>)}</div></div>}
              <div className="mt-3 bg-white/10 rounded-lg p-2.5"><div className="text-[9px] text-red-300 uppercase tracking-wide">Covered Floor Area</div><div className="text-xs font-bold text-white mt-0.5">{(wM*G3.length).toLocaleString()} m²{mzArea>0&&<span className="ml-1.5 text-[11px] font-semibold text-violet-200">+ {mzArea.toLocaleString()} m² mezzanine</span>}</div></div>
            </div>
            <AnimatePresence>{lInfo&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="bg-amber-50 border border-brand-orange/30 rounded-xl p-4"><div className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">{lInfo.cat==="product"?"● Infinity Fabtech Product":lInfo.cat==="structure"?"● Structural Member":"● Roofing Component"}</div><div className="text-sm font-bold text-slate-800 mb-1">{lInfo.text}</div><p className="text-xs text-slate-600 leading-relaxed">{lInfo.detail}</p></motion.div>}</AnimatePresence>
            <AnimatePresence>{selDoor&&<motion.div key={selDoor.id} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="bg-amber-50 border border-brand-orange/30 rounded-xl p-4"><div className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">● Accessory</div><div className="text-sm font-bold text-slate-800 mb-1">{OPENING_KINDS[selDoor.kind].label} — {selDoor.width} × {selDoor.height} m</div><p className="text-xs text-slate-600 leading-relaxed mb-2">{WALLS.find(w=>w.id===selDoor.wall)?.label} ({isGable(selDoor.wall)?"gable wall":"sidewall"}). {PART_INFO.door.detail}</p><div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Products required</div><ul className="mt-1.5 space-y-1">{PART_INFO.door.products.map(p=><li key={p} className="flex items-center gap-2 text-xs text-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange flex-none" />{p}</li>)}</ul></motion.div>}</AnimatePresence>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Products for This Config</h4><ul className="space-y-1.5 max-h-48 overflow-y-auto">{prods(roof,spans,ft,ent.resolved.length).map(p=><li key={p} className="flex items-center gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange flex-none" />{p}</li>)}</ul></div>
            <a href="/contact" className="block text-center bg-brand-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-orange-light transition-colors duration-200 shadow-md shadow-brand-orange/25">Get Quote for This Config →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CrossSvg({G,G3,lbls,aId,tog,ft,cur,doors,selId,onPickDoor}:{G:G;G3:Geometry;lbls:Lbl[];aId:string|null;tog:(id:string|null)=>void;ft:Feat;cur:Preset;doors:ResolvedOpening[];selId:string|null;onPickDoor:(id:string)=>void;}){
  const{LX,RX,eY,aY,cXs,cTs,pts,rPts,rafs,spW,hw,sp,rf}=G;
  const bw=hw*2;
  // Real-metre model -> diagram pixels: horizontally linear, vertically scaled to the tallest column.
  const pxm=(RX-LX)/G3.width,X=(m:number)=>LX+(m+G3.width/2)*pxm,k=G.eh/G3.columnTops[0][1];
  const crY=eY+(GY-eY)*.30;
  // Annotations hang off the first crane bay (or the left column when there is no crane).
  const crLX=G3.cranes.length?X(G3.cranes[0].x1):LX;
  const roofYAt=(x:number)=>{for(const[x1,y1,x2,y2] of rafs){if(x>=Math.min(x1,x2)-.5&&x<=Math.max(x1,x2)+.5)return y1+(y2-y1)*((x-x1)/((x2-x1)||1));}return eY;};
  const doorCol=(d:ResolvedOpening)=>selId===d.id?"#F97316":d.kind==="roller"?"#334155":d.kind==="sliding"?"#0369A1":"#B45309";
  const canW=Math.min(hw*.22,68);
  const hasWM=sp>1;
  const d1=GY+22,d2=GY+34,d3=hasWM?GY+50:GY+44,d4=hasWM?GY+61:GY+54,capY=hasWM?GY+74:GY+62;
  const annEY=cTs[0][1];
  let cap=`${cur.name} | ${rf==="pitched"?"Pitched Roof":"Mono Slope Roof"}`;
  if(ft.mezzanine)cap+=` | Mezzanine Floor (${mezzLabel(G3)})`;if(ft.crane)cap+=` | EOT Crane (${craneLabel(G3)})`;if(ft.rcc)cap+=" | Rafter on RCC";
  cap+=` | Practical width – ${cur.practical}`;
  return(
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{maxHeight:420}}>
      <defs>
        <pattern id="gh" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><line x1="0" y1="12" x2="12" y2="0" stroke="#B0B0B0" strokeWidth=".8" /></pattern>
        <pattern id="rh" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="8" y2="8" stroke="#666" strokeWidth=".8" /><line x1="0" y1="8" x2="8" y2="0" stroke="#666" strokeWidth=".8" /></pattern>
      </defs>
      {/* White bg */}
      <rect width={VW} height={VH} fill="#FFFFFF" />
      {/* Ground */}
      <rect x={0} y={GY} width={VW} height={55} fill="#F0F0F0" />
      <rect x={0} y={GY} width={VW} height={55} fill="url(#gh)" opacity=".6" />
      <line x1={0} y1={GY} x2={VW} y2={GY} stroke="#555" strokeWidth="1.5" />
      {/* Interior fill */}
      <polygon points={pts} fill="#F8FDFF" opacity=".85" />
      {/* Canopy */}
      {ft.canopy&&<g><polygon points={`${LX},${annEY} ${LX-canW},${annEY+16} ${LX-canW},${annEY+24} ${LX},${annEY+7}`} fill="#8B5CF6" opacity=".72" /><line x1={LX-canW} y1={annEY+24} x2={LX-canW} y2={GY} stroke="#8B5CF6" strokeWidth="1.5" opacity=".45" /></g>}
      {/* Teal dotted roof sheeting */}
      <polyline points={rPts} fill="none" stroke="#00ACC1" strokeWidth="2.8" strokeDasharray="5,3" strokeLinejoin="round" />
      {/* GREEN side cladding */}
      <rect x={LX-CLW} y={cTs[0][1]} width={CLW} height={GY-cTs[0][1]} fill="#2E7D32" />
      <rect x={RX} y={cTs[cTs.length-1][1]} width={CLW} height={GY-cTs[cTs.length-1][1]} fill="#2E7D32" />
      {/* Insulation */}
      {ft.insulation&&rafs.map(([x1,y1,x2,y2],i)=><polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x2},${y2+RD+5} ${x1},${y1+RD+5}`} fill="#10B981" opacity=".22" />)}
      {/* Skylight */}
      {ft.skylight&&rafs[0]&&[.28,.62].map((t,i)=>{const[x1,y1,x2,y2]=rafs[0];return<line key={i} x1={x1+(x2-x1)*(t-.055)} y1={y1+(y2-y1)*(t-.055)} x2={x1+(x2-x1)*(t+.055)} y2={y1+(y2-y1)*(t+.055)} stroke="#7DD3FC" strokeWidth="12" strokeLinecap="round" opacity=".9" />;})}
      {/* RED columns */}
      {cXs.map((cx,i)=>{const[,yT]=cTs[i];const isO=i===0||i===sp;return ft.rcc&&isO?<g key={i}><rect x={cx-22} y={yT} width={44} height={GY-yT} fill="#E0E0E0" /><rect x={cx-22} y={yT} width={44} height={GY-yT} fill="url(#rh)" opacity=".7" /><rect x={cx-22} y={yT} width={44} height={GY-yT} fill="none" stroke="#555" strokeWidth="2" /><rect x={cx-26} y={yT-5} width={52} height={7} fill="#888" /></g>:<rect key={i} x={cx-CW/2} y={yT} width={CW} height={GY-yT} fill="#CC0000" />;})}
      {/* RED rafters as FILLED polygons (I-section depth) */}
      {rafs.map(([x1,y1,x2,y2],i)=><polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x2},${y2+RD} ${x1},${y1+RD}`} fill="#CC0000" />)}
      {/* Ridge connection blocks */}
      {rf==="pitched"&&Array.from({length:sp},(_,i)=>{const apX=LX+spW*i+spW/2;return<rect key={i} x={apX-CW/2} y={aY} width={CW} height={RD} fill="#AA0000" />;}) }
      {/* Valley Gutter */}
      {ft.valley&&cXs.slice(1,-1).map((vx,vi)=>{const vy=cTs[vi+1][1];return<g key={vi}><polygon points={`${vx-16},${vy-8} ${vx},${vy+12} ${vx+16},${vy-8}`} fill="#0369A1" opacity=".88" /><text x={vx} y={vy-15} textAnchor="middle" fontSize="9" fill="#0369A1" fontFamily="Arial" fontWeight="700">Valley Gutter</text></g>;})}
      {/* Mezzanine — half / bay / full width, with its own posts, guardrail and stair */}
      {ft.mezzanine&&G3.mezzanines.map((m3,di)=>{
        const mezY=GY-m3.y*k,mzLX=X(m3.x1),mzRX=X(m3.x2),mzW=mzRX-mzLX,hr=1.07*k;
        // Deck edges sit inside the column flange where they meet a main column line.
        const eL=mzLX+(m3.openL&&!G3.columnXs.some(c=>Math.abs(c-m3.x1)<.3)?0:CW/2),eR=mzRX-(m3.openR&&!G3.columnXs.some(c=>Math.abs(c-m3.x2)<.3)?0:CW/2);
        const rail=(ex:number)=><g key={ex} stroke="#EAB308" strokeWidth="2"><line x1={ex} y1={mezY} x2={ex} y2={mezY-hr} /><line x1={ex-7} y1={mezY-hr} x2={ex+7} y2={mezY-hr} /><line x1={ex-7} y1={mezY-hr*.5} x2={ex+7} y2={mezY-hr*.5} strokeWidth="1.2" /></g>;
        const stairL=m3.openL;
        return<g key={di}>
          <rect x={eL} y={mezY} width={eR-eL} height={10} fill="#7C3AED" rx="1" opacity=".9" />
          <rect x={eL} y={mezY+10} width={eR-eL} height={GY-mezY-18} fill="#7C3AED" opacity=".04" />
          {m3.posts.map(px=><line key={px} x1={X(px)} y1={mezY+10} x2={X(px)} y2={GY} stroke="#7C3AED" strokeWidth="3" opacity=".4" />)}
          {m3.openL&&rail(eL)}
          {m3.openR&&rail(eR)}
          {(m3.openL||m3.openR)&&<text x={stairL?eL-5:eR+5} y={mezY+25} textAnchor={stairL?"end":"start"} fontSize="7.5" fill="#7C3AED" fontFamily="Arial" fontStyle="italic">Stair</text>}
          {!m3.openL&&!m3.openR&&<g><rect x={eL+6} y={mezY-hr} width={22} height={hr} fill="none" stroke="#EAB308" strokeWidth="1.4" strokeDasharray="3,2" /><text x={eL+6} y={mezY-hr-4} fontSize="7.5" fill="#A16207" fontFamily="Arial" fontStyle="italic">Stairwell</text></g>}
          <text x={mzLX+mzW/2} y={mezY-7} textAnchor="middle" fontSize="9" fill="#7C3AED" fontFamily="Arial" fontWeight="700">Mezzanine Floor</text>
        </g>;
      })}
      {/* EOT Cranes — one per selected span; each hook works over open floor or stops above a deck */}
      {ft.crane&&G3.cranes.map((cr,ci)=>{
        const cl=X(cr.x1),crSpW=X(cr.x2)-cl,crTX=X(cr.hook.x)-27;
        const hb=cr.hook.deck?Math.max(crY+16,Math.min(crY+52,GY-cr.hook.deck.y*k-16)):crY+52;
        return<g key={ci}>
        <rect x={cl+CW/2} y={crY} width={crSpW-CW} height={9} fill="#C026D3" opacity=".92" rx="1" />
        <rect x={cl+CW/2} y={crY+9} width={crSpW-CW} height={5} fill="#9D174D" opacity=".4" rx="1" />
        <rect x={crTX} y={crY-12} width={54} height={16} fill="#C026D3" rx="2" opacity=".95" />
        <text x={crTX+27} y={crY-18} textAnchor="middle" fontSize="9" fill="#C026D3" fontFamily="Arial" fontWeight="700">E.O.T. Crane</text>
        <circle cx={crTX+11} cy={crY+13} r={5.5} fill="#7E22CE" /><circle cx={crTX+43} cy={crY+13} r={5.5} fill="#7E22CE" />
        <line x1={crTX+27} y1={crY+7} x2={crTX+27} y2={hb} stroke="#7E22CE" strokeWidth="2" />
        <rect x={crTX+20} y={hb} width={14} height={10} fill="#7E22CE" rx="1" opacity=".85" />
        {ci===0&&<>
        <line x1={crLX+30} y1={annEY} x2={crLX+30} y2={crY} stroke="#C026D3" strokeWidth="1" strokeDasharray="3,2" />
        <line x1={crLX+25} y1={annEY} x2={crLX+35} y2={annEY} stroke="#C026D3" strokeWidth="1" />
        <line x1={crLX+25} y1={crY} x2={crLX+35} y2={crY} stroke="#C026D3" strokeWidth="1" />
        <text x={crLX+39} y={(annEY+crY)/2+4} fontSize="8" fill="#C026D3" fontFamily="Arial" fontWeight="600">Bracket Ht.</text>
        <line x1={crLX+30} y1={crY+15} x2={crLX+30} y2={GY} stroke="#C026D3" strokeWidth="1" strokeDasharray="2,2" opacity=".6" />
        <text x={crLX+39} y={(crY+GY)/2+4} fontSize="8" fill="#C026D3" fontFamily="Arial">Clear Ht.</text>
        </>}
        </g>;
      })}
      {/* Ridge ventilator */}
      {ft.ventilator&&rafs.filter((_,i)=>i%2===0).map(([,,x2,y2])=><g key={x2}><polygon points={`${x2-11},${y2+2} ${x2+11},${y2+2} ${x2},${y2-18}`} fill="#EF4444" opacity=".88" /><rect x={x2-3.5} y={y2-18} width={7} height={24} fill="#EF4444" rx="1" opacity=".75" /><text x={x2} y={y2-24} textAnchor="middle" fontSize="7.5" fill="#EF4444" fontFamily="Arial">Vent</text></g>)}
      {/* Entrances: sidewall doors sit in the cladding; gable doors are seen beyond the section plane (dashed) */}
      {doors.map(d=>{
        const on=selId===d.id,col=doorCol(d),label=OPENING_KINDS[d.kind].label;
        if(d.wall==="left"||d.wall==="right"){
          const colTop=d.wall==="left"?cTs[0][1]:cTs[cTs.length-1][1];
          const hp=Math.min(d.height*k,GY-colTop-8),x=d.wall==="left"?LX-CLW-5:RX-5;
          return<g key={d.id} onClick={()=>onPickDoor(d.id)} style={{cursor:"pointer"}} role="button"><title>{`${label} — ${d.width} × ${d.height} m (${d.wall} side)`}</title><rect x={x} y={GY-hp} width={CLW+10} height={hp} fill="#fff" fillOpacity=".92" stroke={col} strokeWidth={on?2.5:1.4} strokeDasharray="4,2" /><text x={x+(CLW+10)/2} y={GY-hp-3} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={col} fontFamily="Arial">{d.kind==="personnel"?"Door":d.kind==="roller"?"Roller":"Sliding"}</text></g>;
        }
        const wpx=d.width*pxm,cx=X(d.at),hp=Math.max(10,Math.min(d.height*k,GY-roofYAt(cx)-RD-6));
        return<g key={d.id} onClick={()=>onPickDoor(d.id)} style={{cursor:"pointer"}} role="button"><title>{`${label} — ${d.width} × ${d.height} m (${d.wall} end)`}</title><rect x={cx-wpx/2} y={GY-hp} width={wpx} height={hp} fill={col} fillOpacity={on?.22:.1} stroke={col} strokeWidth={on?2.5:1.4} strokeDasharray="5,3" />{wpx>44&&<text x={cx} y={GY-hp+11} textAnchor="middle" fontSize="8" fontWeight="700" fill={col} fontFamily="Arial">{label} · {d.wall==="front"?"Front":"Back"}</text>}</g>;
      })}
      {/* ── PDF ANNOTATIONS ── */}
      {/* EAVE HEIGHT (outside left) */}
      <line x1={LX-36} y1={GY} x2={LX-36} y2={annEY} stroke="#333" strokeWidth="1" />
      <line x1={LX-30} y1={GY} x2={LX-42} y2={GY} stroke="#333" strokeWidth="1" />
      <line x1={LX-30} y1={annEY} x2={LX-42} y2={annEY} stroke="#333" strokeWidth="1" />
      <polygon points={`${LX-33},${GY-7} ${LX-39},${GY-7} ${LX-36},${GY}`} fill="#333" />
      <polygon points={`${LX-33},${annEY+7} ${LX-39},${annEY+7} ${LX-36},${annEY}`} fill="#333" />
      <text x={LX-50} y={(GY+annEY)/2+4} fontSize="9" fill="#333" textAnchor="middle" fontFamily="Arial" transform={`rotate(-90 ${LX-50} ${(GY+annEY)/2})`}>Eave Ht.</text>
      {/* CLEAR HEIGHT (inside, no crane) */}
      {!ft.crane&&<>
        <line x1={LX+30} y1={GY} x2={LX+30} y2={annEY+RD} stroke="#333" strokeWidth="1" strokeDasharray="4,2" />
        <line x1={LX+24} y1={GY} x2={LX+36} y2={GY} stroke="#333" strokeWidth="1" />
        <line x1={LX+24} y1={annEY+RD} x2={LX+36} y2={annEY+RD} stroke="#333" strokeWidth="1" />
        <polygon points={`${LX+27},${GY-7} ${LX+33},${GY-7} ${LX+30},${GY}`} fill="#333" />
        <polygon points={`${LX+27},${annEY+RD+7} ${LX+33},${annEY+RD+7} ${LX+30},${annEY+RD}`} fill="#333" />
        <text x={LX+44} y={(GY+annEY+RD)/2+4} fontSize="9" fill="#333" fontFamily="Arial">Clear Ht.</text>
      </>}
      {/* F.F.L. */}
      <line x1={LX+18} y1={GY} x2={LX+62} y2={GY} stroke="#333" strokeWidth="1.2" />
      <text x={LX+22} y={GY-4} fontSize="9" fill="#333" fontFamily="Arial" fontWeight="700">F.F.L.</text>
      {/* Building Width */}
      <line x1={LX} y1={d1} x2={RX} y2={d1} stroke="#333" strokeWidth="1" />
      <line x1={LX} y1={d1-5} x2={LX} y2={d1+5} stroke="#333" strokeWidth="1" />
      <line x1={RX} y1={d1-5} x2={RX} y2={d1+5} stroke="#333" strokeWidth="1" />
      <polygon points={`${LX+9},${d1-3} ${LX+9},${d1+3} ${LX},${d1}`} fill="#333" />
      <polygon points={`${RX-9},${d1-3} ${RX-9},${d1+3} ${RX},${d1}`} fill="#333" />
      <text x={MX} y={d2} textAnchor="middle" fontSize="9.5" fill="#222" fontFamily="Arial">Building Width (O/O)</text>
      <text x={MX} y={d2+11} textAnchor="middle" fontSize="9" fill="#555" fontFamily="Arial">{'( '+(sp===1?"Clear Span":`Multi Span : MS-${sp}`)+' )'}</text>
      {/* Width Module */}
      {hasWM&&Array.from({length:sp},(_,i)=>{const sL=LX+spW*i,sR=sL+spW,mX=(sL+sR)/2;return<g key={i}><line x1={sL} y1={d3} x2={sR} y2={d3} stroke="#555" strokeWidth=".9" /><line x1={sL} y1={d3-4} x2={sL} y2={d3+4} stroke="#555" strokeWidth=".9" /><line x1={sR} y1={d3-4} x2={sR} y2={d3+4} stroke="#555" strokeWidth=".9" /><polygon points={`${sL+8},${d3-3} ${sL+8},${d3+3} ${sL},${d3}`} fill="#555" /><polygon points={`${sR-8},${d3-3} ${sR-8},${d3+3} ${sR},${d3}`} fill="#555" /><text x={mX} y={d4} textAnchor="middle" fontSize="8.5" fill="#555" fontFamily="Arial">Width Module</text></g>;})}
      {/* Caption box */}
      <rect x={LX} y={capY} width={bw} height={22} fill="white" stroke="#444" strokeWidth="1" rx="1" />
      <text x={MX} y={capY+14.5} textAnchor="middle" fontSize={Math.min(8.5,(bw-12)/(cap.length*.56))} fill="#222" fontFamily="Arial" fontWeight="bold">{cap}</text>
      {/* Clickable labels */}
      {lbls.map(l=>{
        const isA=aId===l.id;
        const col=l.cat==="structure"?"#0B2545":l.cat==="roofing"?"#0891B2":"#F26419";
        const lw=l.text.length*5.2+12,anch=l.anchor||"middle";
        const rx=anch==="start"?l.tx:anch==="end"?l.tx-lw:l.tx-lw/2;
        return<g key={l.id} onClick={()=>tog(l.id)} style={{cursor:"pointer"}} role="button">
          <line x1={l.px} y1={l.py} x2={l.tx} y2={l.ty} stroke={col} strokeWidth={isA?1.5:1} strokeDasharray="3,3" opacity={isA?1:.7} />
          {isA&&<circle cx={l.px} cy={l.py} r={12} fill="none" stroke={col} strokeWidth="1.5" opacity=".22" />}
          <circle cx={l.px} cy={l.py} r={isA?7:4.5} fill={col} opacity={isA?1:.88} />
          <rect x={rx} y={l.ty-10} width={lw} height={15} fill={isA?col:"white"} stroke={col} strokeWidth={isA?0:.9} rx="3" />
          <text x={anch==="start"?l.tx+2:anch==="end"?l.tx-2:l.tx} y={l.ty+2} fontSize="8.5" fontWeight="600" fill={isA?"white":col} fontFamily="Arial" textAnchor={anch}>{l.text}</text>
        </g>;
      })}
    </svg>
  );
}



function Slider({label,value,min,max,step,unit,color,onChange}:{label:string;value:number;min:number;max:number;step:number;unit:string;color:string;onChange:(v:number)=>void;}){
  const pct=((value-min)/(max-min))*100;
  return<div><div className="flex justify-between items-center mb-2"><label className="text-xs font-semibold text-slate-600">{label}</label><span className="text-sm font-bold tabular-nums" style={{color}}>{value}{unit}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{background:`linear-gradient(to right,${color} 0%,${color} ${pct}%,#E2E8F0 ${pct}%,#E2E8F0 100%)`}} /><div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>{min}{unit}</span><span>{max}{unit}</span></div></div>;
}

/** Per-span on/off chips plus an "All Spans" shortcut; at least one span stays selected. */
function SpanChips({spans,picked,color,onToggle,onAll}:{spans:number;picked:number[];color:string;onToggle:(i:number)=>void;onAll:()=>void;}){
  const all=picked.length===spans;
  const cls=(on:boolean)=>`rounded-md border px-2.5 py-1 text-[11px] font-bold transition-all ${on?"border-transparent text-white":"border-slate-200 text-slate-600 hover:border-slate-300"}`;
  return<>{Array.from({length:spans},(_,i)=>{const on=picked.includes(i);return<button key={i} aria-pressed={on} title={on&&picked.length===1?"At least one span stays selected":undefined} onClick={()=>onToggle(i)} className={cls(on)} style={on?{background:color}:undefined}>{on?"✓ ":"+ "}Span {i+1}</button>;})}<button aria-pressed={all} onClick={onAll} className={cls(all)} style={all?{background:color}:undefined}>All Spans</button></>;
}
